
function authorizedCustomer(req, res, next){
    const role = req.role
    if(role !== "customer"){
        const error = new Error("Unauthorized")
        error.statusCode = 403
        return next(error)
    }
    if(role === "customer"){
        next()
    }
}

module.exports = {authorizedCustomer}