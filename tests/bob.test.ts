import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { mock, test, beforeEach, afterEach } from "node:test";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Agent } from "@earendil-works/pi-agent-core";
import { createAssistantMessageEventStream } from "@earendil-works/pi-ai";

class Watcher extends EventEmitter {
  stdout = new PassThrough();
  stderr = new PassThrough();
  killed = false;
  kill() { this.killed = true; return true; }
}
let watchers: Watcher[] = [];
mock.module("node:child_process", { namedExports: { spawn: () => {
  const watcher = new Watcher(); watchers.push(watcher); return watcher;
} } });
const { default: bob } = await import("../extensions/bob.ts");

function harness(savedRole?: string, flag?: string) {
  const handlers = new Map<string, Function>();
  const commands = new Map<string, { handler: Function }>();
  const tools = new Map<string, { execute: Function }>();
  const messages: unknown[] = [];
  const warnings: string[] = [];
  const entries: any[] = savedRole ? [{ type: "custom", customType: "bob-role", data: { role: savedRole } }] : [];
  const events = new EventEmitter();
  let idle = true;
  const ctx = {
    mode: "tui", cwd: "/example/repo", isIdle: () => idle,
    sessionManager: { getEntries: () => entries },
    ui: { setStatus() {}, notify: (text: string) => warnings.push(text), select: async () => undefined, input: async () => undefined },
  } as unknown as ExtensionContext;
  bob({
    on: (name: string, handler: Function) => handlers.set(name, handler),
    registerFlag() {}, getFlag: () => flag,
    appendEntry: (customType: string, data: unknown) => entries.push({ type: "custom", customType, data }),
    registerCommand: (name: string, command: { handler: Function }) => commands.set(name, command),
    registerTool: (tool: { name: string; execute: Function }) => tools.set(tool.name, tool),
    sendMessage: (message: unknown) => messages.push(message),
    sendUserMessage: (message: unknown) => messages.push(message), events,
  } as unknown as ExtensionAPI);
  return { handlers, commands, tools, messages, warnings, entries, events, ctx,
    emit: (name: string, event: unknown = {}) => handlers.get(name)?.(event, ctx),
    setIdle: (value: boolean) => { idle = value; },
  };
}

const previous = process.env.HERDR_ENV;
beforeEach(() => { watchers = []; process.env.HERDR_ENV = "1"; });
afterEach(() => { if (previous === undefined) delete process.env.HERDR_ENV; else process.env.HERDR_ENV = previous; mock.timers.reset(); });

test("a worker restores its role without launch flags and never supervises", () => {
  const h = harness("worker"); h.emit("session_start");
  assert.equal(watchers.length, 0);
  assert.match(h.emit("before_agent_start", { systemPrompt: "base" }).systemPrompt, /Bob's worker/);
  h.emit("model_select");
  assert.equal(h.entries.length, 1);
  assert.throws(() => harness("worker", "foreman").emit("session_start"), /differs/);
  h.emit("session_shutdown");
});

test("supervision is coalesced across working turns and paused after provider errors", () => {
  const h = harness("foreman"); h.emit("session_start");
  h.setIdle(false); h.emit("agent_start");
  watchers[0].stdout.write("done w2:p1 task\ndone w2:p1 task\n");
  assert.equal(h.messages.length, 0);
  const boundary = h.emit("agent_before_settle", { outcome: "completed" });
  assert.equal(boundary.continue, true);
  assert.equal(boundary.entries.length, 1);
  assert.equal(h.emit("agent_before_settle", { outcome: "completed" }), undefined);
  watchers[0].stdout.write("done w2:p1 task\n");
  h.emit("agent_before_settle", { outcome: "error" });
  h.setIdle(true);
  watchers[0].stdout.write("done w2:p1 task\n");
  assert.equal(h.messages.length, 0);
  h.emit("model_select");
  assert.equal(h.messages.length, 1);
  watchers[0].stdout.write("done w2:p1 task\n");
  assert.equal(h.messages.length, 1);
  h.emit("session_shutdown");
});

test("resume and shutdown close old supervision; a new session does not inherit its role", () => {
  const h = harness("foreman"); h.emit("session_start");
  const old = watchers[0];
  h.emit("session_start");
  assert.equal(old.killed, true);
  old.stdout.write("done w2:p1 stale\n");
  assert.equal(h.messages.length, 0);
  h.emit("session_shutdown");
  assert.equal(watchers[1].killed, true);
  h.entries.length = 0;
  h.emit("session_start");
  assert.equal(watchers.length, 2);
  assert.equal(h.emit("before_agent_start", { systemPrompt: "base" }), undefined);
});

test("watch failure stops supervision and explains how to rearm", () => {
  const h = harness("foreman"); h.emit("session_start");
  watchers[0].stderr.write("subscription rejected");
  watchers[0].emit("close", 1, null);
  assert.match(h.warnings[0], /subscription rejected.*\/bob/);
  assert.equal(watchers[0].killed, true);
  h.emit("session_shutdown");
});

test("question blocks Herdr, suppresses wakeup, and cancellation gives no approval", async () => {
  const h = harness("foreman"); h.emit("session_start");
  const blocks: boolean[] = [];
  h.events.on("herdr:blocked", (data) => blocks.push(data.active));
  let answer!: (value: undefined) => void;
  h.ctx.ui.select = () => new Promise((resolve) => { answer = resolve; });
  const question = h.tools.get("ask_question")!.execute("id", { question: "Proceed?", options: ["Yes", "No"] }, undefined, undefined, h.ctx);
  watchers[0].stdout.write("done w2:p1 task\n");
  assert.equal(h.messages.length, 0);
  answer(undefined);
  const result = await question;
  assert.equal(result.details.answer, null);
  assert.match(result.content[0].text, /no answer or approval/);
  assert.deepEqual(blocks, [true, false]);
  assert.equal(h.emit("agent_before_settle", { outcome: "completed" }).continue, true);
  h.emit("session_shutdown");
});

test("the periodic groom uses the same queue and its timer is removed", () => {
  mock.timers.enable({ apis: ["setInterval"] });
  const h = harness("foreman"); h.emit("session_start"); h.setIdle(false);
  mock.timers.tick(10 * 60 * 1000);
  assert.equal(h.emit("agent_before_settle", { outcome: "completed" }).continue, true);
  h.emit("session_shutdown");
  mock.timers.tick(10 * 60 * 1000);
  assert.equal(h.emit("agent_before_settle", { outcome: "completed" }), undefined);
});

test("an aborted run stays paused when Pi skips before-settle", () => {
  const h = harness("foreman"); h.emit("session_start");
  h.setIdle(false); h.emit("agent_start");
  watchers[0].stdout.write("done w2:p1 task\n");
  h.emit("agent_end"); h.setIdle(true); h.emit("agent_settled");
  watchers[0].stdout.write("done w2:p1 task\n");
  assert.equal(h.messages.length, 0);
  h.emit("model_select");
  assert.equal(h.messages.length, 1);
  h.emit("session_shutdown");
});

test("abort cancels either question dialog and releases Herdr", async () => {
  for (const options of [undefined, ["Yes", "No"]]) {
    const h = harness("worker"); h.emit("session_start");
    const blocks: boolean[] = [];
    h.events.on("herdr:blocked", (data) => blocks.push(data.active));
    const controller = new AbortController();
    let opened!: () => void;
    const ready = new Promise<void>((resolve) => { opened = resolve; });
    const dialog = (_title: string, _choices: unknown, opts: { signal?: AbortSignal }) => new Promise<undefined>((resolve) => {
      assert.equal(opts.signal, controller.signal);
      opts.signal!.addEventListener("abort", () => resolve(undefined), { once: true });
      opened();
    });
    h.ctx.ui.select = dialog as any; h.ctx.ui.input = dialog as any;
    const pending = h.tools.get("ask_question")!.execute("id", { question: "Proceed?", options }, controller.signal, undefined, h.ctx);
    await ready; controller.abort();
    assert.equal((await pending).details.answer, null);
    assert.deepEqual(blocks, [true, false]);
    h.emit("session_shutdown");
  }
});

test("Pi executes a two-question batch one dialog at a time", async () => {
  const h = harness("worker"); h.emit("session_start");
  let active = false;
  const asked: string[] = [];
  h.ctx.ui.select = async (question) => {
    assert.equal(active, false, "a second dialog replaced the first");
    active = true; asked.push(question);
    await new Promise((resolve) => setImmediate(resolve));
    active = false;
    return "Yes";
  };
  const tool = h.tools.get("ask_question")!;
  let requests = 0;
  const agent = new Agent({
    initialState: { tools: [{ ...tool, execute: (...args: any[]) => tool.execute(...args, h.ctx) } as any] },
    streamFn: () => {
      const stream = createAssistantMessageEventStream();
      const message: any = { role: "assistant", api: "openai-responses", provider: "openai", model: "fixture", timestamp: Date.now(),
        usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
        stopReason: requests++ ? "stop" : "toolUse", content: [] };
      if (message.stopReason === "toolUse") message.content = ["First?", "Second?"].map((question, i) => ({ type: "toolCall", id: String(i), name: "ask_question", arguments: { question, options: ["Yes", "No"] } }));
      stream.push({ type: "done", reason: message.stopReason, message });
      return stream;
    },
  });
  await agent.prompt("Ask both questions");
  assert.deepEqual(asked, ["First?", "Second?"]);
  assert.equal(agent.state.isStreaming, false);
  h.emit("session_shutdown");
});
