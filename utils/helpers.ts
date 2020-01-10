import { BlogNamespace } from "./constant";

const uuidv5 = require('uuid/v5');

export const parseBody = (event) => {
  let res = {};
  try {
    res = JSON.parse(event.body);
  } catch (e) {
    console.log(e);
  }
  return res;
};

export const genBlogID = (blogTitle: string) => {
  return uuidv5(blogTitle, BlogNamespace);
};

export const genBlogStorage = (blogTitle: string) => {
  return Buffer.from(blogTitle).toString('base64');
};

export const getClientIPAndFP = (event) => {
  // 获取客户端的 ip 和指纹
  const clientIP = event.requestContext.identity.sourceIp;
  return {
    ip: clientIP
  };
};
