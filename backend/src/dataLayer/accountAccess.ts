import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('accountAccess')

export default class AccountAccess {
  constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly transactionsTable = process.env.TRANSACTIONS_TABLE,
      private readonly userIDIndexName = process.env.USERID_INDEX,
      private readonly accountStorage = process.env.IMAGES_S3_BUCKET
  ) {}

  async addTransactionToDB(transactionItem) {
    logger.info('Inserting new transaction into db ', {transactionItem: transactionItem} )

    await this.docClient.put({
        TableName: this.transactionsTable,
        Item: transactionItem
    }).promise();
  }

  async deleteTransactionFromDB(transactionId, userId) {
    logger.info('Removing transaction from db', { transactionId: transactionId, userId: userId})

    await this.docClient.delete({
        TableName: this.transactionsTable,
        Key: {
            transactionId,
            userId
        }
    }).promise();
  }

  async getTransactionFromDB(transactionId, userId) {
    logger.info('Retrieving transaction from db', { transactionId: transactionId, userId: userId})

    const result = await this.docClient.get({
        TableName: this.transactionsTable,
        Key: {
            transactionId,
            userId
        }
    }).promise();

    return result.Item;
  }

  async getAllTransactionsFromDB(userId) {
    logger.info('Retrieving all transactions from db by userID', {userId: userId})
    var indexName = this.userIDIndexName

    const result = await this.docClient.query({
        TableName: this.transactionsTable,
        IndexName: indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();

    return result.Items;
  }

  async updateTransactionInDB(transactionId, userId, updatedTransaction) {
    logger.info('Updating transaction into db', { transactionId: transactionId, userId: userId})
    
    await this.docClient.update({
        TableName: this.transactionsTable,
        Key: {
            transactionId,
            userId
        },
        UpdateExpression: 'set #description = :description, #amount = :amount, #type = :type',
        ExpressionAttributeValues: {
            ':description': updatedTransaction.description,
            ':amount': updatedTransaction.amount,
            ':type': updatedTransaction.type
        },
        ExpressionAttributeNames: {
            '#description': 'description',
            '#amount': 'amount',
            '#type': 'type'
        }
    }).promise();
  }

  async updateTransactionAttachmentUrl(transactionId, attachmentUrl){
    logger.info('Updating transaction url into db', { transactionId: transactionId, attachmentUrl: attachmentUrl})

    await this.docClient.update({
        TableName: this.transactionsTable,
        Key: {
            "transactionId": transactionId
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            ":attachmentUrl": `https://${this.accountStorage}.s3.amazonaws.com/${attachmentUrl}`
        }
    }).promise();
  }

  async getBatchItems(items){
    logger.info('Get batch transactions', { items: items })

    const itemsId = items.map( (transaction) => { return {transactionId: transaction.transactionId} })

    const result = await this.docClient.batchGet({
        RequestItems: {
            [this.transactionsTable]: {
            Keys: itemsId,
          }
        }
      }).promise();

      logger.info('Returned transactions', { result: result})

      return result
  }
}