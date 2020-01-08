// when someone visit this blog, auto create a record of BlogInfoStruc
interface BlogInfoStruc {
  blogID: string;
  // when someone like this blog, increase this count, and put an item of BlogLikeStuct
  like: number;
  visitors: number; // when someone visit this blog, increase this count
  comment: number;
}

interface BlogLikeStuct {
  likeID: string;
  ip: string;
  userAgent: string;
}
