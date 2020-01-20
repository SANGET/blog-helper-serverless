import {
  BlogStatisticsTableName
} from "../connect-db";
import { wrapStatisticsItemID, StatisticsParams } from "../statistics";
import { genBlogID } from "../helpers";

export const countItems = async (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  params: StatisticsParams
) => {
  const itemID = wrapStatisticsItemID(params);

  const queryData = await dynamoDb
    .get({
      TableName: BlogStatisticsTableName,
      Key: {
        ID: itemID,
      }
    })
    .promise();
  const { Item = {} } = queryData || {};

  return Item.Counter || 0;
};

export const wrapBatchGetItemCondition = (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  {
    blogTitles,
    type
  },
) => {
  let _blogTitles = blogTitles;

  if (!Array.isArray(blogTitles)) {
    _blogTitles = [blogTitles];
  }

  _blogTitles = _blogTitles.filter((item) => !!item);

  const queryQueue: Promise<any>[] = [];

  _blogTitles.forEach((title) => {
    const BlogID = genBlogID(title);
    queryQueue.push(
      countItems(dynamoDb, {
        BlogID, type
      })
    );
  });

  return queryQueue;
};
