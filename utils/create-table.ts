const createParams = {
  TableName: 'BlogLike',
  KeySchema: [ // The type of of schema.  Must start with a HASH type, with an optional second RANGE.
    { // Required HASH type attribute
      AttributeName: 'BlogID',
      KeyType: 'HASH',
    },
  ],
  AttributeDefinitions: [ // The names and types of all primary and index key attributes only
    {
      AttributeName: 'BlogID',
      AttributeType: 'S', // (S | N | B) for string, number, binary
    },
  ],
  ProvisionedThroughput: { // required provisioned throughput for the table
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};
dynamodb.createTable(createParams, (err, data) => {
  if (err) ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
