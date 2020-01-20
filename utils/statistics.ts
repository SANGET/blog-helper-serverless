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
  // VisitorCount: {
  //   [blogID: string]: number;
  // };
  // LikeCount: {
  //   [blogID: string]: number;
  // };
}

const statisticsItemCache = {

};

export interface StatisticsParams {
  BlogID: string;
  type: HelperType;
}

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
      }, (err, data) => {
        resolve(data);
      });
  });
};

export const wrapStatisticsItemID = (params: StatisticsParams) => {
  return `${BlogStatisticsID}_${params.type}_${params.BlogID}`;
};

export const createStatisticsItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  params: {
    itemID: string;
    type: string;
  }
): Promise<{msg: string}> => {
  return new Promise(async (resolve, reject) => {
    const { itemID } = params;
    const hasCache = !!statisticsItemCache[itemID];
    if (hasCache) {
      resolve({ msg: 'Done' });
    } else {
      const { Item } = await getStatisticItem(dynamoDb, itemID);
      if (!Item) {
        // 如果没有统计 item，则创建一个
        dynamoDb.put({
          TableName: BlogStatisticsTableName,
          Item: {
            ID: itemID,
            Counter: 0
          },
        }, (putErr, putRes) => {
          statisticsItemCache[itemID] = true;
          resolve({ msg: 'Create Item Successed' });
        });
      } else {
        statisticsItemCache[itemID] = true;
        resolve({ msg: 'Has Record' });
      }
    }
  });
};

const typeToFieldMap = {
  like: 'LikeCount',
  visit: 'VisitorCount',
};

export const updateStatisticsItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  params: StatisticsParams
) => {
  return new Promise(async (resolve, reject) => {
    const itemID = wrapStatisticsItemID(params);
    const createRes = await createStatisticsItem(dynamoDb, {
      itemID, type: params.type
    });
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
    }, (err, data) => {
      console.log('update statictics', err, data);
      resolve(data);
    });
  });
};
