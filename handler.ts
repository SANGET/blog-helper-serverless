// const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';

import parseBody from './utils/parse-body';
import { BlogNamespace } from './utils/constant';
// import { v5 as uuid } from 'uuid';
const uuidv5 = require('uuid/v5');
const uuidv4 = require('uuid/v4');

const isDev = process.env.NODE_ENV === 'development';
const dbConnection = isDev ? {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
} : undefined;

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

export const getLikes = async (event, context) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(dbConnection);
  const params = {
    TableName: 'BlogLike',
  };
  const { queryStringParameters } = event;
  if (!queryStringParameters) {
    const queryData = await dynamoDb
      .scan(params)
      .promise();
    const { Items, Count } = queryData || {};
    const result = {
      Items,
      Count,
    };
    return wrapSuccessRes(result);
  }
  const { title } = queryStringParameters;
  const base64 = Buffer.from(title).toString('base64');
  // const queryData = await dynamoDb
  //   .scan(params)
  //   .promise();
  return wrapSuccessRes({ base64 });
};

export const getLikesByTitles = async (event, context) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(dbConnection);
  const eventBody = parseBody(event);
  const { blogTitles } = eventBody;
  let _blogTitles = blogTitles;
  if (!Array.isArray(blogTitles)) {
    _blogTitles = [blogTitles];
  }
  _blogTitles = _blogTitles.filter((item) => !!item);
  const params = {
    RequestItems: {
      BlogLike: {
        Keys: _blogTitles.map((title) => ({
          BlogID: uuidv5(title, BlogNamespace),
        }))
      }
    }
  };
  const queryData = await dynamoDb
    .batchGet(params)
    .promise();
  // const params = {
  //   TableName: 'BlogLike',

  // };
  // const queryData = await dynamoDb
  //   .scan(params)
  //   .promise();
  console.log(queryData);
  // const { Items, Count } = queryData || {};
  // const result = {
  //   Items,
  //   Count,
  // };
  return wrapSuccessRes(params);
};

export const likeBlog = async (event, context) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient(dbConnection);
  const clientIP = event.requestContext.identity.sourceIp;
  const eventBody = parseBody(event);
  const { blogTitle } = eventBody;
  const BlogID = uuidv5(blogTitle, BlogNamespace);
  // return wrapSuccessRes({ blogTitle, BlogID });
  const queryData = await dynamoDb
    .query({
      TableName: 'BlogLike',
      IndexName: 'BlogIPIndex',
      KeyConditionExpression: 'BlogID = :blogID AND IP = :ip',
      ExpressionAttributeValues: {
        ":blogID": BlogID,
        ":ip": clientIP,
      }
    })
    .promise();
  const { Count } = queryData || {};
  if (!!Count && Count > 0) {
    // 如果该 IP 已经点了 like，则直接返回
    return wrapSuccessRes({
      Message: "Liked"
    });
  }
  // 如果该 IP 没有点了 like，则进入 like 流程
  const putDataRes = await dynamoDb
    .put({
      TableName: 'BlogLike',
      Item: {
        ID: uuidv4(),
        BlogID,
        IP: clientIP,
        ActionDate: Date.now(),
        Title: Buffer.from(blogTitle).toString('base64')
      }
    })
    .promise();
  return wrapSuccessRes({ clientIP, Message: "Liked" });
};
