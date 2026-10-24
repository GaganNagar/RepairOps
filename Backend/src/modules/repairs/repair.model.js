const mongoose = require("mongoose")

const repairStatuses = [
    "REQUESTED",
    "ASSIGNED",
    "ESTIMATE_PENDING",
    "APPROVED",
    "REJECTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED"
]

const estimateSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    respondedAt: {
        type: Date
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { _id: false })

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: repairStatuses,
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { _id: false })

const repairSchema = new mongoose.Schema({
    customerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    technicianId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
    },
    deviceType : {
        type : String,
        enum : ["laptop", "desktop", "mobile", "tablet"],
        required : true
    },
    brand : {
        type : String,
        required : true,
        trim : true
    },
    model : {
        type : String,
        required : true,
        trim : true
    },
    issueDescription : {
        type : String,
        required : true,
        trim : true,
        maxlength : 2000
    },
    status : {
        type : String,
        enum : repairStatuses,
        default : "REQUESTED",
        required : true
    },
    estimate : {
        type : estimateSchema,
        default : undefined
    },
    statusHistory : {
        type : [statusHistorySchema],
        default : []
    }
},
{
    timestamps : true
}
)

const repairModel = mongoose.model("repairs", repairSchema)

module.exports = repairModel