function validateRegister(req, res, next) {
    const { name, email, password } = req.body || {}

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Name is required"
        })
    }

    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return res.status(400).json({
            message: "A valid email is required"
        })
    }

    if (typeof password !== "string" || !password) {
        return res.status(400).json({
            message: "Password is required"
        })
    }
    next()
}


function validateLogin(req, res, next) {
    const { email, password } = req.body || {}

    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
        return res.status(400).json({
            message: "A valid email is required"
        })
    }

    if (typeof password !== "string" || !password) {
        return res.status(400).json({
            message: "Password is required"
        })
    }

    next()
}

function validateRefreshTokenCookie(req, res, next) {
    if (typeof req.cookies?.refreshToken !== "string" || !req.cookies.refreshToken) {
        return res.status(400).json({
            message: "Refresh token cookie is required"
        })
    }
    next()
}

module.exports = {
    validateRegister,
    validateLogin,
    validateAccessTokenHeader,
    validateRefreshTokenCookie
} 