const express = require("express")
const {register, login, getMe, refreshToken, logOut} = require("./auth.controller")
const { validateRegister, validateLogin, validateAccessTokenHeader, validateRefreshTokenCookie } = require('./auth.validation')
const authenticate = require("../../middlewares/authenticate")
const router = express.Router()

router.post("/register",validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/get-me",authenticate, getMe)
router.post("/refresh", validateRefreshTokenCookie, refreshToken)
router.post("/logout", validateRefreshTokenCookie, logOut)

module.exports = router
