dynamodb.scan({
  TableName: 'BlogState',
}, (err, data) => {
  if (err) ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
dynamodb.scan({
  TableName: 'BlogStatistics',
}, (err, data) => {
  if (err) ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
