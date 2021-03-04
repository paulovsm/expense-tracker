import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getAccountBalance } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getBalance.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get account balance')

  const account = await getAccountBalance(event)

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...account
    })
  };

})

handler.use(
  cors({
    credentials: true
  })
)
