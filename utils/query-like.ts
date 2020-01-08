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
docClient.query(queryParams, (err, data) => {
  if (err) ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
