const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const jwt = require("jsonwebtoken");

  if (!token) return res.sendStatus(401);

  jwt.verify(token, "r$WMw32(wH^GaZZ", (err, user) => {
    if (err) return res.sendStatus(403); // invalid token
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
