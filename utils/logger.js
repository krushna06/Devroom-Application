const fs = require('fs');
const moment = require('moment-timezone');
const path = require('path');
let chalk;

(async () => {
  chalk = await import('chalk');
})();

const logsDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

const logToFile = (message, type) => {
  const timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  let coloredMessage;

  switch (type) {
    case 'database':
      coloredMessage = chalk.default.green(`[Database] ${message}`);
      break;
    case 'command':
      coloredMessage = chalk.default.cyan(`[Command] ${message}`);
      break;
    case 'error':
      coloredMessage = chalk.default.red(`[Error] ${message}`);
      break;
    default:
      coloredMessage = message;
  }

  const logMessage = chalk.default.white(`[${timestamp}] `) + coloredMessage;
  const logToFileMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(path.join(logsDirectory, 'logs.txt'), logToFileMessage);
  console.log(logMessage);
};

module.exports = { logToFile };
