const fs = require("fs");
const path = require("path");
const postcss = require("postcss");

const SOURCE_FILE =
  process.env.WARP_CSS ||
  path.resolve(
    __dirname,
    "../reference-source/6f7724a58a14cab1.css",
  );
const OUTPUT_FILE = path.resolve(
  __dirname,
  "../styles/generated/warp-tokens.css",
);

function getSelectors(rule) {
  if (!rule.selector) {
    return [];
  }
  return rule.selector
    .split(",")
    .map((selector) => selector.trim())
    .filter(Boolean);
}

function shouldKeepRule(rule) {
  const selectors = getSelectors(rule);
  if (!selectors.length) {
    return false;
  }

  const matchesRoot = selectors.some((selector) =>
    selector.includes(":root"),
  );

  const matchesForceLight = selectors.some((selector) =>
    selector.includes(".force-light"),
  );

  const matchesDark = selectors.some(
    (selector) =>
      selector === ".dark" || selector.startsWith(".dark "),
  );

  return matchesRoot || matchesForceLight || matchesDark;
}

function buildTokensCss(root) {
  const output = postcss.root();
  root.walkRules((rule) => {
    if (shouldKeepRule(rule)) {
      output.append(rule.clone());
    }
  });
  return output.toResult({ map: false }).css;
}

function ensureOutputDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function run() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(
      `Warp CSS source not found at ${SOURCE_FILE}. Fetch it first with scripts/fetch-warp-assets.cjs`,
    );
  }

  const css = fs.readFileSync(SOURCE_FILE, "utf8");
  const parsed = postcss.parse(css);
  const tokensCss = buildTokensCss(parsed);
  ensureOutputDir(OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, tokensCss, "utf8");
  process.stdout.write(
    `Extracted token rules -> ${path.relative(
      process.cwd(),
      OUTPUT_FILE,
    )}\n`,
  );
}

run();
