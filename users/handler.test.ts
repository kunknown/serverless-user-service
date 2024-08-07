import { Request, Response } from 'express';
import { DynamoDBDocument, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient as testDocClient, getUser, Params, User } from './handler';
import { DynamoDB, DynamoDBClient } from '@aws-sdk/client-dynamodb';

const Item: User = { userId: "1", firstName: 'kush', lastName: 'patel', email: 'kush.patel@gmail.com', dob: new Date('2024-08-07T10:48:39.501Z'), createdAt: new Date('2024-08-07T10:48:39.501Z'), updatedAt: new Date('2024-08-07T10:48:39.501Z') }

// const mockSend = jest.fn().mockResolvedValue({Item});
// jest.mock('@aws-sdk/lib-dynamodb', () => {
//   const Item: User = { userId: "1", firstName: 'kush', lastName: 'patel', email: 'kush.patel@gmail.com', dob: new Date('2024-08-07T10:48:39.501Z'), createdAt: new Date('2024-08-07T10:48:39.501Z'), updatedAt: new Date('2024-08-07T10:48:39.501Z') }
//   return {DynamoDBDocumentClient: {from: jest.fn().mockReturnValue({ send: jest.fn().mockResolvedValue({Item}) })}, GetCommand: jest.fn(), PutCommand: jest.fn()}
// });

// const testClient = new DynamoDBClient({
//   endpoint: 'http://localhost:8001',
//   region: 'local-env',
//   credentials: {
//     accessKeyId: 'fakeAccessKeyId',
//     secretAccessKey: 'fakeSecretAccessKey',
//   }
// });
// const testDocClient = DynamoDBDocumentClient.from(testClient, {marshallOptions: {convertEmptyValues: true}})

describe('Lambda function users', () => {
  // beforeEach(() => {
  //   jest.resetAllMocks();
  // });

  it('should return user data from DynamoDB', async () => {
    // mockSend.mockResolvedValue({Item});
    const req: Partial<Request<Params>> = {params: {userId: Item.userId}};
    const res: Partial<Response>;
    await getUser(req as Request<Params>, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(Item);
  })

  it('should insert item into table', async () => {
    console.log('JEST_WORKER_ID:', process.env.JEST_WORKER_ID);
    jest.resetAllMocks();
    await testDocClient.send(new PutCommand({TableName: 'users', Item: {userId: '1'}}));
  
    const {Item} = await testDocClient.send(new GetCommand({TableName: 'users', Key: {userId: '1'}}));
  
    expect(Item).toEqual(Item);
  });
});