/* eslint-disable default-case */
/* eslint-disable no-async-promise-executor */
import { BlogStatisticsID } from "./constant";
import { BlogStatisticsTableName } from "./connect-db";
import { HelperType } from "./types";

/**
 * 统计 item 的数据结构
 */
interface BlogStatisticsDataStruct {
  // hash key
  ID: 'Statistics_type_BlogID';
  // range key
  BlogID: string;
  Counter: number;
}

const statisticsItemCache = {};

export interface StatisticsParams {
  BlogID: string;
  blogTitle: string;
  type: HelperType;
}

export const wrapStatisticsItemID = (params: StatisticsParams) => {
  return `${BlogStatisticsID}_${params.type}_${params.BlogID}`;
};

export const getStatisticItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  itemID: string
): Promise<AWS.DynamoDB.DocumentClient.GetItemOutput> => {
  return new Promise((resolve, reject) => {
    dynamoDb
      .get({
        TableName: BlogStatisticsTableName,
        Key: {
          ID: itemID
        }
      })
      .promise()
      .then((data) => {
        console.log('get statistic item success', data);
        resolve(data);
      })
      .catch((err) => {
        console.log('get statistic item error', err);
        reject(err);
      });
  });
};

export const createStatisticsItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  params: {
    itemID: string;
    type: string;
    remark: string;
  }
): Promise<{msg: string}> => {
  return new Promise(async (resolve, reject) => {
    const { itemID, remark } = params;
    const hasCache = !!statisticsItemCache[itemID];
    if (hasCache) {
      resolve({ msg: 'Record in cache list' });
    } else {
      getStatisticItem(dynamoDb, itemID)
        .then(({ Item }) => {
          if (!Item) {
            // 如果没有统计 item，则创建一个
            dynamoDb.put({
              TableName: BlogStatisticsTableName,
              Item: {
                ID: itemID,
                Remark: remark,
                Counter: 0
              },
            })
              .promise()
              .then((putRes) => {
                statisticsItemCache[itemID] = true;
                resolve({ msg: 'Create item successed' });
              })
              .catch((putErr) => {
                reject(putErr);
              });
          } else {
            statisticsItemCache[itemID] = true;
            resolve({ msg: 'Has statistics item' });
          }
        })
        .catch((getItemErr) => {
          reject(getItemErr);
        });
    }
  });
};

/**
 * 更新统计 item
 *
 * 流程：
 * 1. 检查是否已存在对于某条 Blog 的 type 的统计 item
 * 2.1. 如果存在，则返回
 * 2.2. 如果不存在，则创建一条统计 item 并返回
 * 3. 更新该条统计
 */
export const updateStatisticsItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  params: StatisticsParams
) => {
  return new Promise((resolve, reject) => {
    const itemID = wrapStatisticsItemID(params);

    createStatisticsItem(dynamoDb, {
      itemID, type: params.type, remark: params.blogTitle
    })
      .then(() => {
        dynamoDb.update({
          TableName: BlogStatisticsTableName,
          Key: {
            ID: itemID,
          },
          UpdateExpression: `SET #c = #c + :increase`,
          ExpressionAttributeNames: {
            '#c': 'Counter'
          },
          ExpressionAttributeValues: {
            ':increase': 1
          },
          ReturnValues: "UPDATED_NEW"
        })
          .promise()
          .then((data) => {
            console.log('update statictics', data);
            resolve(data);
          })
          .catch(reject);
      });
  });
};
