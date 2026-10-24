require('dotenv').config();
const connectDB  = require ("./src/config/database");

const app = require('./src/app');

const rawPort = process.env.PORT || '5000';
const port = Number(rawPort);
connectDB()
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const server = app.listen(5000, () => {
  console.log(`FixFlow API listening on port ${port}`);
  // console.log(`FixFlow API listening on port 5000`);
});

server.on('error', (error) => {
  console.error('Failed to start FixFlow API:', error);
  process.exitCode = 1;
});

function shutDown(signal) {
  console.log(`${signal} received; closing HTTP server`);
  server.close((error) => {
    if (error) {
      console.error('Failed to close HTTP server cleanly:', error);
      process.exitCode = 1;
      return;
    }

    console.log('HTTP server closed');
  });
}

process.once('SIGINT', () => shutDown('SIGINT'));
process.once('SIGTERM', () => shutDown('SIGTERM'));
