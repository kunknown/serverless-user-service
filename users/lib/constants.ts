import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { TranslateConfig } from "@aws-sdk/lib-dynamodb";

export const DEV_DB_CLIENT_CONFIG: DynamoDBClientConfig = {
  endpoint: 'http://localhost:8001',
  region: 'local-env',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fakeAccessKeyId',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fakeSecretAccessKey',
  }
};

export const JEST_DYNAMO_DB_DOCUMENT_CLIENT_TRANSLATE_CONFIG: TranslateConfig = {
  marshallOptions: {
    convertEmptyValues: true,
    convertClassInstanceToMap: true
  }};

  export const USER_EXPRESSION_NAMES: {[key: string]: string} = {
    userId: 'UI',
    firstName: 'FN',
    lastName: 'LN',
    email: 'E',
    dob: 'DOB',
    createdAt: 'CA',
    updatedAt: 'UA',
  }
