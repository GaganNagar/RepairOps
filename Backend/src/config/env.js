require('dotenv').config()


if(!process.env.MONGO_URI){
    throw new error("Mongo uri not found")
}
if(!process.env.JWT_SECRET){
    throw new error("Secret Key not found")
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET : process.env.JWT_SECRET
}
module.exports = config