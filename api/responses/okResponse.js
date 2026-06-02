module.exports = function okResponse(data) {
  return this.res.status(200).json(data || {});
};
