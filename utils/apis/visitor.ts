import { getCounterFac, genAddFac } from './fac';

export const VisitBlog = async ({
  clientIP,
  fingerprint,
  blogTitle
}) => {
  const res = await genAddFac({
    blogTitle,
    fingerprint,
    clientIP,
    type: 'visit'
  });
  return res;
};

export const GetVisitorsByTitles = async (blogTitles: string[], fingerprint: string, detail) => {
  const res = await getCounterFac({
    blogTitles, type: 'visit', fingerprint, detail
  });
  return res;
};
