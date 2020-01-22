import { getClientIPAndFP, parseBody } from "./helpers";

const getFingerprintFromHeader = (event) => {
  const { headers } = event;
  return headers.FP || headers.fingerprint || headers.fp;
};

/**
 * 分析来自 post 请求的数据
 */
export const resolvePostParams = <T>(event) => {
  const fingerprint = getFingerprintFromHeader(event);
  const { ip } = getClientIPAndFP(event);
  const body = parseBody<T>(event);

  return {
    body,
    clientIP: ip,
    fingerprint
  };
};

/**
 * 分析来自 get 请求的数据
 */
export const resolveGetParams = (event) => {
  const fingerprint = getFingerprintFromHeader(event);
  const { ip } = getClientIPAndFP(event);
  const body = event.queryStringParameters;

  return {
    body,
    clientIP: ip,
    fingerprint
  };
};
