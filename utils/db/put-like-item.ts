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
docClient.put(putItemParams, (err, data) => {
  if (err) ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
