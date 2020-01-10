/* eslint-disable default-case */
/* eslint-disable no-async-promise-executor */
import { BlogStatisticsID } from "./constant";
import { BlogTableName } from "./connect-db";

/**
 * 统计 item 的数据结构
 */
interface BlogStatisticsDataStruct {
  // hash key
  ID: 'BlogStatistics';
  // range key
  BlogID: 'BlogStatistics';
  VisitorCount: {
    [blogID: string]: number;
  };
  LikeCount: {
    [blogID: string]: number;
  };
}

let hasStatisticsItemCache = false;

export const getStatisticItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient
): Promise<AWS.DynamoDB.DocumentClient.QueryOutput> => {
  return new Promise((resolve, reject) => {
    dynamoDb
      .query({
        TableName: BlogTableName,
        KeyConditions: {
          ID: {
            ComparisonOperator: 'EQ',
            AttributeValueList: [BlogStatisticsID]
          }
        }
      }, (err, data) => {
        resolve(data);
      });
  });
};

export const createStatisticsItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient
): Promise<{msg: string}> => {
  return new Promise(async (resolve, reject) => {
    if (hasStatisticsItemCache) {
      return resolve({ msg: 'Done' });
    }
    const queryRes = await getStatisticItem(dynamoDb);
    if (queryRes.Count === 0) {
      // 如果没有统计 item，则创建一个
      dynamoDb.put({
        TableName: BlogTableName,
        Item: {
          ID: BlogStatisticsID,
          BlogID: BlogStatisticsID,
        }
      }, (putErr, putRes) => {
        hasStatisticsItemCache = true;
        resolve({ msg: 'Create Item Successed' });
      });
    } else {
      hasStatisticsItemCache = true;
      resolve({ msg: 'Has Record' });
    }
  });
};

interface UpdateParams {
  BlogID: number;
  type: 'like' | 'visit';
}

const typeToFieldMap = {
  like: 'LikeCount',
  visit: 'VisitorCount',
};

export const updateStatisticsItem = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  updateParams: UpdateParams
) => {
  return new Promise(async (resolve, reject) => {
    const queryRes = await getStatisticItem(dynamoDb);
    const { BlogID, type } = updateParams;
    const statisticsItem = (queryRes.Items || [])[0];
    const setField: string[] = [];
    switch (type) {
      case 'like':
        setField.push('LikeCount');
        break;
      case 'visit':
        setField.push('VisitorCount');
        break;
    }
    if (setField.length > 0) {
      let setExpression = '';
      const expressionAttributeValues = {};
      setField.forEach((item, idx) => {
        setExpression += `${item} := setField${idx},`;
        const currCount: number = (statisticsItem[item] || {})[BlogID] || 0;
        expressionAttributeValues[`setField${idx}`] = {
          N: String(currCount + 1)
        };
      });
      setExpression = setExpression.replace(/,$/gi, '');
      // console.log(JSON.stringify(expressionAttributeValues));
      dynamoDb.update({
        TableName: BlogTableName,
        Key: {
          ID: BlogStatisticsID
        },
        UpdateExpression: `SET ${setExpression}`,
        ExpressionAttributeValues: expressionAttributeValues,
      });
    }
  });
};
