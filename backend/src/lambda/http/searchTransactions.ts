import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { searchTransaction } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('searchTransactions.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Search transactions by term')

  const items = await searchTransaction(event)

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