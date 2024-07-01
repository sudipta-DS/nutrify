const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  console.log(req.headers.authorization.split(" ")[1]);

  if (req.headers.authorization !== undefined) {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "nutrifyApp", (error, data) => {
      if (!error) {
        next();
      } else {
        res.status(403).send({ message: "invalid token" });
      }
    });
  } else {
    res.send({ message: "please provide a token" });
  }
}

module.exports = verifyToken;
