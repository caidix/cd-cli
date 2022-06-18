const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const log = require("./log");
/*
 * 文件是否存在
 */
async function existsFile(name, dir, isForce) {
  // 需要创建的目录地址
  console.log({ name });
  const targetAir = path.join(dir, name);
  console.log({ targetAir });
  async function removeTargetFile() {
    try {
      log("LOADING", "正在移除已有文件夹...");
      await fs.remove(targetAir);
      log("SUCCESS", "移除完毕，开始进行下一步...");
      return true;
    } catch (error) {
      return false;
    }
  }

  // 目录是否已经存在？
  if (!fs.existsSync(targetAir)) {
    return true;
  }
  if (!!isForce) {
    return await removeTargetFile();
  }
  let { action } = await inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: `当前文件夹已存在:${name}, 是否进行覆盖？`,
      choices: [
        {
          name: "覆盖",
          value: "overwrite",
        },
        {
          name: "取消",
          value: false,
        },
      ],
    },
  ]);
  if (!action) {
    return false;
  }
  return await removeTargetFile();
}

module.exports = {
  existsFile,
};
