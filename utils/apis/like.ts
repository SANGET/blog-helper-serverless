import { getCounterFac, genAddItemFac } from './fac';

export const LikeBlog = async ({
  blogTitle,
  fingerprint,
  clientIP
}) => {
  return genAddItemFac({
    blogTitle,
    fingerprint,
    clientIP,
    type: 'like'
  });
};

export const GetLikesByTitles = async (
  blogTitles: string[],
  fingerprint: string,
  detail: boolean
) => {
  return getCounterFac({
    blogTitles, type: 'like', fingerprint, detail
  });
};
