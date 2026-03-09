import chalk from "chalk";

const logger = {
  info: (msg) => console.log(chalk.cyan(msg)),
  success: (msg) => console.log(chalk.green(msg)),
  error: (msg) => console.log(chalk.red(msg)),
  warn: (msg) => console.log(chalk.yellow(msg)),
  dim: (msg) => console.log(chalk.gray(msg)),
};

export default logger;
