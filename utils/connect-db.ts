import * as AWS from 'aws-sdk';

const isDev = process.env.NODE_ENV === 'development';
const dbConnection = isDev ? {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
} : undefined;

export const connectDB = () => {
  return new AWS.DynamoDB.DocumentClient(dbConnection);
};

export const BlogTableName = 'BlogState';
export const BlogTableIndex = 'BlogIPIndex';
