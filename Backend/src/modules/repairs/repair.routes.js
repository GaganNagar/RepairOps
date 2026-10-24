const express = require("express")
const authenticate = require("../../middlewares/authenticate");
const { validateCreateRepair } = require("./repair.validations");
const {
  createRepair,
  getRepair,
  getRepairById,
  assignTechnician,
  submitEstimate,
  respondToEstimate,
  startRepair,
  completeRepair,
  cancelRepair,
} = require("./repair.controller");
const { authorizedCustomer } = require("../../middlewares/authorize");

const router = express.Router()

router.post("/", authenticate,authorizedCustomer, validateCreateRepair, createRepair);
router.get("/",authenticate, authorizedCustomer, getRepair);
router.get("/:id", getRepairById);
router.post("/:id/assign", assignTechnician);
router.post("/:id/estimate", submitEstimate);
router.post("/:id/estimate-response", respondToEstimate);
router.post("/:id/start", startRepair);
router.post("/:id/complete", completeRepair);
router.post("/:id/cancel", cancelRepair);


module.exports = router