const jwt = require("jsonwebtoken");
const config = require("../config/env");

function authenticate(req, res, next) {
  // Request ke headers se token lete hain.
  const authorization = req.headers.authorization;

  // Login nahi hai ya token nahi bheja, to access nahi milega.
  if (!authorization) {
    const error = new Error("Login required");
    error.statusCode = 401;
    return next(error);
  }

  // Header ka format hona chahiye: Bearer <token>
  const [scheme, token, extra] = authorization.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token || extra) {
    const error = new Error("Authorization header must use Bearer token");
    error.statusCode = 401;
    return next(error);
  }

  try {
    // Secret key se check karte hain ki token sahi aur abhi valid hai.
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Hamare token mein user ki ID `user` naam se save hoti hai.
    if (typeof decoded !== "object" || decoded === null || !decoded.user) {
      const error = new Error("Invalid token");
      error.statusCode = 401;
      return next(error);
    }

    // Agle route mein user ID aur token ki baaki details milengi.
    req.user = decoded.user;
    req.role = decoded.role 
    next();

  } catch (error) {
    // Galat ya expire hue token ko login error ke roop mein bhejte hain.
    if (error instanceof jwt.JsonWebTokenError) {
      const invalidTokenError = new Error("Invalid or expired token");
      invalidTokenError.statusCode = 401;
      return next(invalidTokenError);
    }

    // Agar koi alag error aaya, use error handler tak bhejo.
    next(error);
  }
}

module.exports = authenticate;