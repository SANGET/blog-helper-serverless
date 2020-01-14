import { BlogTableName, BlogTableIndex } from "./connect-db";
import { wrapStatisticsItemID, StatisticsParams } from "./statistics";
import { genBlogID } from "./helpers";

export const countItems = async (
  dynamoDb: AWS.DynamoDB.DocumentClient,
  params: StatisticsParams
) => {
  const itemID = wrapStatisticsItemID(params);

  const queryData = await dynamoDb
    .get({
      TableName: BlogTableName,
      Key: {
        ID: itemID,
        BlogID: params.BlogID
      }
    })
    .promise();
  const { Item = {} } = queryData || {};

  return Item.Counter || 0;
};

export const wrapBatchGetItemCondition = (
  blogTitles,
  type: StatisticsParams['type'],
  dynamoDb: AWS.DynamoDB.DocumentClient
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
