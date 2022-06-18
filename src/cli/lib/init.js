const inquirer = require("inquirer");
const downloadTemplate = require("./download-template");
const templateList = require("../config/template.json").templateList;
const { TEMPLATE } = require("../utils/constant");
const log = require("../utils/log");
const { existsFile } = require("../utils");

async function init(name, options = {}, path = process.cwd()) {
  let templateName = options[TEMPLATE];
  let projectName = name;
  if (!projectName) {
    projectName = await setProjectName();
  }
  if (!options.hasOwnProperty(TEMPLATE)) {
    templateName = await chooseTemplate();
  }
  const templateInfo = templateList.find((item) => item.name === templateName);
  if (!templateInfo) {
    return log("WARING", "您选择的模板不存在");
  }
  const { git } = templateInfo;
  const packageInfo = await setPackageInfo(projectName);

  // 安装模板流程
  const res = await existsFile(projectName, path, options.force);
  if (!res) return;
  downloadTemplate(git, projectName, packageInfo);
}

async function setProjectName() {
  try {
    const { name } = await inquirer.prompt([
      {
        type: "input",
        message: "请输入项目名称：",
        name: "name",
        default: "template", // 默认值
      },
    ]);
    return name;
  } catch (error) {
    return "template";
  }
}

async function chooseTemplate() {
  try {
    return new Promise((resolve) => {
      inquirer
        .prompt([
          {
            type: "list",
            message: "请选择需要创建的模板:",
            name: TEMPLATE,
            choices: templateList,
          },
        ])
        .then((answers) => {
          resolve(answers[TEMPLATE]);
        });
    });
  } catch (e) {
    log("ERROR", e);
  }
}

function setPackageInfo(name) {
  return new Promise(async (resolve) => {
    try {
      const packageInfo = await Promise.all([
        inquirer.prompt([
          {
            type: "input",
            message: "请输入作者(author)?",
            name: "author",
            default: "",
          },
          {
            type: "input",
            message: "请输入版本号(version)?",
            name: "version",
            default: "1.0.0",
          },
          {
            type: "input",
            message: "请输入项目概述(description)",
            name: "description",
            default: "",
          },
        ]),
      ]);
      resolve({ ...packageInfo[0], name });
    } catch (error) {
      resolve({
        name,
        version: "1.0.0",
        author: "",
        description: "",
      });
    }
  });
}

module.exports = {
  init: (...args) => {
    return init(...args).catch((err) => {});
  },
};
