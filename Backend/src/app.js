const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require("./modules/auth/auth.routes")
const repairRoutes = require("./modules/repairs/repair.routes")
const cookieParser = require("cookie-parser")

const app = express();

app.use(express.json());
app.use(cookieParser())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use("/api/auth", authRoutes)
app.use("/api/repairs", repairRoutes)

app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
