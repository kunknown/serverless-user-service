import { TranslateConfig } from "@aws-sdk/lib-dynamodb";

export const JEST_DYNAMO_DB_CLIENT_CONFIG = {
  endpoint: 'http://localhost:8001',
  region: 'local-env',
  credentials: {
    accessKeyId: 'fakeAccessKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
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
