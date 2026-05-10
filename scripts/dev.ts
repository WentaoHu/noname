import { spawn } from "node:child_process";
import { execPath } from "node:process";

const pnpmExecPath = process.env.npm_execpath;
const useCurrentPnpm = pnpmExecPath?.toLowerCase().includes("pnpm");
const command = useCurrentPnpm ? execPath : "pnpm";
const baseArgs = useCurrentPnpm && pnpmExecPath ? [pnpmExecPath] : [];
const options = { stdio: "inherit" } as const;

spawn(command, [...baseArgs, "-F", "@noname/fs", "dev", "--debug", "--dirname=../../apps/core"], options);
spawn(command, [...baseArgs, "-F", "./packages/extension/**", "build:watch"], options);
spawn(command, [...baseArgs, "-F", "noname", "dev", "--open"], options);
