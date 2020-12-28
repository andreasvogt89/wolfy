const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
         return res.status(403).send(err);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

module.exports = {
  authenticateToken
}
