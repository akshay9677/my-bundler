# My Custom Bundler

This project is a simple javascript module bundler, it bundles multiple js codes into a single bundle, which can be run in any browser. This bundler goes thorugh your entry file and creates a dependency graph by resolving imports and bundles them into a single javascript bundle. You can minify your bundle and can generate iife and esm formates.

## Configuration

- **Input:** Entry point of your file
- **Output:** Target file, where your bundle will be generated
- **Options:**

| Option   | Type                 | Description                     |
| -------- | -------------------- | ------------------------------- |
| compress | <code>Boolean</code> | Minify your code                |
| format   | <code>String</code>  | Supports 'iife' & 'esm' formats |
