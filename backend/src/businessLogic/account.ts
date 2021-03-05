import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';
import AccountAccess from '../dataLayer/accountAccess';
import AccountES from '../dataLayer/accountES';
import AccountStorage from '../dataLayer/accountStorage';
import { getUserId } from '../lambda/utils';
import { CreateTransactionRequest } from '../requests/CreateTransactionRequest';
import { UpdateTransactionRequest } from '../requests/UpdateTransactionRequest';
import { CreateSignedURLRequest } from '../requests/CreateSignedURLRequest';
import { TransactionItem } from '../models/TransactionItem';
import { createLogger } from '../utils/logger'

const accountAccess = new AccountAccess();
const accountStorage = new AccountStorage();
const accountES = new AccountES();
const logger = createLogger('transactionsBusinessLogic')

export async function createTransaction(event: APIGatewayProxyEvent, createTransactionRequest: CreateTransactionRequest): Promise<TransactionItem> {
    const transactionId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();
    const modifiedAt = createdAt
    const bucketName = await accountStorage.getBucketName();
    const type = createTransactionRequest.amount < 0 ? "Expense" : "Income"

    const transactionItem = {
        userId,
        transactionId,
        createdAt,
        modifiedAt,
        type,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${transactionId}`,
        ...createTransactionRequest
    };
    
    logger.info('Create Transaction', {userId: userId, transaction: transactionItem, bucketname: bucketName} )
    
    await accountAccess.addTransactionToDB(transactionItem);

    return transactionItem;
}

export async function deleteTransaction(event: APIGatewayProxyEvent) {
    const transactionId = event.pathParameters.transactionId;
    const userId = getUserId(event);

    const transactionExist = await accountAccess.getTransactionFromDB(transactionId, userId)

    if (!transactionExist) {
        logger.warn('Transaction not found', {userId: userId, transactionId: transactionId} )
        return false;
    }

    logger.info('Delete Transaction', {userId: userId, transactionId: transactionId} )

    await accountAccess.deleteTransactionFromDB(transactionId, userId);

    return true;
}

export async function getTransaction(event: APIGatewayProxyEvent) {
    const transactionId = event.pathParameters.transactionId;
    const userId = getUserId(event);

    logger.info('Get Transaction by ID', {userId: userId, transactionId: transactionId} )

    return await accountAccess.getTransactionFromDB(transactionId, userId);
}

export async function getTransactions(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);

    logger.info('Get all Transactions', {userId: userId} )

    return await accountAccess.getAllTransactionsFromDB(userId);
}

export async function updateTransaction(event: APIGatewayProxyEvent,
                                 updateTransactionRequest: UpdateTransactionRequest) {
    const transactionId = event.pathParameters.transactionId;
    const userId = getUserId(event);

    const transactionItem = await accountAccess.getTransactionFromDB(transactionId, userId)

    if (!transactionItem) {
        logger.warn('Transaction not found', {userId: userId, transactionId: transactionId} )
        return null;
    }

    logger.info('Update Transaction', {userId: userId, transactionId: transactionId} )

    updateTransactionRequest.type = updateTransactionRequest.amount < 0 ? "Expense" : "Income"

    await accountAccess.updateTransactionInDB(transactionId, userId, updateTransactionRequest);

    transactionItem.description = updateTransactionRequest.description
    transactionItem.amount = updateTransactionRequest.amount
    transactionItem.type = updateTransactionRequest.type

    return transactionItem;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent): Promise<string> {
    const bucketName = await accountStorage.getBucketName();
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
    const transactionId = event.pathParameters.transactionId;

    const createSignedUrlRequest: CreateSignedURLRequest = {
        Bucket: bucketName,
        Key: transactionId,
        Expires: parseInt(urlExpiration)
    }

    logger.info('Generate upload url', {bucketName: bucketName, transactionId: transactionId} )

    return await accountStorage.getSignedUploadURL(createSignedUrlRequest);
}

export async function searchTransaction(event: APIGatewayProxyEvent) {
    const queryString = event.queryStringParameters? event.queryStringParameters.q : "";

    logger.info('Search Transaction', {queryString: queryString} )

    const matchedItems: Array<any> = await accountES.search(queryString)

    if (!matchedItems || matchedItems.length == 0) {
        return []
    }

    var result = []

    for (const item of matchedItems) {
        result.push(await accountAccess.getTransactionFromDB(item.transactionId, item.userId))
    }

    result = result.filter(res => !!res)

    return result;
}

export async function getAccountBalance(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);
    var account: any = {}

    logger.info('Get account Balance', {userId: userId} )

    try {

        const transactions = await accountAccess.getAllTransactionsFromDB(userId)

        const amounts = transactions.map(transaction => transaction.amount);

        const balance = amounts.reduce((acc, item) => (acc += item), 0);

        const income = amounts
            .filter(item => item > 0)
            .reduce((acc, item) => (acc += item), 0);

        const expense = amounts
            .filter(item => item < 0)
            .reduce((acc, item) => (acc += item), 0);

        account = {
            balance: parseFloat(balance.toFixed(2)),
            income: parseFloat(income.toFixed(2)),
            expense: parseFloat(expense.toFixed(2))
        }

        logger.info('Current account Balance', {userId: userId, account: account})

    } catch (error) {
        logger.error('Error calculating account balance', {userId: userId, error: error})
        account = {
            balance: 0.00,
            income: 0.00,
            expense: 0.00
        }

    }

    return account;
}