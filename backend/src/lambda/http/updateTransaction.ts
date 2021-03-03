import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTransactionRequest } from '../../requests/UpdateTransactionRequest'
import { updateTransaction } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTransaction.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const transactionId = event.pathParameters.transactionId
  const updatedTransaction: UpdateTransactionRequest = JSON.parse(event.body)

  const updatedItem = await updateTransaction(event, updatedTransaction);

  if (!updatedItem) {
    logger.warn('Cannot update transaction', {transactionId: transactionId})
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Job does not exist'
      })
    };
  }

  logger.info('Update transaction', {transactionId: transactionId})

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: updatedItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
