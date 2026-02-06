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

const secrets = {
  github: {
    id: config.requireSecret("github-id"),
    secret: config.requireSecret("github-secret"),
  },
  google: {
    id: config.requireSecret("google-id"),
    secret: config.requireSecret("google-secret"),
  },
};

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

const buildCommand = pulumi.interpolate`bun run build && bun w build`;
const builder = new command.local.Command(
  "website-build",
  {
    dir: absolutePath(".."),
    create: buildCommand,
    update: buildCommand,
    environment: {
      NODE_ENV: "production",
    },
    triggers: [gitCommitHash],
  },
  { dependsOn: [database] },
);

const worker = new cloudflare.Worker(
  `aboard-${environment}`,
  {
    accountId,
    name: `aboard-${environment}`,

    subdomain: {
      enabled: true,
    },

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
  { dependsOn: [database] },
);

const baseUrl = pulumi.interpolate`https://${worker.name}.ma-souza-junior.workers.dev`;

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

      {
        type: "kv_namespace",
        name: "SESSION",
        namespaceId: kvNamespaces.id,
      },

      // env vars
      {
        name: "BASE_URL",
        type: "plain_text",
        text: baseUrl,
      },
      {
        name: "GITHUB_ID",
        type: "secret_text",
        secretName: "github-id",
        text: secrets.github.id,
      },
      {
        name: "GITHUB_SECRET",
        type: "secret_text",
        secretName: "github-secret",
        text: secrets.github.secret,
      },
      {
        name: "GOOGLE_ID",
        type: "secret_text",
        secretName: "google-id",
        text: secrets.google.id,
      },
      {
        name: "GOOGLE_SECRET",
        type: "secret_text",
        secretName: "google-secret",
        text: secrets.google.secret,
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

export const domain = baseUrl;
export const workerScriptName = workerDeployment.scriptName;
