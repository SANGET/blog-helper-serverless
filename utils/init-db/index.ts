/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */
import * as AWS from 'aws-sdk';
import { dbConnection, BlogTableName } from '../connect-db';
import { createTableParams } from './params';
import { wrapResData } from '../helpers';

const initDB = async () => {
  const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', ...dbConnection });
  const { TableNames = [] } = await dynamodb.listTables().promise();
  if (TableNames.indexOf(BlogTableName) === -1) {
    let actionRes;
    try {
      actionRes = await dynamodb.createTable(createTableParams).promise();
      return wrapResData({
        Message: 'Create table success',
        ActionRes: actionRes
      });
    } catch (e) {
      return wrapResData({
        Message: 'Create table faild',
        ActionRes: actionRes
      }, {}, 500);
    }
  }
  return wrapResData({
    Message: 'Table exist'
  });
};

export default initDB;
