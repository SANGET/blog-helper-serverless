import { BlogNamespace, FingerprintNamespace } from "./constant";

const uuidv5 = require('uuid/v5');

export const parseBody = <T = {}>(event): T => {
  let res;
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

/**
 * 基于 ip 和 type 生成 item 的指纹
 */
export const genFingerprint = ({
  fingerprint = '',
  ip = '',
  type
}) => {
  const id = fingerprint || ip;
  return uuidv5(`${id}_${type}`, FingerprintNamespace);
};

const errorMap = {
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not found',
};

/**
 * 统一 response 接口
 */
export const wrapResData = ({
  resData = {},
  msg = '',
  status = 200
}, headers = {}) => {
  let resBody = {};
  if (status < 300 && resData) {
    resBody = {
      data: resData,
    };
  } else {
    resBody = {
      error: msg || errorMap[status] || 'unknow error',
    };
  }
  Object.assign(resBody, msg && {
    message: msg
  });
  return {
    statusCode: status,
    headers: {
      // "Access-Control-Allow-Headers": "content-type,origin,FP",
      "Access-Control-Allow-Origin": "*",
      ...headers
    },
    body: JSON.stringify(resBody),
  };
};
