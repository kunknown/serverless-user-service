# Serverless Framework Node Express API on AWS using DynamoDB, Lambda, API Gateway, and IAM
This is a CRUD (Create, Read, Update, Delete) User microservice hosted on AWS (Lambda, DynamoDB, API Gateway, and IAM) using Serverless framework, Node.js, Express, JavaScript, TypeScript, Zod, and Jest (DynamoDB local).

## Prerequisite
1. Node.js version 20.x or newer - [link](https://nodejs.org/en/download/prebuilt-installer/current)
2. Java Runtime Environment (JRE) version 17.x or newer - [link](https://www.oracle.com/java/technologies/downloads/)
3. DynamoDB local version 2.x or newer - [link](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)
4. AWS CLI version 2.x or newer - [link](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
5. AWS Account - [link](https://signin.aws.amazon.com/signup?request_type=register)

## Setup
1. Clone repository using `git clone https://github.com/kunknown/serverless-user-service.git`.
2. Install dependencies using `npm install`.
3. TODO: link AWS CLI to AWS account
4. Add mock credentials to AWS CLI using `npm run aws:config`:
  - AWS Access Key ID [None]: mockAccessKeyId
  - AWS Secret Access Key [None]: mockSecretAccessKey
  - Default region name [None]: local-env
  - Default output format [None]: json
5. Extract the downloaded DynamoDB local (.zip or similar) file in the `dynamodb-local` folder.
6. Start local DynamoDB using `npm run db:local`, then create a new table using `npm run db:create-table`.

## Deployment
1. Deploy to your AWS using `npm run deploy`.

## Local Testing
1. Switch to the "users" folder using `cd ./users/`.
2. If not already running, start local DynamoDB using `npm run db:local`. NOTE: DynamoDB local runs on port 8001.
4. Start local Lambda using `npm run dev`.

## Unit Testing
1. Switch to the "users" folder using `cd ./users/`.
2. If not already running, start local DynamoDB using `npm run db:local`. NOTE: DynamoDB local runs on port 8001.
3. Run all Jest unit tests using `npm run test`.