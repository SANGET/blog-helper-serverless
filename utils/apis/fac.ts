import { connectDB } from "../connect-db";
import { wrapResData } from "../helpers";
import { wrapBatchGetItemCondition } from "../counter";

/**
 * 获取统计数据的 factory
 */
export const getCounterFac = async (blogTitles: string[], type) => {
  const dynamoDb = connectDB();
  const batchGetItemCondition = wrapBatchGetItemCondition(blogTitles, type, dynamoDb);
  const counterRes = await Promise.all(batchGetItemCondition);

  return wrapResData({
    resData: counterRes
  });
};
