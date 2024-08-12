import { Request, Response } from 'express';
import { DeleteCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient as testDocClient, getUser, postUser, updateUser, deleteUser } from './handler';
import { mockRequestWithParams, mockResponse } from './lib/utility';
import { Params, User } from './lib/types-interfaces';

const mockUserDefault: User = { userId: '0', firstName: 'kush', lastName: 'patel', email: 'kush.patel@gmail.com', dob: new Date('2024-08-07T10:48:39.501Z').toISOString().split('T')[0], createdAt: new Date('2024-08-07T10:48:39.501Z').toISOString(), updatedAt: new Date('2024-08-07T10:48:39.501Z').toISOString() }
const tableName = 'users';
const zodErrors = {
  firstName: { error: { _errors: [], firstName: { _errors: ["Expected string, received number"]} } },
  lastName: { error: { _errors: [], lastName: { _errors: ["Expected string, received number"]} } },
  email: { error: { _errors: [], email: { _errors: ["Invalid email"]} } },
  dob: { error: { _errors: [], dob: { _errors: ["Invalid date"]} } },
};

describe('Lambda function users', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });
  describe('(should return status 200 and )', () => {
    const mockUser: User = {...mockUserDefault, userId: '1'}
    it('insert user data into DynamoDB', async () => {
      const mockReq = mockRequestWithParams(undefined, mockUser);
      const mockRes = mockResponse();
      await postUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });
    it('should return user data from DynamoDB', async () => {
      const mockReq = mockRequestWithParams({userId: mockUser.userId!});
      const mockRes = mockResponse();
      await getUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });
    it('should update user data in DynamoDB', async () => {
      const mockReq = mockRequestWithParams({userId: mockUser.userId!}, { lastName: 'banana' });
      const mockRes = mockResponse();
      await updateUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ ...mockUser, lastName: 'banana'});
    });
    it('should delete user data from DynamoDB', async () => {
      const mockReq = mockRequestWithParams({userId: mockUser.userId!});
      const mockRes = mockResponse();
      await deleteUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({...mockUser, lastName: 'banana'});
    });
  });

  describe('(should return status 400 (Bad Request)) for', () => {
    const mockUser: User = {...mockUserDefault, userId: '2'}
    it('inserting incorrect firstName into DynamoDB', async () => {
      const mockReq = mockRequestWithParams(undefined, {...mockUser, firstName: 1234});
      const mockRes = mockResponse();
      await postUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.firstName);
    });
    it('inserting incorrect lastName into DynamoDB', async () => {
      const mockReq = mockRequestWithParams(undefined, {...mockUser, lastName: 1234});
      const mockRes = mockResponse();
      await postUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.lastName);
    });
    it('inserting incorrect email into DynamoDB', async () => {
      const mockReq = mockRequestWithParams(undefined, {...mockUser, email: '1@234@1234.1234'});
      const mockRes = mockResponse();
      await postUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.email);
    });
    it('inserting incorrect dob into DynamoDB', async () => {
      const mockReq = mockRequestWithParams(undefined, {...mockUser, dob: '1234'});
      const mockRes = mockResponse();
      await postUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.dob);
    });
    it('updating with incorrect firstName', async () => {
      const mockReq = mockRequestWithParams({userId: mockUser.userId!}, { firstName: 1234});
      const mockRes = mockResponse();
      await updateUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.firstName);
    });
    it('updating with incorrect lastName', async () => {
      const mockReq = mockRequestWithParams({userId: mockUser.userId!}, { lastName: 1234});
      const mockRes = mockResponse();
      await updateUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.lastName);
    });
    it('updating with incorrect email', async () => {
      const mockReq = mockRequestWithParams({userId: mockUser.userId!}, { email: '1@234@1234.1234'});
      const mockRes = mockResponse();
      await updateUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.email);
    });
    it('updating with incorrect dob', async () => {
      const mockReq = mockRequestWithParams({userId: mockUser.userId!}, { dob: '1234'});
      const mockRes = mockResponse();
      await updateUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(zodErrors.dob);
    });
  });

  describe('(should return status 404) when', () => {
    it('deleting a user with incorrect userId', async () => {
      const userId = '3';
      const mockReq = mockRequestWithParams({userId: userId});
      const mockRes = mockResponse();
      await deleteUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({error: `Could not find the user with userId: ${userId}`});
    });
    it('getting a user with incorrect userId', async () => {
      const userId = '4';

      const mockReq = mockRequestWithParams({userId: userId});
      const mockRes = mockResponse();
      await getUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({error: `Could not find the user with userId: ${userId}`});
    });
    it('updating a user with incorrect userId', async () => {
      const userId = '5';
      const mockReq = mockRequestWithParams({userId: userId}, { lastName: 'banana' });
      const mockRes = mockResponse();
      await updateUser(mockReq as Request<Params>, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({error: `Could not find the user with userId: ${userId}`});
    });
  });

  describe('dynamoDBDocClient', () => {
    const mockUser: User = {...mockUserDefault, userId: '7'};
    it('should insert item into table', async () => {
      const insertedItem = await testDocClient.send(new PutCommand({TableName: tableName, Item: mockUser, ReturnValues: "ALL_OLD"}));
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
      expect(updatedItem.Attributes).toEqual({...mockUser, lastName: "potato"});
    });
    it('should delete item from table', async () => {
      const deletedItem = await testDocClient.send(new DeleteCommand({TableName: tableName, Key: {userId: mockUser.userId}, ReturnValues: "ALL_OLD"}));
      expect(deletedItem.Attributes).toEqual({...mockUser, lastName: "potato"});
    });
  });
});
