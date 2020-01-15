import {
  genBlogID, wrapResData, genFingerprint
} from '../helpers';
import { connectDB, BlogTableName, BlogTableIndex } from '../connect-db';
import { BlogActionTypes } from '../constant';
import { updateStatisticsItem } from '../statistics';
import { getCounterFac } from './fac';

const uuidv4 = require('uuid/v4');

export const LikeBlog = async ({
  blogTitle,
  clientIP
}) => {
  const BlogID = genBlogID(blogTitle);
  const dynamoDb = connectDB();
  const fingerprint = genFingerprint({ ip: clientIP, type: 'like' });
  const queryData = await dynamoDb
    .query({
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
    })
    .promise();

  const { Count } = queryData || {};

  if (!!Count && Count > 0) {
    // 如果该 IP 已经点了 like，则直接返回
    return wrapResData({
      msg: "You liked already.",
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
        Fingerprint: fingerprint,
        ActionDate: Date.now(),
        Title: Buffer.from(blogTitle).toString('base64')
      }
    })
    .promise();

  return wrapResData({
    resData: { clientIP },
    msg: "Liked success"
  });
};

export const GetLikesByTitles = async (blogTitles: string[]) => {
  const res = await getCounterFac(blogTitles, 'like');
  return res;
};
