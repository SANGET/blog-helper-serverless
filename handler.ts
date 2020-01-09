// const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';

import parseBody from './utils/parse-body';
import { BlogNamespace } from './utils/constant';
// import { v5 as uuid } from 'uuid';
const uuid = require('uuid/v5');

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
  const clientIP = event.requestContext.identity.sourceIp;
  const eventBody = parseBody(event);
  const { blogTitle } = eventBody;
  const BlogID = uuid(blogTitle, BlogNamespace);
  // return wrapSuccessRes({ blogTitle, BlogID });
  const queryData = await dynamoDb
    .get({
      TableName: 'BlogLike',
      Key: {
        BlogID,
        IP: clientIP
      }
    })
    .promise();
  const { Item } = queryData || {};
  if (Item) {
    // 如果该 IP 已经点了 like，则直接返回
    const result = {
      Item,
    };
    return wrapSuccessRes({ clientIP, result });
  }
  // 如果该 IP 没有点了 like，则进入 like 流程
  const putDataRes = await dynamoDb
    .put({
      TableName: 'BlogLike',
      Item: {
        BlogID,
        IP: clientIP,
        ActionDate: Date.now()
      }
    })
    .promise();
  return wrapSuccessRes({ clientIP, putDataRes });
};
