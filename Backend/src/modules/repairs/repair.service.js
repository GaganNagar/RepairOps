const repairModel = require("./repair.model")

async function createRepairRequest({
  customerId,
  deviceType,
  brand,
  model,
  issueDescription,
}) {
 const repair =await repairModel.create({
     customerId,
  deviceType,
  brand,
  model,
  issueDescription,
 })

 return {repair}

}
async function getRepairRequest({
    user, role
}) {
    const repairDetails = await repairModel.findById({user})
}

async function getRepairRequestById() {}
async function assignTechnicianRepair() {}
async function submitRepairEstimate() {}
async function respondToRepairEstimate() {}
async function startRepairWork() {}
async function completeRepairWork() {}
async function cancelRepairRequest() {}

module.exports = {
  createRepairRequest,
  getRepairRequest,
  getRepairRequestById,
  assignTechnicianRepair,
  submitRepairEstimate,
  respondToRepairEstimate,
  startRepairWork,
  completeRepairWork,
  cancelRepairRequest,
};
