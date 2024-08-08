import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { z } from 'zod';

import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

import express, {Request, Response} from "express";
import serverless from "serverless-http";
import { JEST_DYNAMO_DB_CLIENT_CONFIG, JEST_DYNAMO_DB_DOCUMENT_CLIENT_TRANSLATE_CONFIG } from "./lib/constants";
import { Params, User, UserId } from "./lib/types-interfaces";

const app = express();
console.log('JEST_WORKER_ID:', process.env.JEST_WORKER_ID);
const isTest = process.env.JEST_WORKER_ID;
const testClient = new DynamoDBClient(JEST_DYNAMO_DB_CLIENT_CONFIG);

const USERS_TABLE = process.env.USERS_TABLE ?? 'users';
console.log('user_table,', process.env.USERS_TABLE);
const client = new DynamoDBClient();
export const docClient = isTest ? DynamoDBDocumentClient.from(testClient, JEST_DYNAMO_DB_DOCUMENT_CLIENT_TRANSLATE_CONFIG) : DynamoDBDocumentClient.from(client);
console.log('docClient', docClient);

app.use(express.json());

export async function getHello(req: Request<Params>, res: Response) {
  const { userId }: {userId: UserId} = req.params;
  const result = z.string().pipe(z.coerce.number()).safeParse(userId);
  if(!result.success) {
    res.status(400).json({error: result.error.format()._errors});
  } else {
    res.status(200).json(`hello world! ${result.data}`);
  }
}

app.get("/hello/:userId", getHello);

export async function getUser(req: Request<Params>, res: Response) {
  console.log('/users/:userId API hit!')
  const {userId}: {userId: UserId} = req.params;
  const result = z.string().pipe(z.coerce.number()).safeParse(userId);
  if(!result.success) {
    res.status(400).json({error: result.error.format()._errors}).end();
  }
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: userId,
    },
  };

  try {
    const command = new GetCommand(params);
    const response = await docClient.send(command);
    console.log('docClient.send', docClient.send(command));
    console.log('response', response);
    const Item = response.Item as User;
    if (Item) {
      res.status(200).json(Item);
    } else {
      res
        .status(404)
        .json({ error: `Could not find ther user with userId: ${userId}` });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
}

app.get("/users/:userId", getUser);

app.post("/users", async (req, res) => {
  const User = z.object({
    userId: z.coerce.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().min(6).email(),
    dob: z.string().date(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  });
  const item: User = req.body;
  const { userId, firstName, lastName, email, dob }: User = item;
  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof firstName !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: item,
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ userId, firstName, lastName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.put("/users/:userId", async (req, res) => {
  res.status(200).json('users PUT');
});

app.delete("/users/:userId", async (req, res) => {
  res.status(200).json('users DELETE');
});

app.use((req, res) => {
  return res.status(404).json({
    error: "Page Not Found",
  });
});

exports.handler = serverless(app);
