const {
  registerUser,
  loginUser,
  getUserProfile,
  refreshUserToken,
  logOutUser,
} = require("./auth.services");

async function register(req, res) {
  try {
    const { refreshToken, accessToken, user } = await registerUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "user registered successfully",
      user: {
        name: user.name,
        email: user.email,
        accessToken,
      }
    });
  }
   catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error"
    });
}
}

async function login(req, res) {
  try {
    const { user, refreshToken, accessToken } = await loginUser({
      email: req.body.email,
      password: req.body.password,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successfully",
      user: {
        name: user.name,
        email: user.email,
        accessToken,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

async function getMe(req, res) {
  try {
    const { user } = await getUserProfile({ userID: req.user });
    res.status(200).json({
      message: "User fetched successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error ",
    });
  }
}

async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  try {
    const {accessToken, newRefreshToken} = await refreshUserToken({refreshToken})
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "access token created",
        accessToken
    }); 
  }

  catch(error){
    res.status(error.statusCode).json({
        message : error.message || "Internal server error"
    })
  }
}


async function logOut(req, res) {
  const refreshToken = req.cookies.refreshToken;
  try {
      const result = await logOutUser({refreshToken})
      res.clearCookie("refreshToken");
  res.status(201).json({
    message: "Logged Out",
  });
  }
    catch(error){
    res.status(error.statusCode).json({
        message : error.message || "Internal server error"
    })
  }
}

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logOut,
};
