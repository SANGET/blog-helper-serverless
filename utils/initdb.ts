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
const putItemParams = {
  TableName: 'BlogLike',
  Item: { // a map of attribute name to AttributeValue
    BlogID: '12323123123123',
    IP: '11.11.11.11',
    ActionDate: Date.now()
    // attribute_value (string | number | boolean | null | Binary | DynamoDBSet | Array | Object)
    // more attributes...
  },
  // ConditionExpression: 'attribute_not_exists(attribute_name)', // optional String describing the constraint to be placed on an attribute
  // ExpressionAttributeNames: { // a map of substitutions for attribute names with special characters
  //   // '#name': 'attribute name'
  // },
  // ExpressionAttributeValues: { // a map of substitutions for all attribute values
  //   // ':value': 'VALUE'
  // },
  ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
  ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
  ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
};
const queryParams = {
  TableName: 'BlogLike',
  KeyConditionExpression: 'BlogID = :a', // a string representing a constraint on the attribute
  ExpressionAttributeValues: {
    ":a": '12323123123123'
  },
  ScanIndexForward: true, // optional (true | false) defines direction of Query in the index
  Limit: 10, // optional (limit the number of items to evaluate)
  ConsistentRead: false, // optional (true | false)
  Select: 'ALL_ATTRIBUTES', // optional (ALL_ATTRIBUTES | ALL_PROJECTED_ATTRIBUTES |
  ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
};
dynamodb.createTable(createParams, (err, data) => {
  if (err) ppJson(err); // an error occurred
  else ppJson(data); // successful response
  docClient.put(putItemParams, (err, data) => {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
    docClient.query(queryParams, (err, data) => {
      if (err) ppJson(err); // an error occurred
      else ppJson(data); // successful response
    });
  });
});
