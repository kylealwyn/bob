import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { roleModel } from "../extensions/models.ts";

test("a provider switch selects its worker role, not the Foreman's model", () => {
  assert.equal(roleModel("foreman", "openai"), "openai/gpt-6-astra");
  assert.equal(roleModel("worker", "openai"), "openai/gpt-6.1-sol");
  assert.equal(roleModel("foreman", "anthropic"), "anthropic/claude-fable-5-1");
  assert.equal(roleModel("worker", "anthropic"), "anthropic/claude-opus-5-5");
  assert.equal(execFileSync("scripts/model", ["worker"], { env: { ...process.env, PI_PROVIDER: "anthropic", PI_MODEL: "claude-fable-5-1" }, encoding: "utf8" }).trim(), "anthropic/claude-opus-5-5");
});

test("model generations and default provider change through configuration", () => {
  const dir = mkdtempSync(join(tmpdir(), "bob-models-"));
  const file = join(dir, "models.json");
  const previous = process.env.BOB_MODELS_FILE;
  try {
    writeFileSync(file, JSON.stringify({ defaultProvider: "next", providers: { next: { foreman: "reasoner-v2", worker: "builder-v3" } } }));
    process.env.BOB_MODELS_FILE = file;
    assert.equal(roleModel("worker", "next"), "next/builder-v3");
    assert.throws(() => roleModel("worker", "unknown"), /no worker model/);
  } finally {
    if (previous === undefined) delete process.env.BOB_MODELS_FILE; else process.env.BOB_MODELS_FILE = previous;
    rmSync(dir, { recursive: true });
  }
});
