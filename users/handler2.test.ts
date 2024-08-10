import { Request, Response } from 'express';
import { postUser, getUser, deleteUser, updateUser } from "./handler";
import { Params, User } from "./lib/types-interfaces";
import { mockRequestWithParams, mockResponse } from "./lib/utility";

const mockUserDefault: User = { userId: '0', firstName: 'kush', lastName: 'patel', email: 'kush.patel@gmail.com', dob: new Date('2024-08-07T10:48:39.501Z').toISOString().split('T')[0], createdAt: new Date('2024-08-07T10:48:39.501Z').toISOString(), updatedAt: new Date('2024-08-07T10:48:39.501Z').toISOString() }
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const originalModule = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    _esModule: true,
    ...originalModule,
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({ send: jest.fn().mockRejectedValue(new Error('mock error'))})
    },
    PutCommand: jest.fn(),
    GetCommand: jest.fn(),
    UpdateCommand: jest.fn(),
    DeleteCommand: jest.fn(),
  }
});
describe('(should return status 500) when', () => {
  const mockUser: User = {...mockUserDefault, userId: '6'};
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it.only('inserting a new user', async () => {
    const mockReq = mockRequestWithParams(undefined, mockUser);
    const mockRes = mockResponse();
    await postUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Could not create user'}));
  });
  it.only('getting a user', async () => {
    const mockReq = mockRequestWithParams({userId: mockUser.userId});
    const mockRes = mockResponse();
    await getUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Could not retrieve user'}));
  });
  it.only('updating a user', async () => {
    const mockReq = mockRequestWithParams({userId: mockUser.userId}, { lastName: 'banana' });
    const mockRes = mockResponse();
    await updateUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Could not update user'}));
  });
  it.only('deleting a user', async () => {
    const mockReq = mockRequestWithParams({userId: mockUser.userId});
    const mockRes = mockResponse();
    await deleteUser(mockReq as Request<Params>, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({error: 'Could not delete user'}));
  });
});