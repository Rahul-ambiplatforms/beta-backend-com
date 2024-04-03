const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, 'your_secret_key_here');
    req.user = decodedToken.userId;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = isAuthenticated;
