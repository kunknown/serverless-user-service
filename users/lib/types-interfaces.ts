import { Request, Response } from 'express';

export type User = {
  userId: string ;
  firstName: string;
  lastName: string;
  email: string;
  dob: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type UserId = User["userId"];

export interface Params { [key: string]: string, userId: string };

// JEST TYPES
export type MockRequest = Partial<Request>;
export type MockRequestWithParams = Partial<Request<Params>>;
export type MockResponse = Partial<Response>;