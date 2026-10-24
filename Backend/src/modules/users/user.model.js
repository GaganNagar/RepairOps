const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Name is required" ],
        trim:true
    },
    email : {
        type : String,
        required : [true, "Email is required" ],
        unique : true,
        trim:true,
        lowercase:true
    },
    passwordHash : {
        type : String,
        required : [true, "Password is required" ],
    },
    role : {
        type : String,
        required : [true, "Role is required" ],
        enum : ["customer", "technician", "admin"],
        default: "customer"
    },
    isActive : {
        type : Boolean,
        default : true
    }
},{
    timestamps : true
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel
