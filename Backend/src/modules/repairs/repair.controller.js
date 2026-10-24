
const {
  createRepairRequest,
  getRepairRequest,
  getRepairRequestById,
  assignTechnicianRepair,
  submitRepairEstimate,
  respondToRepairEstimate,
  startRepairWork,
  completeRepairWork,
  cancelRepairRequest,
} = require("./repair.service");

async function createRepair(req, res, next){
    try{
        const {repair} = await createRepairRequest({
            customerId: req.user,
            deviceType : req.body.deviceType,
            brand : req.body.brand,
            model : req.body.model,
            issueDescription : req.body.issueDescription
        })

        res.status(201).json({
            message :"repair request created successfully",
            repair
        })
    }
    catch(error){
        next(error)
    }
}


async function getRepair(req, res, next){
    try{
        const {repairDetails} = await getRepairRequest({
            user : req.user,
            role : req.role
        })

        res.status(200).json({
            message : "Details fetched successfully"
        })
    }
    catch(error){
        next(error)
    }

}
async function getRepairById(){

}
async function assignTechnician(){

}
async function submitEstimate(){

}
async function respondToEstimate(){

}
async function startRepair(){

}
async function completeRepair(){

}
async function cancelRepair(){

}

module.exports = {
  createRepair,
  getRepair,
  getRepairById,
  assignTechnician,
  submitEstimate,
  respondToEstimate,
  startRepair,
  completeRepair,
  cancelRepair,
};
