const commandLineArgs = require("command-line-args");
const { exit } = require("process");
const builder = require("./builder");
// Reading command line arguments...
const optionDefinitions = [
  { name: "entryFile", type: String },
  { name: "output", alias: "o", type: String },
  { name: "mode", alias: "m", type: String },
];
const options = commandLineArgs(optionDefinitions);

if (options.hasOwnProperty("entryFile") && options.entryFile == null) {
  console.log(
    "Please provide the `path` of the entry file with the --input command."
  );
  exit();
}
if (options.hasOwnProperty("output") && options?.output == null) {
  console.log("Please provide a `path` with the --output command");
  exit();
}
if (options.hasOwnProperty("mode") && options?.mode == null) {
  console.log(
    "Please provide a `mode` with the --mode command! Valid modes include esm, iife and minified."
  );
  exit();
} else if (options.hasOwnProperty("mode") && options?.mode != null) {
  const mode = options.mode;
  if (mode != "esm" && mode != "minified" && mode != "iife") {
    console.log("Invalid mode! Valide modes include esm, iife and minified.");
    exit();
  }
}

// TODO: Remove existing /dist files first...
const defaultEntryFile = "./src/app.js";
const defaultOutputPath = "./dist/";
const entryFile = () => {
  return options?.entryFile ?? defaultEntryFile;
};
const output = (fileName) => {
  return options?.output
    ? options.output + fileName
    : defaultOutputPath + fileName;
};
// esm
const mode = options.mode;
if (mode == "esm") {
  builder({
    input: entryFile(),
    output: output("esm.js"),
  });
} else if (mode == "minified") {
  // minify
  builder({
    input: entryFile(),
    output: output("minified.js"),
    options: { minify: true },
  });
} else if (mode == "iife") {
  builder({
    input: entryFile(),
    output: output("iife.js"),
    options: { format: "iife" },
  });
} else {
  builder({
    input: entryFile(),
    output: output("esm.js"),
  });
  // minify
  builder({
    input: entryFile(),
    output: output("minified.js"),
    options: { minify: true },
  });
  builder({
    input: entryFile(),
    output: output("iife.js"),
    options: { format: "iife" },
  });
}
