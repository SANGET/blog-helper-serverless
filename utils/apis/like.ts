import { getCounterFac, genAddFac } from './fac';

export const LikeBlog = async ({
  blogTitle,
  fingerprint,
  clientIP
}) => {
  const res = await genAddFac({
    blogTitle,
    fingerprint,
    clientIP,
    type: 'like'
  });
  return res;
};

export const GetLikesByTitles = async (
  blogTitles: string[],
  fingerprint: string,
  detail: boolean
) => {
  const res = await getCounterFac({
    blogTitles, type: 'like', fingerprint, detail
  });
  return res;
};
