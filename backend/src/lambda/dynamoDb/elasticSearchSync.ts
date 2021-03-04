import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'
import { createLogger } from '../../utils/logger'

const logger = createLogger('elasticSearchSync.handler')

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  logger.info('Processing events batch from DynamoDB', {event: event})

  for (const record of event.Records) {
    logger.info('Processing record', {record: record})

    if (record.eventName !== 'INSERT') {
      continue
    }

    const newItem = record.dynamodb.NewImage

    const transactionId = newItem.transactionId.S

    const body = {
        userId: newItem.userId.S,
        transactionId: newItem.transactionId.S,
        description: newItem.description.S,
        amount: newItem.amount.N,
        type: newItem.type.S,
        createdAt: newItem.createdAt.S,
        modifiedAt: newItem.modifiedAt.S
    }

    await es.index({
        index: 'transactions-index',
        type: 'transaction',
        id: transactionId,
        body
    })

  }
}
