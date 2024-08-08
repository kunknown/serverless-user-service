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

