import { BlogTableName } from "../connect-db";

export const createTableParams = {
  TableName: BlogTableName,
  // The type of of schema.  Must start with a HASH type, with an optional second RANGE.
  KeySchema: [
    {
      AttributeName: 'ID',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'BlogID',
      KeyType: 'RANGE',
    },
  ],
  // The names and types of all primary and index key attributes only
  AttributeDefinitions: [
    {
      AttributeName: 'ID',
      AttributeType: 'S', // (S | N | B) for string, number, binary
    },
    {
      AttributeName: 'BlogID',
      AttributeType: 'S', // (S | N | B) for string, number, binary
    },
    {
      AttributeName: 'IP',
      AttributeType: 'S', // (S | N | B) for string, number, binary
    },
  ],
  ProvisionedThroughput: { // required provisioned throughput for the table
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  GlobalSecondaryIndexes: [ // optional (list of LocalSecondaryIndex)
    {
      IndexName: 'BlogIPIndex',
      KeySchema: [
        { // Required HASH type attribute - must match the table's HASH key attribute name
          AttributeName: 'BlogID',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'IP',
          KeyType: 'RANGE',
        },
      ],
      Projection: { // required
        ProjectionType: 'ALL', // (ALL | KEYS_ONLY | INCLUDE)
      },
      ProvisionedThroughput: { // throughput to provision to the index
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  ],
};
