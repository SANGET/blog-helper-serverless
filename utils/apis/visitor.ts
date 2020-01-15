import {
  genBlogID, genBlogStorage, wrapResData, genFingerprint
} from '../helpers';
import { connectDB, BlogTableName, BlogTableIndex } from '../connect-db';
import { BlogActionTypes } from '../constant';
import { updateStatisticsItem } from '../statistics';
import { getCounterFac } from './fac';

const uuidv4 = require('uuid/v4');

export const VisitBlog = async ({
  clientIP,
  blogTitle
}) => {
  const BlogID = genBlogID(blogTitle);
  const fingerprint = genFingerprint({ ip: clientIP, type: 'visit' });
  const params = {
    TableName: BlogTableName,
    IndexName: BlogTableIndex,
    KeyConditions: {
      BlogID: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [BlogID]
      },
      Fingerprint: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [fingerprint]
      }
    }
  };

  const dynamoDb = connectDB();
  const queryData = await dynamoDb
    .query(params)
    .promise();
  const { Items, Count } = queryData || {};

  if (!!Count && Count > 0) {
    return wrapResData({
      msg: 'You visited already',
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
        Fingerprint: fingerprint,
        ActionDate: Date.now(),
        Title: genBlogStorage(blogTitle)
      }
    })
    .promise();

  return wrapResData({
    resData: { clientIP },
    msg: "Visited success"
  });
};

export const GetVisitorsByTitles = async (blogTitles: string[]) => {
  const res = await getCounterFac(blogTitles, 'visit');
  return res;
};
