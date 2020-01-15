import internalInitDB from './utils/init-db';
import { VisitBlog, GetVisitorsByTitles } from './utils/apis/visitor';
import { resolveGetParams, resolvePostParams } from './utils/resolve-params';
import { LikeBlog, GetLikesByTitles } from './utils/apis/like';
import { wrapResData } from './utils/helpers';

interface QueryItemCondition {
  blogTitle: string;
  blogTitles: string[];
}

const handleParamsErr = (paramName) => {
  return wrapResData({
    status: 400,
    msg: `Need to pass ${paramName}`
  });
};

export const initDB = internalInitDB;
export const likeBlog = async (event, context) => {
  const { body, clientIP } = resolveGetParams(event);
  const { blogTitle } = body;

  if (!blogTitle) {
    return handleParamsErr('blogTitle');
  }

  const res = await LikeBlog({
    blogTitle,
    clientIP
  });

  return res;
};
export const visitBlog = async (event, context) => {
  const { body, clientIP } = resolveGetParams(event);
  const { blogTitle } = body;

  if (!blogTitle) {
    return handleParamsErr('blogTitle');
  }

  const res = await VisitBlog({
    blogTitle,
    clientIP
  });

  return res;
};
export const getLikesByTitles = async (event, context) => {
  const { body } = resolvePostParams(event);
  const { blogTitles } = body;

  if (!blogTitles) {
    return handleParamsErr('blogTitles[]');
  }

  const res = await GetLikesByTitles(blogTitles);

  return res;
};
export const getVisitorsByTitles = async (event, context) => {
  const { body } = resolvePostParams(event);
  const { blogTitles } = body;

  if (!blogTitles) {
    return handleParamsErr('blogTitles[]');
  }

  const res = await GetVisitorsByTitles(blogTitles);

  return res;
};
