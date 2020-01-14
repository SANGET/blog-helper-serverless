/* eslint-disable no-async-promise-executor */
import * as AWS from 'aws-sdk';
import { dbConnection, BlogTableName } from '../connect-db';
import { createTableParams } from './params';

const initDB = () => {
  return new Promise(async (resolve, reject) => {
    const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10', ...dbConnection });
    const { TableNames = [] } = await dynamodb.listTables().promise();
    if (TableNames.indexOf(BlogTableName) === -1) {
      dynamodb.createTable(createTableParams, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    }
  });
};

export default initDB;
