const allowedDeviceTypes = ["laptop", "desktop", "mobile", "tablet"];
const allowedFields = [
  "deviceType",
  "brand",
  "model",
  "issueDescription",
];

function validateCreateRepair(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({
      message: "Request body must be a JSON object",
    });
  }

  const unexpectedField = Object.keys(body).find(
    (field) => !allowedFields.includes(field),
  );
  if (unexpectedField) {
    return res.status(400).json({
      message: `Field "${unexpectedField}" is not allowed`,
    });
  }

  const { deviceType, brand, model, issueDescription } = body;

  if (
    typeof deviceType !== "string" ||
    !allowedDeviceTypes.includes(deviceType)
  ) {
    return res.status(400).json({
      message: `Device type must be one of: ${allowedDeviceTypes.join(", ")}`,
    });
  }

  if (typeof brand !== "string" || !brand.trim()) {
    return res.status(400).json({
      message: "Brand is required and must be a non-empty string",
    });
  }

  if (typeof model !== "string" || !model.trim()) {
    return res.status(400).json({
      message: "Model is required and must be a non-empty string",
    });
  }

  if (typeof issueDescription !== "string" || !issueDescription.trim()) {
    return res.status(400).json({
      message: "Issue description is required and must be a non-empty string",
    });
  }

  if (issueDescription.trim().length > 2000) {
    return res.status(400).json({
      message: "Issue description must be 2000 characters or fewer",
    });
  }

  next();
}

module.exports = {
  validateCreateRepair,
};