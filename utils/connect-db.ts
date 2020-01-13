import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const isDev = process.env.NODE_ENV === 'development';
export const dbConnection = isDev ? {
  region: 'localhost',
  endpoint: 'http://localhost:8000'
} : undefined;

export const connectDB = () => {
  return new DocumentClient(dbConnection);
};

export const BlogTableName = 'BlogState';
export const BlogTableIndex = 'BlogIPIndex';
