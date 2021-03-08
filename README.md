# Expense Tracker (React + Serverless AWS)

This application is a simple expenses tracker create with React and backed by serverless services on AWS.

# Functionality of the application

This application will allow adding/removing/updating/fetching financial transactions within your account. Each transaction can optionally have an attachment image for receipts. Each user only has access to transactions in his/her account.

# Transaction items

The application should store financial transactions, and each transaction contains the following fields:

* `transactionId` (string) - a unique id for a transaction
* `userId` (string) - a unique id for the account's owner
* `createdAt` (string) - date and time when a transaction was created
* `modifiedAt` (string) - date and time when a transaction was edited
* `description` (string) - description of a transaction (e.g. "Cable TV bill")
* `amount` (integer) - transaction amount (negative for expenses, positive for incomes)
* `type` (string) - income if a transaction has a positive amount, expense otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a transaction

# Lambda Functions

* `Auth` - this function should implement a custom authorizer for API Gateway that should be added to all other functions.

* `GetTransactions` - should return all transactions for a current user.

It should return data that looks like this:

```json
{
  "items": [
    {
      "transactionId": "123",
      "userId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "modifiedAt": "2019-07-27T20:01:45.424Z",
      "descrition": "Energy bill",
      "amount": -50.00,
      "type": "Expense",
      "attachmentUrl": "http://example.com/image.png"
    },
    {
      "transactionId": "123",
      "userId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "modifiedAt": "2019-07-27T20:01:45.424Z",
      "descrition": "Salary",
      "amount": 1000.00,
      "type": "Income",
      "attachmentUrl": "http://example.com/image.png"
    },
  ]
}
```

* `GetTransaction` - should return a single existing transaction by ID. The transaction id that should be updated is passed as a URL parameter.

It should return data that looks like this:

```json
{
  "item": 
    {
      "transactionId": "123",
      "userId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "modifiedAt": "2019-07-27T20:01:45.424Z",
      "descrition": "Energy bill",
      "amount": -50.00,
      "type": "Expense",
      "attachmentUrl": "http://example.com/image.png"
    }
}
```

* `CreateTransaction` - should create a new transaction for a current user. The format of data send by a client application to this function can be found in the `CreateTransactionRequest.ts` file

It receives a new transaction to be created in JSON format that looks like this:

```json
{
  "userId": "123",
  "createdAt": "2019-07-27T20:01:45.424Z",
  "description": "parking",
  "amount": -10
}
```

It should return a new transaction item that looks like this:

```json
{
  "item": {
      "transactionId": "123",
      "userId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "modifiedAt": "2019-07-27T20:01:45.424Z",
      "descrition": "parking",
      "amount": -10.00,
      "type": "Expense",
      "attachmentUrl": "http://example.com/image.png"
    }
}
```

* `UpdateTransaction` - should update a transaction created by a current user. The format of data send by a client application to this function can be found in the `UpdateTodoRequest.ts` file

It receives an object that contains three fields that can be updated:

```json
{
  "description": "Subscription fee",
  "amount": -20
}
```

The transaction id that should be updated is passed as a URL parameter.

It should return the updated item.
```json
{
  "item": {
      "transactionId": "123",
      "userId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "modifiedAt": "2019-07-27T20:01:45.424Z",
      "descrition": "Subscription fee",
      "amount": -20.00,
      "type": "Expense",
      "attachmentUrl": "http://example.com/image.png"
    }
}
```

* `DeleteTransaction` - should delete a transaction created by a current user. Expects an id of a transaction to remove.

It should return an empty body.

* `GetBalance` - returns the calculated balance of user's account.

It should return a JSON object that looks like this:

```json
{
  "balance": 1100.00,
  "incomes": 2000.00,
  "expense": -900.00
}
```

* `SearchTransactions` - should return all transactions that match the search term. The search term is passed as a URL parameter.

It should return data that looks like this:

```json
{
  "items": [
    {
      "transactionId": "123",
      "userId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "modifiedAt": "2019-07-27T20:01:45.424Z",
      "descrition": "Energy bill",
      "amount": -50.00,
      "type": "Expense",
      "attachmentUrl": "http://example.com/image.png"
    },
    {
      "transactionId": "123",
      "userId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "modifiedAt": "2019-07-27T20:01:45.424Z",
      "descrition": "Salary",
      "amount": 1000.00,
      "type": "Income",
      "attachmentUrl": "http://example.com/image.png"
    },
  ]
}
```

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a transaction.

It should return a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```


# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

Implemented using asymmetrically encrypted Auth0 JWT tokens.

## Logging

Logs are created using [Winston](https://github.com/winstonjs/winston) logger which creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. All logs are streamed to ElasticSearch in order to be queried using Kibana.

![Alt text](images/Kibana.png?raw=true "Logging Kibana")

## CI/CD

CI/CD pipeline implemented with TravisCI. Changes to the master branch trigger the Serverless build and deploy to AWS process.

![Alt text](images/TravisCI.png?raw=true "CI/CD TravisCI")

Integration tests were implemented using Postman (Newman package) in order to garantee that all integration are working after each new deploy.
![Alt text](images/Postman.png?raw=true "CI/CD Postman")

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```
