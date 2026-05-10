import { spawnSync } from "node:child_process";
import { execPath } from "node:process";
import fs from "node:fs/promises";

const pnpmExecPath = process.env.npm_execpath;
const useCurrentPnpm = pnpmExecPath?.toLowerCase().includes("pnpm");
const command = useCurrentPnpm ? execPath : "pnpm";
const baseArgs = useCurrentPnpm && pnpmExecPath ? [pnpmExecPath] : [];

function runPnpm(...args: string[]) {
	const result = spawnSync(command, [...baseArgs, ...args], {
		stdio: "inherit",
	});
	if (result.error) throw result.error;
	if (result.status) process.exit(result.status);
}

runPnpm("-F", "noname...", "build");
runPnpm("-F", "./packages/extension/**", "build");

console.log("合并打包结果");
await fs.rm("dist", { recursive: true, force: true });
await fs.mkdir("dist", { recursive: true });
await Promise.all([
	fs.cp("apps/core/dist", "dist", { recursive: true }),
	fs.cp("apps/core/audio", "dist/audio", { recursive: true }),
	fs.cp("apps/core/image", "dist/image", { recursive: true }),
	fs.cp("apps/core/extension", "dist/extension", { recursive: true }),
	fs.cp("docs", "dist/docs", { recursive: true }),
	fs.cp(".nomedia", "dist/.nomedia"),
	fs.cp("LICENSE", "dist/LICENSE"),
	fs.cp("README.md", "dist/README.md")
]);
