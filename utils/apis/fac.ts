import { connectDB, BlogTableName, BlogTableIndex } from "../connect-db";
import { wrapResData, genBlogID, genFingerprint } from "../helpers";
import { updateStatisticsItem } from "../statistics";
import { BlogActionTypes } from "../constant";
import { wrapBatchGetItemCondition } from "./counter";
import { HelperType } from "../types";

const uuidv4 = require('uuid/v4');

interface GetItemParams {
  blogTitle: string;
  fingerprint: string;
  clientIP?: string;
  type: HelperType;
}

const getItem = async (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  {
    blogTitle,
    fingerprint,
    clientIP,
    type
  }: GetItemParams) => {
  const BlogID = genBlogID(blogTitle);
  const fingerprintFinal = genFingerprint({
    fingerprint,
    ip: clientIP,
    type
  });
  const queryData = await dynamoDb
    .query({
      TableName: BlogTableName,
      IndexName: BlogTableIndex,
      ProjectionExpression: '#T',
      ExpressionAttributeNames: {
        '#T': 'Type'
      },
      KeyConditions: {
        BlogID: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [BlogID]
        },
        Fingerprint: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [fingerprintFinal]
        }
      }
    })
    .promise();
  return {
    resData: queryData,
    BlogID,
    fingerprintFinal
  };
};

export const getDetailItem = async (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  options: GetItemParams
) => {
  const { resData } = await getItem(dynamoDb, options);

  return resData.Items ? resData.Items[0] : undefined;
};

/**
 * 获取统计数据的 factory
 */
export const getCounterFac = async ({
  blogTitles, type, fingerprint, detail
}) => {
  if (!fingerprint) {
    return wrapResData({
      status: 400,
      resData: {
        msg: 'Need pass fingerprint'
      }
    });
  }
  const dynamoDb = connectDB();
  const batchGetItemCondition = wrapBatchGetItemCondition(
    dynamoDb,
    { blogTitles, type },
  );
  let detailRes;
  if (detail && fingerprint) {
    detailRes = await getDetailItem(dynamoDb, {
      fingerprint, blogTitle: blogTitles[0], type
    });
  }
  const counterRes = await Promise.all(batchGetItemCondition);

  return wrapResData({
    resData: {
      counter: detail ? counterRes[0] : counterRes,
      detail: detailRes
    }
  });
};

export const genAddFac = async (options) => {
  const {
    blogTitle,
    fingerprint,
    type,
    clientIP
  } = options;
  const dynamoDb = connectDB();
  const { resData, BlogID, fingerprintFinal } = await getItem(dynamoDb, options);

  const { Count } = resData || {};

  if (!!Count && Count > 0) {
    // 如果该 IP 已经点了 like，则直接返回
    return wrapResData({
      msg: `You ${type} already.`,
      resData: {
        counter: Count
      }
    });
  }

  // 如果该 IP 没有点了 item，则进入 record 流程
  await dynamoDb
    .put({
      TableName: BlogTableName,
      Item: {
        ID: uuidv4(),
        Type: BlogActionTypes[type],
        BlogID,
        IP: clientIP,
        FP: fingerprint,
        Fingerprint: fingerprintFinal,
        ActionDate: Date.now(),
        Title: Buffer.from(blogTitle).toString('base64')
      }
    })
    .promise();

  // 统计
  updateStatisticsItem(dynamoDb, {
    BlogID,
    type
  });

  return wrapResData({
    resData: {
      fingerprint: fingerprintFinal
    },
    msg: `${type} success`
  });
};
