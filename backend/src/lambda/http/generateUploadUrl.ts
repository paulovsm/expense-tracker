import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { generateUploadUrl } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl.handler')

export const handler =  middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const transactionId = event.pathParameters.transactionId

  const theSignedUrl = await generateUploadUrl(event);

  logger.info('Get image upload url', {transactionId: transactionId})

  return {
    statusCode: 202,
    body: JSON.stringify({
      uploadUrl: theSignedUrl
    })
  };
})

handler.use(
  cors({
    credentials: true
  })
)
