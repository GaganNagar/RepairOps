const userModel = require("../users/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config/env");
const crypto = require("crypto");
const sessionModel = require("../sessions/session.model");

async function refreshAndSessionValidate({ refreshToken }) {
  if (!refreshToken) {
    const error = new Error("Token not found");
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const error = new Error("Invalid or expired token");
      error.statusCode = 401;
      throw error;
    }
    throw error;
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    const error = new Error("unauthorized");
    error.statusCode = 401;
    throw error;
  }

  return { decoded, session };
}

async function refreshAccessSessionGenerate({ user, userAgent, ip }) {
  const refreshToken = jwt.sign(
    {
      user: user._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    userAgent,
    ip,
  });

  const accessToken = jwt.sign(
    {
      user: user._id,
      sessionId: session._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  return { refreshToken, accessToken };
}

async function registerUser({ name, email, password, userAgent, ip }) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const isUserAlreadyExists = await userModel.findOne({
    email: normalizedEmail,
  });

  if (isUserAlreadyExists) {
    const error = new Error("User already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
  });

  const refreshToken = jwt.sign(
    {
      user: user._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    userAgent,
    ip,
  });

  const accessToken = jwt.sign(
    {
      user: user._id,
      sessionId: session._id,
      role: user.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
  return { user, refreshToken, accessToken };
}
async function loginUser({ email, password, userAgent, ip }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await userModel.findOne({
    email: normalizedEmail,
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error("Invalid email or password");
    error.statusCode = 403;
    throw error;
  }
  const { refreshToken, accessToken } = await refreshAccessSessionGenerate({
    user,
    userAgent,
    ip,
  });

  return { user, refreshToken, accessToken };
}

async function getUserProfile({ userID }) {
  
  const user = await userModel
    .findById(userID)
    .select("name email role isActive");

  if (!user) {
    const error = new Error("User Not Found");
    error.statusCode = 404;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error("Account is not active");
    error.statusCode = 403;
    throw error;
  }

  return { user };
}
async function refreshUserToken({ refreshToken }) {
  try {
    const { decoded, session } = await refreshAndSessionValidate({
      refreshToken,
    });
    const newRefreshToken = jwt.sign(
      {
        user: decoded.user,
        role: decoded.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    const accessToken = jwt.sign(
      {
        user: decoded.user,
        sessionId: session._id,
        role: decoded.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );
    return { accessToken, newRefreshToken };
  } catch (error) {
    throw error;
  }
}
async function logOutUser({ refreshToken }) {
  try {
    const { session } = await refreshAndSessionValidate({ refreshToken });
    session.revoked = true;
    await session.save();
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  refreshUserToken,
  logOutUser,
};
