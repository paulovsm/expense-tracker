import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTransaction } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTransaction.handler')

export const handler= middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const transactionId = event.pathParameters.transactionId;

  // TODO: Remove a TODO item by id
  const success = await deleteTransaction(event)

  if (!success) {
    logger.warn('cannot delete transaction', {transactionId: transactionId} )
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Transaction does not exist'
      })
    };
  }

  logger.info('delete transaction', {transactionId: transactionId} )

  return {
    statusCode: 202,
    body: JSON.stringify({})
  };

})

handler.use(
  cors({
    credentials: true
  })
)
