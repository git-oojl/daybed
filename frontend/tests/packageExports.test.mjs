import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "src");

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const details = await stat(fullPath);
    if (details.isDirectory()) files.push(...await collectFiles(fullPath));
    else if (/\.(?:js|jsx|ts|tsx)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

function importedNames(source, moduleName) {
  const escaped = moduleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `import\\s*\\{([^}]*)\\}\\s*from\\s*["']${escaped}["']`,
    "gs",
  );
  const names = new Set();
  for (const match of source.matchAll(pattern)) {
    for (const item of match[1].split(",")) {
      const imported = item.trim().split(/\s+as\s+/)[0]?.trim();
      if (imported) names.add(imported);
    }
  }
  return names;
}

test("react-icons named imports exist in the installed package", async (t) => {
  let fa;
  let fa6;
  try {
    [fa, fa6] = await Promise.all([
      import("react-icons/fa"),
      import("react-icons/fa6"),
    ]);
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      t.skip("Dependencies are not installed in this environment.");
      return;
    }
    throw error;
  }

  const files = await collectFiles(sourceRoot);
  const modules = new Map([
    ["react-icons/fa", fa],
    ["react-icons/fa6", fa6],
  ]);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const [moduleName, exports] of modules) {
      for (const imported of importedNames(source, moduleName)) {
        assert.ok(
          imported in exports,
          `${path.relative(projectRoot, file)} imports ${imported}, but ${moduleName} does not export it`,
        );
      }
    }
  }
});
