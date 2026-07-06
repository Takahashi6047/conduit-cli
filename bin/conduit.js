#!/usr/bin/env node
"use strict";

// Thin launcher: pick the prebuilt binary for this platform (shipped as an
// optionalDependency so npm only downloads the ONE that matches the user's
// OS/arch), then exec it with all args. This is the esbuild/biome pattern.

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// {platform}-{arch}  ->  [ platform package, binary file inside it ]
const TARGETS = {
  "win32-x64": ["conduit-agent-cli-win32-x64", "conduit.exe"],
  "darwin-x64": ["conduit-agent-cli-darwin-x64", "conduit"],
  "darwin-arm64": ["conduit-agent-cli-darwin-arm64", "conduit"],
  "linux-x64": ["conduit-agent-cli-linux-x64", "conduit"],
};

const key = `${process.platform}-${process.arch}`;
const target = TARGETS[key];
if (!target) {
  console.error(
    `conduit: no prebuilt binary for ${key}. ` +
      `Supported: ${Object.keys(TARGETS).join(", ")}.`
  );
  process.exit(1);
}
const [pkg, binName] = target;

let binPath;
try {
  // Resolve the platform package, then the binary sitting next to its manifest.
  binPath = path.join(path.dirname(require.resolve(`${pkg}/package.json`)), binName);
} catch (_e) {
  console.error(
    `conduit: the platform package "${pkg}" is not installed.\n` +
      `  • Reinstall:  npm install -g conduit-cli   (or run:  npx conduit-cli)\n` +
      `  • Note: installing with --no-optional / --omit=optional skips the binary.`
  );
  process.exit(1);
}

if (!fs.existsSync(binPath)) {
  console.error(`conduit: binary missing at ${binPath} — reinstall conduit-cli.`);
  process.exit(1);
}
if (process.platform !== "win32") {
  try {
    fs.chmodSync(binPath, 0o755); // ensure the exec bit survived packing
  } catch (_e) {
    /* best-effort */
  }
}

const res = spawnSync(binPath, process.argv.slice(2), { stdio: "inherit" });
if (res.error) {
  console.error(`conduit: failed to run ${binPath}\n${res.error.message}`);
  process.exit(1);
}
process.exit(res.status === null ? 1 : res.status);
