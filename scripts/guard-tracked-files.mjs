import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";

const MAX_FILE_BYTES = 1024 * 1024;
const BLOCKED_PATHS = [
  /^\.next($|\/)/,
  /^\.next_build_verify($|\/)/,
  /^\.next_stale_runtime_fix($|\/)/,
  /^\.next_stale_runtime_fix_2($|\/)/,
  /^coverage($|\/)/,
  /^dist($|\/)/
];

function runGit(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });

  if (result.status !== 0) {
    const message = result.stderr?.trim() || `git ${args.join(" ")} failed`;
    throw new Error(message);
  }

  return result.stdout ?? "";
}

function formatBytes(value) {
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

function isBlockedPath(filePath) {
  return BLOCKED_PATHS.some((pattern) => pattern.test(filePath));
}

function getTrackedFiles() {
  return runGit(["ls-files", "-z"])
    .split("\0")
    .filter(Boolean);
}

try {
  const trackedFiles = getTrackedFiles();
  const blockedFiles = trackedFiles.filter(isBlockedPath);
  const oversizedFiles = trackedFiles
    .map((filePath) => {
      const stats = statSync(filePath);
      return {
        filePath,
        size: stats.size
      };
    })
    .filter((entry) => entry.size > MAX_FILE_BYTES);

  if (blockedFiles.length === 0 && oversizedFiles.length === 0) {
    process.exit(0);
  }

  console.error("Tracked file guard failed.");

  if (blockedFiles.length > 0) {
    console.error("\nBlocked generated paths are tracked:");
    blockedFiles.forEach((filePath) => {
      console.error(`- ${filePath}`);
    });
  }

  if (oversizedFiles.length > 0) {
    console.error(`\nTracked files exceed ${formatBytes(MAX_FILE_BYTES)}:`);
    oversizedFiles.forEach(({ filePath, size }) => {
      console.error(`- ${filePath} (${formatBytes(size)})`);
    });
  }

  console.error(
    "\nUntrack generated artifacts and move oversized assets to approved storage."
  );
  process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
