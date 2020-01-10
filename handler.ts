// const AWS = require('aws-sdk');
import * as AWS from 'aws-sdk';

import {
  parseBody, genBlogID, getClientIPAndFP, genBlogStorage
} from './utils/helpers';
import { connectDB, BlogTableName, BlogTableIndex } from './utils/connect-db';
import { BlogActionTypes, BlogStatisticsID } from './utils/constant';

import { initDB as internalInitDB } from './utils/init-db';
import { createStatisticsItem, updateStatisticsItem } from './utils/statistics';

export const initDB = internalInitDB;

const uuidv4 = require('uuid/v4');

const getLikeByBlogID = () => {
  return null;
};

const wrapResData = (resData, header = {}, status = 200) => {
  return {
    statusCode: status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      ...header
    },
    body: JSON.stringify(resData),
  };
};

export const visitBlog = async (event, context) => {
  const dynamoDb = connectDB();
  const { queryStringParameters } = event;

  if (!queryStringParameters || !queryStringParameters.blogTitle) {
    return wrapResData({
      Message: 'Need to pass blogTitle'
    }, {}, 400);
  }

  const { ip: clientIP } = getClientIPAndFP(event);
  const { blogTitle } = queryStringParameters;
  const BlogID = genBlogID(blogTitle);
  const params = {
    TableName: BlogTableName,
    IndexName: BlogTableIndex,
    KeyConditions: {
      BlogID: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [BlogID]
      },
      IP: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [clientIP]
      }
    }
  };

  const queryData = await dynamoDb
    .query(params)
    .promise();
  const { Items, Count } = queryData || {};

  // dynamoDb
  //   .update({
  //     TableName: BlogTableName,
  //     Key: {
  //       ID: BlogStatisticsID
  //     },
  //     UpdateExpression: "SET ",
  //   })
  //   .promise();


  // 确保已创建统计 item
  await createStatisticsItem(dynamoDb);
  updateStatisticsItem(dynamoDb, {
    BlogID,
    type: 'visit'
  });
  if (!!Count && Count > 0) {
    return wrapResData({
      Message: 'Visited.'
    });
  }

  const putDataRes = await dynamoDb
    .put({
      TableName: BlogTableName,
      Item: {
        ID: uuidv4(),
        Type: BlogActionTypes.visit,
        BlogID,
        IP: clientIP,
        ActionDate: Date.now(),
        Title: genBlogStorage(blogTitle)
      }
    })
    .promise();

  return wrapResData({ clientIP, Message: "Add Visited." });
  // const queryData = await dynamoDb
  //   .scan(params)
  //   .promise();
};

export const getLikesByTitles = async (event, context) => {
  const dynamoDb = connectDB();
  const eventBody = parseBody(event);
  const { blogTitles } = eventBody;
  let _blogTitles = blogTitles;

  if (!Array.isArray(blogTitles)) {
    _blogTitles = [blogTitles];
  }

  _blogTitles = _blogTitles.filter((item) => !!item);

  const params = {
    TableName: BlogTableName,
    IndexName: BlogTableIndex,
    KeyConditions: {
      BlogID: {
        ComparisonOperator: 'EQ',
        AttributeValueList: _blogTitles.map((title) => genBlogID(title))
      }
    }
  };

  const queryData = await dynamoDb
    .query(params)
    .promise();
  const { Items, Count } = queryData || {};
  const result = {
    Count,
  };

  return wrapResData(result);
};

export const likeBlog = async (event, context) => {
  const dynamoDb = connectDB();
  const { ip: clientIP } = getClientIPAndFP(event);
  const eventBody = parseBody(event);
  const { blogTitle } = eventBody;
  const BlogID = genBlogID(blogTitle);
  // return wrapResData({ blogTitle, BlogID });
  const queryData = await dynamoDb
    .query({
      TableName: BlogTableName,
      IndexName: BlogTableIndex,
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
    return wrapResData({
      Message: "Liked"
    });
  }

  // 如果该 IP 没有点了 like，则进入 like 流程
  const putDataRes = await dynamoDb
    .put({
      TableName: BlogTableName,
      Item: {
        ID: uuidv4(),
        Type: BlogActionTypes.like,
        BlogID,
        IP: clientIP,
        ActionDate: Date.now(),
        Title: Buffer.from(blogTitle).toString('base64')
      }
    })
    .promise();

  return wrapResData({ clientIP, Message: "Liked" });
};
