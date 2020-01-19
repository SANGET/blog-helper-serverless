import internalInitDB from './utils/apis/init-db';
import { VisitBlog, GetVisitorsByTitles } from './utils/apis/visitor';
import { resolveGetParams, resolvePostParams } from './utils/resolve-params';
import { LikeBlog, GetLikesByTitles } from './utils/apis/like';
import { wrapResData } from './utils/helpers';

const handleParamsErr = (paramName) => {
  return wrapResData({
    status: 400,
    msg: `Need to pass ${paramName}`
  });
};

export const initDB = internalInitDB;
export const likeBlog = async (event, context) => {
  const { body, clientIP, fingerprint } = resolveGetParams(event);
  const { blogTitle } = body;

  if (!blogTitle) {
    return handleParamsErr('blogTitle');
  }

  const res = await LikeBlog({
    blogTitle,
    fingerprint,
    clientIP
  });

  return res;
};
export const visitBlog = async (event, context) => {
  const { body, clientIP, fingerprint } = resolveGetParams(event);
  const { blogTitle } = body;

  if (!blogTitle) {
    return handleParamsErr('blogTitle');
  }

  const res = await VisitBlog({
    blogTitle,
    fingerprint,
    clientIP
  });

  return res;
};
export const getLikesByTitles = async (event, context) => {
  const { body, fingerprint } = resolvePostParams(event);
  const { blogTitles, detail = false } = body;

  if (!blogTitles) {
    return handleParamsErr('blogTitles[]');
  }

  const res = await GetLikesByTitles(blogTitles, fingerprint, detail);

  return res;
};
export const getVisitorsByTitles = async (event, context) => {
  const { body, fingerprint } = resolvePostParams(event);
  const { blogTitles, detail = false } = body;

  if (!blogTitles) {
    return handleParamsErr('blogTitles[]');
  }

  const res = await GetVisitorsByTitles(blogTitles, fingerprint, detail);

  return res;
};
