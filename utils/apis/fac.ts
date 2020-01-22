/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */
import { DocumentClient } from "aws-sdk/clients/dynamodb";
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

const getItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  {
    blogTitle,
    fingerprint,
    clientIP,
    type
  }: GetItemParams
) => {
  return new Promise<{
    resData: DocumentClient.QueryOutput;
    BlogID: string;
    fingerprintFinal: string;
  }>(async (resolve, reject) => {
    const BlogID = genBlogID(blogTitle);
    const fingerprintFinal = genFingerprint({
      fingerprint,
      ip: clientIP,
      type
    });
    dynamoDb
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
      .promise()
      .then((queryData) => {
        resolve({
          resData: queryData,
          BlogID,
          fingerprintFinal
        });
      })
      .catch(reject);
  });
};

export const getDetailItem = async (
  dynamoDb: DocumentClient,
  options: GetItemParams
) => {
  const { resData } = await getItem(dynamoDb, options);

  return resData.Items ? resData.Items[0] : undefined;
};

/**
 * 获取统计数据的 factory
 */
export const getCounterFac = ({
  blogTitles, type, fingerprint, detail = false
}) => {
  return new Promise<{
    counter: number;
    detail: DocumentClient.AttributeMap | undefined;
  }>(async (resolve, reject) => {
    if (!fingerprint) {
      return reject(new Error('Need pass fingerprint'));
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

    return resolve({
      counter: detail ? counterRes[0] : counterRes,
      detail: detailRes
    });
  });
};

export const genAddItemFac = async (options) => {
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
    // 如果该 FP 已经点了进行过操作，则返回统计数据
    const res = await getCounterFac({
      blogTitles: [blogTitle], type, fingerprint
    });
    return wrapResData({
      msg: `You ${type} already.`,
      resData: res
    });
  }

  try {
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
          Title: blogTitle
        }
      })
      .promise();
  } catch (err) {
    return wrapResData({
      status: 500,
      resData: {
        err
      },
      msg: `Put ${type} item failed`
    });
  }

  let counter;

  // 统计
  try {
    counter = await updateStatisticsItem(dynamoDb, {
      BlogID,
      blogTitle,
      type
    });
  } catch (err) {
    return wrapResData({
      status: 500,
      resData: {
        err
      },
      msg: `Update statistics failed`
    });
  }

  return wrapResData({
    resData: {
      // fingerprint: fingerprintFinal,
      counter: counter.Attributes.Counter
    },
    msg: `${type} success`
  });
};
