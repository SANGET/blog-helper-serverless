// const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';

const isDev = process.env.NODE_ENV === 'development';
const dbConnection = isDev ? {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
} : undefined;

export const hello = async (event) => {
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

const wrapSuccessRes = (resData, header = {}) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      ...header
    },
    body: JSON.stringify(resData),
  };
};

export const getLikes = (event, context, callback) => {
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
      Items,
      Count,
    };
    context.succeed(wrapSuccessRes(result));
    callback(null, result);
  });
};

export const likeBlog = async (event, context) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(dbConnection);
  const BlogID = event.queryStringParameters.id;
  const clientIP = event.requestContext.identity.sourceIp;
  const queryData = await dynamoDb
    .get({
      TableName: 'BlogLike',
      Key: {
        BlogID
      }
    })
    .promise();
  const { Item } = queryData || {};
  if (Item) {
    const result = {
      Item,
    };
    return wrapSuccessRes({ clientIP, result });
  }
  const putDataRes = await dynamoDb
    .put({
      TableName: 'BlogLike',
      Item: {
        BlogID,
        Message: 'Put item'
      }
    })
    .promise();
  return wrapSuccessRes({ clientIP, putDataRes });
};
