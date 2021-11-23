const jwt = require('jsonwebtoken');

function isAuthorized(req, res, next) {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    try {
      const decoded = jwt.verify(bearer[1], process.env.JWT_SECRET);
      if (decoded.staffID) {
        res.locals.user = decoded.staffID;
        next();
      } else {
        res.statusCode = 401;
        next({ internalMessage: 'Unautharised' });
      }
    } catch (err) {
      res.statusCode = 401;
      if (err.name === 'TokenExpiredError') {
        res.json({ error: 'Token Expired' });
      } else {
        next(err);
      }
    }
  } else {
    res.statusCode = 401;
    next({ internalMessage: 'No token given' });
  }
}

module.exports = {
  isAuthorized,
};