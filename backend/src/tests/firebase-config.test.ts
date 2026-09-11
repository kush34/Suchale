// Regression tests for issue #13: Firebase credentials must load from env
// (never require secret.json inside images) and secret material must stay
// out of the Docker build context.
import { generateKeyPairSync } from "crypto";
import fs from "fs";
import path from "path";

const backendRoot = path.resolve(__dirname, "../..");

test("initializes from FIREBASE_* env vars without secret.json", () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }) as string;

  process.env.FIREBASE_PROJECT_ID = "test-project";
  process.env.FIREBASE_CLIENT_EMAIL = "test@test-project.iam.gserviceaccount.com";
  // escaped-newline form, as stored in real env files
  process.env.FIREBASE_PRIVATE_KEY = pem.replace(/\n/g, "\\n");
  process.env.databaseURL = "https://test-project.firebaseio.com";

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const admin = require("firebase-admin");
  require("../config/firebase");

  expect(admin.apps.length).toBe(1);
  expect(admin.app().options.databaseURL).toBe("https://test-project.firebaseio.com");
});

test("dockerignore keeps secret material and build output out of images", () => {
  const ignore = fs.readFileSync(path.join(backendRoot, ".dockerignore"), "utf8");
  for (const entry of ["secret.json", "dist", ".git", ".env"]) {
    expect(ignore.split(/\r?\n/).map((l) => l.trim())).toContain(entry);
  }
});

test("firebase config has no static import of secret.json", () => {
  const src = fs.readFileSync(path.join(backendRoot, "src/config/firebase.ts"), "utf8");
  expect(src).not.toMatch(/from\s+['"]\.\.\/\.\.\/secret\.json['"]/);
  expect(src).toMatch(/FIREBASE_PRIVATE_KEY/);
});
