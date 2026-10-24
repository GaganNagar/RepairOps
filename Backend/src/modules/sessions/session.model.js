const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    refreshTokenHash : {
        type : String,
        required : [true, "refreshToken is required"]
    },
    userAgent : {
        type:String
    },
    ip : {
        type : String
    },
    revoked : {
        type : Boolean,
        default : false
    }
},
{
    timestamps : true
}
)


const sessionModel = mongoose.model("sessions", sessionSchema)

module.exports = sessionModel