const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const terser = require("terser");

module.exports = async function builder({ input, output, options }) {
  console.log(chalk.blueBright("Bundling your code..."));
  const moduleGraph = createModuleGraph(input);
  const bundledCode = bundle(moduleGraph);

  const { minify = false, format = "esm" } = options || {};
  let code;
  if (minify) {
    let minifiedCode = await terser.minify(bundledCode);
    code = minifiedCode.code;
  } else {
    code = bundledCode;
  }

  //format
  if (format === "iife") {
    code = `(()=>{${code}})()`;
  }

  writeFileSyncRecursive(output, code, "utf-8");
  console.log(chalk.green.bold(`Created ${output}`));
};

function writeFileSyncRecursive(filename, content, charset) {
  const folders = filename.split(path.sep).slice(0, -1);
  if (folders.length) {
    // create folder path if it doesn't exist
    folders.reduce((last, folder) => {
      const folderPath = last ? last + path.sep + folder : folder;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      return folderPath;
    });
  }
  fs.writeFileSync(filename, content, charset);
}

// module graph
function createModuleGraph(input) {
  return new ModuleGraph(input);
}

function resolveRequest(requester, requestedPath) {
  return path.join(path.dirname(requester), requestedPath);
}

class ModuleGraph {
  constructor(input) {
    this.path = input;
    this.content = fs.readFileSync(input, "utf-8");
    this.ast = babel.parseSync(this.content);
    this.dependencies = this.getDependencies();
  }

  getDependencies() {
    return this.ast.program.body
      .filter((node) => node.type === "ImportDeclaration")
      .map((node) => node.source.value)
      .map((currentPath) => resolveRequest(this.path, currentPath))
      .map((absolutePath) => createModuleGraph(absolutePath));
  }
}

// bundling

function bundle(graph) {
  let modules = collectModules(graph);
  let code = "";
  for (var i = modules.length - 1; i >= 0; i--) {
    let module = modules[i];
    const t = babel.transformFromAstSync(module.ast, module.content, {
      ast: true,
      plugins: [
        function () {
          return {
            visitor: {
              ImportDeclaration(path) {
                path.remove();
              },
              ExportDefaultDeclaration(path) {
                path.remove();
              },
            },
          };
        },
      ],
    });
    code += `${t.code}\n`;
  }
  return code;
}

function collectModules(graph) {
  const modules = [];
  collect(graph, modules);
  return modules;

  function collect(module, modules) {
    modules.push(module);
    module.dependencies.forEach((dependency) => collect(dependency, modules));
  }
}
