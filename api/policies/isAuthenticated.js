const jwt = require('jsonwebtoken');

module.exports = async function (req, res, proceed) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || sails.config.custom.jwtSecret);
    req.user = await User.findOne({ id: payload.id });
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    return proceed();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
