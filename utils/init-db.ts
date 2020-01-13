import * as AWS from 'aws-sdk';
import { dbConnection, BlogTableName } from './connect-db';
import { BlogStatisticsID } from './constant';

export const initDB = async () => {
  const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', ...dbConnection });
  const { TableNames = [] } = await dynamodb.listTables().promise();
  if (TableNames.indexOf(BlogTableName) === -1) {
    dynamodb.createTable();
  }
};
