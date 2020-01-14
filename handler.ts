import {
  parseBody, genBlogID, getClientIPAndFP, genBlogStorage, wrapResData
} from './utils/helpers';
import { connectDB, BlogTableName, BlogTableIndex } from './utils/connect-db';
import { BlogActionTypes } from './utils/constant';

import internalInitDB from './utils/init-db';
import { updateStatisticsItem } from './utils/statistics';
import { wrapBatchGetItemCondition } from './utils/counter';

interface QueryItemCondition {
  blogTitle: string;
  blogTitles: string[];
}

export const initDB = internalInitDB;

const uuidv4 = require('uuid/v4');

/**
 * 获取统计数据的 factory
 */
export const getCounterFac = async (event, type) => {
  const dynamoDb = connectDB();
  const eventBody = parseBody<QueryItemCondition>(event);
  const { blogTitles } = eventBody;
  const batchGetItemCondition = wrapBatchGetItemCondition(blogTitles, type, dynamoDb);
  const counterRes = await Promise.all(batchGetItemCondition);

  return wrapResData(counterRes);
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

  if (!!Count && Count > 0) {
    return wrapResData({
      Message: 'You visited already'
    });
  }
  // 更新该文章的 visitor 统计
  updateStatisticsItem(dynamoDb, {
    BlogID,
    type: 'visit'
  });

  await dynamoDb
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

  return wrapResData({ clientIP, Message: "Visited success" });
};

export const getVisitorsByTitles = async (event, context) => {
  const res = await getCounterFac(event, 'visit');
  return res;
};

export const likeBlog = async (event, context) => {
  const dynamoDb = connectDB();
  const { ip: clientIP } = getClientIPAndFP(event);
  const eventBody = parseBody<QueryItemCondition>(event);
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
      Message: "You liked already."
    });
  }
  // 更新该文章的 visitor 统计
  updateStatisticsItem(dynamoDb, {
    BlogID,
    type: 'like'
  });

  // 如果该 IP 没有点了 like，则进入 like 流程
  await dynamoDb
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

  return wrapResData({ clientIP, Message: "Liked success" });
};

export const getLikesByTitles = async (event, context) => {
  const res = await getCounterFac(event, 'like');
  return res;
};
