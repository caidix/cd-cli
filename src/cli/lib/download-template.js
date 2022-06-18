const fs = require("fs");
const ora = require("ora");
const path = require("path");
const inquirer = require("inquirer");
const download = require("download-git-repo");
const spawn = require("cross-spawn");
const log = require("../utils/log");

/**
 * 下载文件到目录
 * @param url
 * @param name
 * @param target
 * @returns {Promise<void>}
 */
async function downloadFile(url, name, target = process.cwd()) {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.join(target, name);
      const downLoadCallback = (err) => {
        if (err) {
          resolve({ flag: false, dir, name });
          log("ERROR", err);
        }
        resolve({ flag: true, dir, name });
      };
      download(url, dir, { clone: true }, downLoadCallback);
    } catch (error) {}
  });
}

async function handleChangeSetting(dir, name, packageInfo) {
  return new Promise((resolve) => {
    fs.readFile(dir + "/package.json", "utf8", (err, data) => {
      if (err) {
        resolve(false);
      }
      const packageFile = { ...JSON.parse(data), ...packageInfo };
      fs.writeFile(
        dir + "/package.json",
        JSON.stringify(packageFile, null, 4),
        "utf8",
        (err) => {
          if (err) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  });
}

async function installTool(dir, name) {
  const opt = {
    安装依赖: "install",
    退出: "quit",
  };
  const installOpt = ["yarn", "npm", "pnpm"];
  const { answer } = await inquirer.prompt([
    {
      type: "rawlist",
      message: "接下来要执行的操作？",
      name: "answer",
      choices: Object.keys(opt),
    },
  ]);
  const option = opt[answer];
  if (option === "quit") {
    // const isFile = fs.existsSync(`${dir}/node_modules`);
    return log("SUCCESS", `🚀🚀🚀 初始化完成 🚀🚀🚀 `);
  }
  if (option === "install") {
    const { tool } = await inquirer.prompt([
      {
        type: "rawlist",
        message: "构建依赖工具:",
        name: "tool",
        choices: installOpt,
      },
    ]);
    const downloadSpinner = ora({
      text: "🚴🏻🚴🏻🚴🏻安装依赖中，请稍等....",
      color: "cyan",
    }).start();
    const child = spawn(tool, ["install"], { cwd: `${name}/` });
    // 监听执行结果
    child.on("close", function (code) {
      // 执行失败
      if (code !== 0) {
        process.exit(1);
        downloadSpinner.fail("安装失败！！！");
      }
      // 执行成功
      else {
        downloadSpinner.succeed("安装成功！！！");
      }
    });
  }
  return;
}

module.exports = async (url, projectName, packageInfo = {}) => {
  try {
    // 拉取模板
    const downloadSpinner = ora({
      text: "正在拉取项目模板...",
      color: "cyan",
    }).start();
    const { dir, name, flag } = await downloadFile(url, projectName);
    if (!flag) {
      downloadSpinner.fail("拉取项目模板失败");
      return false;
    }
    downloadSpinner.succeed("拉取项目模板成功");

    // 更新配置
    const editConfigSpinner = ora({
      text: "正在更新配置信息...",
      color: "cyan",
    }).start();
    const result = await handleChangeSetting(dir, name, packageInfo);
    if (!result) {
      editConfigSpinner.fail("配置更新失败");
      return false;
    }
    editConfigSpinner.succeed("配置更新完成");

    // 安装依赖
    installTool(dir, name);
    return true;
  } catch (error) {
    return false;
  }
};
