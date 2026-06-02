module.exports = function conflict(data) {
  return this.res.status(409).json(data || { error: 'Conflict' });
};
