// when someone visit this blog, auto create a record of BlogInfoStruc
const BlogInfoStruc = {
  blogID: '',
  like: 0, // when someone like this blog, increase this count, and put an item of BlogLikeStuct 
  visitors: 0, // when someone visit this blog, increase this count
  comment: 0,
};

const BlogLikeStuct = {
  likeID: '',
  ip: '',
  userAgent: '',
};
