module.exports = {
  tables: [
    {
      TableName: `users`,
      KeySchema: [{AttributeName: 'userId', KeyType: 'HASH'}],
      AttributeDefinitions: [{AttributeName: 'userId', AttributeType: 'S'}],
      ProvisionedThroughput: {ReadCapacityUnits: 5, WriteCapacityUnits: 5},
    },
  ],
  port: 8001,
  options: ['-sharedDb'],
};