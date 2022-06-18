const { program } = require("commander");
const { promisify } = require("util");
const figlet = promisify(require("figlet"));
const { TEMPLATE } = require("../utils/constant");
const log = require("../utils/log");
const inquirer = require("inquirer");

program
  .version(`@cdwow/cd-cli ${require("../../../package").version}`, "-v")
  .usage("<command> [options]");

program.on("command:*", function () {
  log(
    "ERROR",
    `Invalid command: ${program.args.join(
      " "
    )}\nSee --help for a list of available commands.`
  );
  process.exit(1);
});

program
  // 监听 --help 执行
  .on("--help", () => {
    // 新增说明信息
    log(
      "LIGHT",
      figlet.textSync("CD-CLI", {
        horizontalLayout: "Isometric1",
        verticalLayout: "fitted",
        width: 80,
        whitespaceBreak: true,
      })
    );
    log("LOADING", `\r\nRun --help for detailed usage of given command\r\n`);
  });

program
  .command("init <template-name>")
  .description("初始化一个工程模板 -t：模板名称, -f：强制覆盖文件夹安装")
  .option(`-t, --${TEMPLATE} <${TEMPLATE}>`, "模板名称")
  .option("-f, --force", "强制覆盖文件夹安装")
  .action((name, options) => {
    require("../lib/init").init(name, options);
  });

program.parse(process.argv);
