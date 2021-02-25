import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTransactionRequest } from '../../requests/CreateTransactionRequest'
import { createTransaction } from '../../businessLogic/account';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo.handler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTransactionRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  logger.info('create to-do', {todoRequest: newTodo} )
  const todo = await createTransaction(event, newTodo);

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: todo
    })
  };
})

handler.use(
  cors({
    credentials: true
  })
)
