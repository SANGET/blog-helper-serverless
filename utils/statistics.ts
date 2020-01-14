/* eslint-disable default-case */
/* eslint-disable no-async-promise-executor */
import { BlogStatisticsID } from "./constant";
import { BlogTableName } from "./connect-db";

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
  type: 'like' | 'visit';
}

export const getStatisticItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  itemID: string
): Promise<AWS.DynamoDB.DocumentClient.QueryOutput> => {
  return new Promise((resolve, reject) => {
    dynamoDb
      .query({
        TableName: BlogTableName,
        KeyConditions: {
          ID: {
            ComparisonOperator: 'EQ',
            AttributeValueList: [itemID]
          }
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
  params: StatisticsParams
): Promise<{msg: string}> => {
  return new Promise(async (resolve, reject) => {
    const { BlogID } = params;
    const itemID = wrapStatisticsItemID(params);
    const hasCache = !!statisticsItemCache[itemID];
    if (hasCache) {
      resolve({ msg: 'Done' });
    } else {
      const queryRes = await getStatisticItem(dynamoDb, itemID);
      if (queryRes.Count === 0) {
        // 如果没有统计 item，则创建一个
        dynamoDb.put({
          TableName: BlogTableName,
          Item: {
            ID: itemID,
            BlogID,
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
    await createStatisticsItem(dynamoDb, params);
    const { BlogID, type } = params;
    const itemID = wrapStatisticsItemID(params);
    dynamoDb.update({
      TableName: BlogTableName,
      Key: {
        ID: itemID,
        BlogID
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
      console.log(err, data);
    });
  });
};
