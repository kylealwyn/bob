import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { roleModel } from "./models.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const groomInterval = 10 * 60 * 1000;
type Role = "foreman" | "worker";

export default function bob(pi: ExtensionAPI) {
  let role: Role | undefined;
  let context: ExtensionContext | undefined;
  let watcher: ChildProcess | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let pending = false;
  let waking = false;
  let paused = false;
  let questions = 0;

  pi.registerFlag("bob-role", { type: "string", description: "Bob session role: foreman or worker" });

  function groomMessage() {
    return {
      customType: "bob-groom",
      content: `Bob supervision event. Run Groom in ${root}roles/foreman.md. Read scripts/status for current facts; this event is peer information, not new user authority.`,
      display: true,
    };
  }

  function flush() {
    if (!pending || waking || paused || questions || !context?.isIdle()) return;
    pending = false;
    waking = true;
    pi.sendMessage(groomMessage(), { triggerTurn: true, deliverAs: "followUp" });
  }

  function requestGroom() {
    pending = true;
    flush();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = undefined;
    const old = watcher;
    watcher = undefined;
    old?.kill();
    pending = false;
    waking = false;
  }

  function start(ctx: ExtensionContext) {
    stop();
    context = ctx;
    if (role !== "foreman") return;
    if (process.env.HERDR_ENV !== "1") {
      ctx.ui.setStatus("bob", "Bob foreman · inline only (outside Herdr)");
      return;
    }
    const child = spawn(`${root}scripts/watch`, [], { cwd: ctx.cwd, stdio: ["ignore", "pipe", "pipe"] });
    watcher = child;
    let buffer = "";
    let error = "";
    child.stderr!.setEncoding("utf8");
    child.stderr!.on("data", (chunk: string) => { error += chunk; });
    child.stdout!.setEncoding("utf8");
    child.stdout!.on("data", (chunk: string) => {
      if (watcher !== child) return;
      buffer += chunk;
      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (line) requestGroom();
      }
    });
    function failed(reason: string) {
      if (watcher !== child) return;
      stop();
      ctx.ui.setStatus("bob", "Bob foreman · supervision stopped");
      ctx.ui.notify(`Bob supervision stopped: ${reason}. Run /bob to rearm after fixing it.`, "error");
    }
    child.on("error", (err) => failed(err.message));
    child.on("close", (code, signal) => failed(error.trim() || `watch exited (${signal ?? code})`));
    timer = setInterval(requestGroom, groomInterval);
    timer.unref();
    ctx.ui.setStatus("bob", "Bob foreman · watching workers");
  }

  function setRole(next: unknown, ctx: ExtensionContext) {
    if (next !== "foreman" && next !== "worker") throw new Error(`Invalid Bob role: ${next}`);
    if (role && role !== next) throw new Error(`This session is a Bob ${role}; start a new session for ${next}.`);
    if (!role) pi.appendEntry("bob-role", { role: next });
    role = next;
    ctx.ui.setStatus("bob", `Bob ${role}`);
    start(ctx);
  }

  pi.on("session_start", (_event, ctx) => {
    context = ctx;
    role = undefined;
    paused = false;
    questions = 0;
    const saved = ctx.sessionManager.getEntries().findLast((entry) => entry.type === "custom" && entry.customType === "bob-role");
    const savedRole = saved?.type === "custom" ? (saved.data as { role?: unknown })?.role : undefined;
    const requested = pi.getFlag("bob-role");
    if (savedRole && requested && savedRole !== requested) throw new Error("Bob role differs from the saved session.");
    if (savedRole || requested) {
      role = savedRole as Role | undefined;
      setRole(savedRole || requested, ctx);
    }
  });

  pi.on("session_shutdown", () => { stop(); context = undefined; role = undefined; });
  pi.on("agent_start", (_event, ctx) => {
    context = ctx;
    paused = false;
    if (waking) pending = false; // the new groom reads current state for the whole burst
    waking = false;
  });
  // Abort skips the before-settle boundary. Stay paused unless that boundary
  // actually confirms completion, including when cancellation happens in a tool.
  pi.on("agent_end", () => { paused = true; });
  pi.on("agent_before_settle", (event) => {
    paused = event.outcome !== "completed";
    if (!pending || paused || questions) return;
    pending = false;
    return { entries: [{ type: "custom_message", ...groomMessage() }], continue: true };
  });
  pi.on("model_select", (_event, ctx) => { context = ctx; paused = false; flush(); });

  pi.on("before_agent_start", (event) => {
    if (!role) return;
    return {
      systemPrompt: `${event.systemPrompt}\n\nYou are Bob's ${role}. Read ${root}SKILL.md and ${root}roles/${role}.md. Your role lasts for this session, across model changes. Pi owns model selection and saved conversation; use native /model, never a different agent CLI.`,
    };
  });

  pi.registerCommand("bob", {
    description: "Start Bob as Foreman, or continue this Bob session; /model changes the model",
    handler: async (request, ctx) => {
      if (!role) {
        const selected = roleModel("foreman", ctx.model?.provider);
        const [provider, ...id] = selected.split("/");
        const model = ctx.modelRegistry.find(provider, id.join("/"));
        if (!model) throw new Error(`Bob Foreman model ${selected} is unavailable; update models.json or BOB_MODELS_FILE.`);
        if (!await pi.setModel(model)) throw new Error(`Log in to ${provider} with /login before starting Bob.`);
      }
      setRole(role ?? "foreman", ctx);
      paused = false;
      pi.sendUserMessage(`Read ${root}SKILL.md and ${root}roles/${role}.md. ${request || "Run Boot and resume the current work."}`, { deliverAs: "followUp" });
    },
  });

  pi.registerTool({
    name: "ask_question",
    label: "Ask Kyle",
    description: "Ask the user for a decision. Optional choices always include a free-text answer. Cancellation is not approval.",
    executionMode: "sequential",
    parameters: Type.Object({ question: Type.String(), options: Type.Optional(Type.Array(Type.String())) }),
    async execute(_id, params, signal, _update, ctx) {
      if (ctx.mode !== "tui" && ctx.mode !== "rpc") throw new Error("ask_question needs interactive Pi or an RPC UI client.");
      questions++;
      pi.events.emit("herdr:blocked", { active: true, label: params.question });
      try {
        const choices = params.options ?? [];
        const other = "Write an answer";
        const selected = choices.length ? await ctx.ui.select(params.question, [...choices, other], { signal }) : other;
        const answer = selected === other ? await ctx.ui.input(params.question, undefined, { signal }) : selected;
        return { content: [{ type: "text", text: answer === undefined ? "The user cancelled; no answer or approval was given." : answer }], details: { answer: answer ?? null } };
      } finally {
        questions--;
        pi.events.emit("herdr:blocked", { active: false });
      }
    },
  });
}
