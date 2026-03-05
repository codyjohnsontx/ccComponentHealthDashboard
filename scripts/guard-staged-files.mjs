import { spawnSync } from "node:child_process";

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

function getStagedFiles() {
  return runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
    .split("\0")
    .filter(Boolean);
}

function getStagedBlobSize(filePath) {
  const size = runGit(["cat-file", "-s", `:${filePath}`]).trim();
  return Number(size);
}

try {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  const blockedFiles = stagedFiles.filter(isBlockedPath);
  const oversizedFiles = stagedFiles
    .map((filePath) => ({
      filePath,
      size: getStagedBlobSize(filePath)
    }))
    .filter((entry) => entry.size > MAX_FILE_BYTES);

  if (blockedFiles.length === 0 && oversizedFiles.length === 0) {
    process.exit(0);
  }

  console.error("Atomic commit guard failed.");

  if (blockedFiles.length > 0) {
    console.error("\nBlocked generated paths are staged:");
    blockedFiles.forEach((filePath) => {
      console.error(`- ${filePath}`);
    });
  }

  if (oversizedFiles.length > 0) {
    console.error(`\nStaged files exceed ${formatBytes(MAX_FILE_BYTES)}:`);
    oversizedFiles.forEach(({ filePath, size }) => {
      console.error(`- ${filePath} (${formatBytes(size)})`);
    });
  }

  console.error(
    "\nRemove generated files from the commit and split large assets into a separate process."
  );
  process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
