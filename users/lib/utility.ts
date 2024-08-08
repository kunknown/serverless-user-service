import { MockRequest, MockRequestWithParams, MockResponse, Params } from "./types-interfaces";

// JEST UTILITIES
export const mockRequest = (params?: Params, body?: unknown): MockRequest => ({params, body});
export const mockRequestWithParams = (params?: Params, body?: unknown): MockRequestWithParams => ({params, body});
export const mockResponse = (): MockResponse => {
    const res: MockResponse = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    return res;
  }