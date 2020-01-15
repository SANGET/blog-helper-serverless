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
        msg: 'Create table success',
        resData: actionRes,
        status: 201
      });
    } catch (e) {
      return wrapResData({
        msg: 'Create table faild',
        resData: actionRes,
        status: 500
      }, {});
    }
  }
  return wrapResData({
    msg: 'Table exist',
  });
};

export default initDB;
