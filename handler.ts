const AWS = require('aws-sdk');

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!!!!',
        input: event,
      },
      null,
      2,
    ),
  };
};

const getLikeByBlogID = () => {
  return null;
};

module.exports.getLikes = async (event, context, callback) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'BlogLike',
  };
  return dynamoDb.query(params, (err, queryData) => {
    if (err) {
      callback(err);
    }
    const { Items, Count } = queryData;
    callback(null, {
      Items,
      Count,
    });
  });
};

module.exports.likeBlog = async (event, context, callback) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  return dynamoDb.query({}, (err, queryData) => {
    const params = {

    };
    dynamoDb.createSet(params, (error, data) => {
      if (error) {
        callback(error);
      }
      callback(null, { message: 'Profile successfully updated', params });
    });
  });
};
