import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getTransaction } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTransaction.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const transactionId = event.pathParameters.transactionId

  const transactionItem = await getTransaction(event);

  if (!transactionItem) {
    logger.warn('Cannot find transaction', {transactionId: transactionId})
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Transaction does not exist'
      })
    };
  }

  logger.info('Get transaction', {transaction: transactionItem})

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: transactionItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
