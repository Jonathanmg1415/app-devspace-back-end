module.exports = function nokResponse(data) {
  return this.res.status(500).json(data || { error: 'Internal Server Error' });
};
