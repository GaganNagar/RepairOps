const mongoose = require("mongoose");
const config = require ("./env")

async function connectDB(){
    try{
        await mongoose.connect(config.MONGO_URI)
        console.log("connect to database successfully")
    }
    catch(err){
        console.log("database connection failed with" + err)
    }
}
module.exports = connectDB
