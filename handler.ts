const AWS = require('aws-sdk');

const isDev = process.env.NODE_ENV === 'development';
const dbConnection = isDev ? {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
} : undefined;

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!!!!',
        input: event,
      },
      null,
      2,
    ),
  };
};

const getLikeByBlogID = () => {
  return null;
};

module.exports.getLikes = (event, context, callback) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(dbConnection);
  const params = {
    TableName: 'BlogLike',
  };
  dynamoDb.scan(params, (err, queryData) => {
    if (err) {
      callback(err);
    }
    const { Items, Count } = queryData || {};
    const result = {
      message: 'asd',
      Items,
      Count,
    };
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(result),
    };
    context.succeed(response);
    callback(null, result);
  });
};

module.exports.likeBlog = async (event, context, callback) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(dbConnection);
  return dynamoDb.query({}, (err, queryData) => {
    const params = {

    };
    dynamoDb.createSet(params, (error, data) => {
      if (error) {
        callback(error);
      }
      callback(null, { message: 'Profile successfully updated', params });
    });
  });
};
