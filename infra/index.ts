import * as cloudflare from "@pulumi/cloudflare";
import * as command from "@pulumi/command";
import * as pulumi from "@pulumi/pulumi";
import * as child_process from "node:child_process";

// Infra
// - D1 Database
// - KV Namespaces
// - Worker, version, deployment

const config = new pulumi.Config();
const environment = config.require("environment");
const accountId = config.require("accountId");

const today = () => new Date().toISOString().split("T")[0];

const absolutePath = (relativePath: string) =>
  new URL(relativePath, import.meta.url).pathname;

const gitCommitHash = child_process
  .execSync("git rev-parse HEAD", { encoding: "utf-8" })
  .trim();

// D1 Database - data storage
const database = new cloudflare.D1Database(`aboard-db-${environment}`, {
  accountId,
  name: `aboard-db-${environment}`,
});

// KV Namespaces - session storage
const kvNamespaces = new cloudflare.WorkersKvNamespace(
  `aboard-kv-ns-${environment}`,
  {
    accountId,
    title: `aboard-kv-${environment}`,
  },
);

// TODO: build before deploying
const buildCommand = pulumi.interpolate`bun run build && bun w build`;

const builder = new command.local.Command(
  "website-build",
  {
    dir: absolutePath(".."),
    create: buildCommand,
    update: buildCommand,
    environment: {
      // pulumi config set --secret github-id $GITHUB_ID
      GITHUB_ID: pulumi.secret("github-id"),
      // pulumi config set --secret github-secret $GITHUB_SECRET
      GITHUB_SECRET: pulumi.secret("github-secret"),

      // pulumi config set --secret google-id $GOOGLE_ID
      GOOGLE_ID: pulumi.secret("google-id"),
      // pulumi config set --secret google-secret $GOOGLE_SECRET
      GOOGLE_SECRET: pulumi.secret("google-secret"),
    },
    triggers: [gitCommitHash],
  },
  { dependsOn: [database, kvNamespaces] },
);

const worker = new cloudflare.Worker(
  `aboard-${environment}`,
  {
    accountId,
    name: `aboard-worker-${environment}`,

    tags: ["aboard", environment],

    observability: {
      enabled: true,
      headSamplingRate: 1.0,

      logs: {
        enabled: true,
        headSamplingRate: 1.0,
      },
    },
  },
  {
    dependsOn: [database, kvNamespaces],
    replacementTrigger: [gitCommitHash],
  },
);

const workerVersion = new cloudflare.WorkerVersion(
  `aboard-worker-version-${environment}`,
  {
    accountId,
    workerId: worker.id,
    mainModule: "index.js",
    compatibilityDate: today(), // "2026-02-03",
    compatibilityFlags: ["global_fetch_strictly_public", "nodejs_compat"],

    assets: {
      directory: absolutePath("../dist/"),
      config: {
        runWorkerFirst: false,
      },
    },

    bindings: [
      {
        type: "assets",
        name: "ASSETS",
      },
    ],

    modules: [
      {
        name: "index.js",
        contentFile: absolutePath("../dist/index.js"),
        contentType: "application/javascript+module",
      },
    ],
  },
  {
    dependsOn: [worker, builder],
  },
);

const workerDeployment = new cloudflare.WorkersDeployment(
  `aboard-worker-deployment-${environment}`,
  {
    accountId,
    versions: [
      {
        versionId: workerVersion.id,
        percentage: 100,
      },
    ],
    scriptName: worker.name,
    strategy: "percentage",
  },
  {
    dependsOn: [workerVersion],
  },
);

export const workerName = worker.name;
export const workerScriptName = workerDeployment.scriptName;
export const accessibleAt = pulumi.interpolate`https://${worker.name}.workers.dev`;
