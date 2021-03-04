import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTransactions } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTransactions.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all transaction items for a current user
  logger.info('Get all transactions')

  const items = await getTransactions(event)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: items
    })
  };

})

handler.use(
  cors({
    credentials: true
  })
)
