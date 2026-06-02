module.exports = function unauthorized(data) {
  return this.res.status(401).json(data || { error: 'Unauthorized' });
};
