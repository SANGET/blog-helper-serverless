export default (event) => {
  let res = {};
  try {
    res = JSON.parse(event.body);
  } catch (e) {
    console.log(e);
  }
  return res;
};
