import { DynamoDBClient, DynamoDBServiceException } from "@aws-sdk/client-dynamodb";
import dotenv from 'dotenv';
import { z } from 'zod';
import { randomUUID } from "crypto";

import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  UpdateCommandInput,
  PutCommandInput,
  GetCommandInput,
  DeleteCommandInput
} from "@aws-sdk/lib-dynamodb";

import express, {Request, Response} from "express";
import serverless from "serverless-http";
import { DEV_DB_CLIENT_CONFIG, JEST_DYNAMO_DB_DOCUMENT_CLIENT_TRANSLATE_CONFIG, USER_EXPRESSION_NAMES } from "./lib/constants";
import { Params, User, UserId } from "./lib/types-interfaces";

dotenv.config();
const app = express();
// console.log('JEST_WORKER_ID:', process.env.JEST_WORKER_ID);
const isTest = process.env.JEST_WORKER_ID;
const isOffline = process.env.IS_OFFLINE;
// console.log('.env', process.env);
const USERS_TABLE = process.env.AWS_USERS_TABLE ?? 'users';
// console.log('user_table,', process.env.USERS_TABLE);
const client = isOffline || isTest ? new DynamoDBClient(DEV_DB_CLIENT_CONFIG) : new DynamoDBClient();
export const docClient = isTest ? DynamoDBDocumentClient.from(client, JEST_DYNAMO_DB_DOCUMENT_CLIENT_TRANSLATE_CONFIG) : DynamoDBDocumentClient.from(client);
// console.log('docClient: ', isTest, JSON.stringify(docClient));

const User = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().min(6).email(),
  dob: z.string().date(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

app.use(express.json());

// export async function getHello(req: Request<Params>, res: Response) {
//   const { userId }: {userId: UserId} = req.params;
//   const result = z.string().pipe(z.coerce.number()).safeParse(userId);
//   if(!result.success) {
//     return res.status(400).json({error: result.error.format()._errors});
//   } else {
//     return res.status(200).json(`hello world! ${result.data}`);
//   }
// }

// app.get("/hello/:userId", getHello);

export async function getUser(req: Request<Params>, res: Response) {
  console.log('/users/:userId API hit!')
  const {userId}: {userId: UserId} = req.params;
  const params: GetCommandInput = {
    TableName: USERS_TABLE,
    Key: {
      userId: userId,
    },
  };
  try {
    const command = new GetCommand(params);
    const response = await docClient.send(command);
    // console.log('docClient.send', docClient.send(command));
    console.log('response', response);
    // const Item = response.Item as User;
    if (response.Item) {
      return res.status(200).json(response.Item as User);
    } else {
      res
        .status( 404)
        .json({ error: `Could not find the user with userId: ${userId}` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not retrieve user",  message: (error as Error).message });
  }
}

app.get("/users/:userId", getUser);

export async function postUser(req: Request, res: Response) {
  const now = new Date().toISOString();
  const newFields = isTest ? {} : {userId: randomUUID(), createdAt: now, updatedAt: now}
  const item: User = {...(req.body), ...newFields };
  const result = User.safeParse(item);
  console.log('postUser wrong input', JSON.stringify(result))
  if(!result.success) {
    return res.status(400).json({error: result.error.format()});
  }
  const params: PutCommandInput = {
    TableName: USERS_TABLE,
    Item: item,
    ReturnValues: "ALL_OLD",
    ConditionExpression: "attribute_not_exists(userId)",
  };
  try {
    console.log('postUser hit!');
    const command = new PutCommand(params);
    // console.log('postUser command', JSON.stringify(command));
    const response = await docClient.send(command);
    // console.log('postUser response', JSON.stringify(response));
    if(response.$metadata.httpStatusCode === 200) {
      return res.status(200).json(item);
    } else {
      res
        .status(404)
        .json({ error: `Failed to create the new user` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not create user", message: (error as Error).message });
  }
}

app.post("/users", postUser);

export async function updateUser(req: Request<Params>, res: Response) {
  const {userId}: {userId: UserId} = req.params;
  const newFields = isTest ? {} : { updatedAt: new Date().toISOString() }
  const item: Partial<User> = {...(req.body), ...newFields};
  const result = User.partial().safeParse(item);
  if(!result.success) {
    return res.status(400).json({error: result.error.format()});
  }
  let updateExpression = 'SET';
  const expressionAttributeNames: {[key: string]: string} = {};
  const expressionAttributeValues: {[key: string]: string} = {};
  Object.entries(item).forEach(([key, value]) => {
    const userExpName = USER_EXPRESSION_NAMES[key];
    expressionAttributeNames[`#${userExpName}`] = key;
    expressionAttributeValues[`:${userExpName}`] = value as string;
    updateExpression = updateExpression.concat(` #${userExpName} = :${userExpName},`);
  });
  updateExpression = updateExpression.substring(0, updateExpression.length-1);
  // console.log('updateExpression', updateExpression);
  const params: UpdateCommandInput = {
    TableName: USERS_TABLE,
    Key: {
      userId: userId,
    },
    ConditionExpression: "attribute_exists(userId)",
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    UpdateExpression: updateExpression,
    ReturnValues: "ALL_NEW"
  };
  try {
    const command = new UpdateCommand(params);
    const response = await docClient.send(command);
    // console.log('docClient.send', docClient.send(command));
    // console.log('response', response);
    // const Item = response.Attributes as User;
    if (response.Attributes && Object.keys(response.Attributes).length > 0) {
      return res.status(200).json(response.Attributes as User);
    }
  } catch (error) {
    console.error(error);
    if ((error as DynamoDBServiceException).$metadata?.httpStatusCode === 400 ) {
      res
      .status(404)
      .json({ error: `Could not find the user with userId: ${userId}` });
    } else {
      return res.status(500).json({ error: "Could not update user",  message: (error as Error).message });
    }
  }
}

app.put("/users/:userId", updateUser);

export async function deleteUser(req: Request<Params>, res: Response) {
  const {userId}: {userId: UserId} = req.params;
  const params: DeleteCommandInput = {
    TableName: USERS_TABLE,
    Key: {
      userId: userId,
    },
    ReturnValues: "ALL_OLD"
  };
  // console.log('userId', userId);
  try {
    const command = new DeleteCommand(params);
    const response = await docClient.send(command);
    // console.log('docClient.send', docClient.send(command));
    // console.log('deleteUser response', response);
    // const Item = response.Attributes as User;
    if (response.Attributes && Object.keys(response.Attributes).length > 0) {
      return res.status(200).json(response.Attributes as User);
    } else {
      res
        .status(404)
        .json({ error: `Could not find the user with userId: ${userId}` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not delete user", message: (error as Error).message });
  }
}

app.delete("/users/:userId", deleteUser);

app.use((req: Request, res: Response) => {
  return res.status(404).json({
    error: "Page Not Found",
  });
});

export const handler = serverless(app);
