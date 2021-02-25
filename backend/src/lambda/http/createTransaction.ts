import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTransactionRequest } from '../../requests/CreateTransactionRequest'
import { createTransaction } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTransaction.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTransaction: CreateTransactionRequest = JSON.parse(event.body)

  logger.info('create transaction', {transactionRequest: newTransaction} )
  const trans = await createTransaction(event, newTransaction);

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: trans
    })
  };
})

handler.use(
  cors({
    credentials: true
  })
)
