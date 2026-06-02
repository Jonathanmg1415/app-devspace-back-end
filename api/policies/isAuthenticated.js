const jwt = require('jsonwebtoken');

module.exports = async function (req, res, proceed) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  sails.log.debug('isAuthenticated - token presente:', !!token);
  sails.log.debug('isAuthenticated - JWT_SECRET presente:', !!process.env.JWT_SECRET);

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const secret = process.env.JWT_SECRET || sails.config.custom.jwtSecret;
    sails.log.debug('isAuthenticated - secret usado (primeros 10):', secret?.slice(0, 10));
    const payload = jwt.verify(token, secret);
    req.user = await User.findOne({ id: payload.id });
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    return proceed();
  } catch (err) {
    sails.log.error('isAuthenticated - error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
