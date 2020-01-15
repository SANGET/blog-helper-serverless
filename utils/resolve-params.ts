import { getClientIPAndFP, parseBody } from "./helpers";

/**
 * 分析来自 post 请求的数据
 */
export const resolvePostParams = <T>(event) => {
  const { ip } = getClientIPAndFP(event);
  const body = parseBody<T>(event);

  return {
    body,
    clientIP: ip
  };
};

/**
 * 分析来自 get 请求的数据
 */
export const resolveGetParams = (event) => {
  const { ip } = getClientIPAndFP(event);
  const body = event.queryStringParameters;

  return {
    body,
    clientIP: ip
  };
};
