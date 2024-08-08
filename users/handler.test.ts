import { Request, Response } from 'express';
import { DeleteCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient as testDocClient, getUser } from './handler';
import { mockRequestWithParams, mockResponse } from './lib/utility';
import { Params, User } from './lib/types-interfaces';

const mockUser: User = { userId: "1", firstName: 'kush', lastName: 'patel', email: 'kush.patel@gmail.com', dob: new Date('2024-08-07T10:48:39.501Z').toDateString(), createdAt: new Date('2024-08-07T10:48:39.501Z').toString(), updatedAt: new Date('2024-08-07T10:48:39.501Z').toString() }
const tableName = 'users';

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
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  it('should insert user data from DynamoDB', async () => {
    const mockReq = mockRequestWithParams({userId: mockUser.userId});
    const mockRes = mockResponse();
    await getUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });
  it('should return user data from DynamoDB', async () => {
    const mockReq = mockRequestWithParams({userId: mockUser.userId});
    const mockRes = mockResponse();
    await getUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });
  it.todo('should update user data in DynamoDB', async () => {
    const mockReq = mockRequestWithParams({userId: mockUser.userId});
    const mockRes = mockResponse();
    await getUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });
  it.todo('should delete user data from DynamoDB', async () => {
    const mockReq = mockRequestWithParams({userId: mockUser.userId});
    const mockRes = mockResponse();
    await getUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });

  it('should insert item into table', async () => {
    const insertedItem = await testDocClient.send(new PutCommand({TableName: tableName, Item: mockUser}));
    const {Item} = await testDocClient.send(new GetCommand({TableName: tableName, Key: {userId: mockUser.userId}}));
    expect(insertedItem.$metadata.httpStatusCode).toEqual(200);
    expect(Item).toEqual(mockUser);
  });
  it('should get item from table', async () => {
    const {Item} = await testDocClient.send(new GetCommand({TableName: tableName, Key: {userId: mockUser.userId}}));
    expect(Item).toEqual(mockUser);
  });
  it('should update item in table', async () => {
    const updatedItem = await testDocClient.send(new UpdateCommand({TableName: tableName, Key: {userId: mockUser.userId}, ExpressionAttributeNames: {"#lN": "lastName"}, ExpressionAttributeValues: {":l": "potato"}, UpdateExpression: "SET #lN = :l", ReturnValues: "ALL_NEW"}));
    // const {Item} = await testDocClient.send(new GetCommand({TableName: tableName, Key: {userId: mockUser.userId}}));
    expect(updatedItem.Attributes).toEqual({...mockUser, lastName: "potato"});
  });
  it('should delete item from table', async () => {
    const deletedItem = await testDocClient.send(new DeleteCommand({TableName: tableName, Key: {userId: mockUser.userId}, ReturnValues: "ALL_OLD"}));
    // const response = await testDocClient.send(new GetCommand({TableName: tableName, Key: {userId: mockUser.userId}}));
    expect(deletedItem.Attributes).toEqual({...mockUser, lastName: "potato"});
  });
});