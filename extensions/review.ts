import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export default function review(pi: ExtensionAPI) {
  const allowed = ["read", "grep", "find", "ls", "review_result"].sort();
  pi.on("session_start", () => {
    if (JSON.stringify(pi.getActiveTools().sort()) !== JSON.stringify(allowed)) {
      throw new Error("Review requires exactly read, grep, find, ls, and review_result; use scripts/review.");
    }
  });
  pi.registerTool({
    name: "review_result",
    label: "Review result",
    description: "Return your final independent review. Pass requires no P0/P1 findings. Use this tool as your final action.",
    parameters: Type.Object({
      verdict: Type.Union([Type.Literal("pass"), Type.Literal("changes_requested")]),
      findings: Type.Array(Type.Object({
        priority: Type.Union([Type.Literal("P0"), Type.Literal("P1"), Type.Literal("P2"), Type.Literal("P3")]),
        finding: Type.String(),
      })),
    }),
    async execute(_id, params, _signal, _update, ctx) {
      if (!ctx.model) throw new Error("Review has no selected model.");
      if (params.verdict === "pass" && params.findings.some((f) => f.priority === "P0" || f.priority === "P1")) {
        throw new Error("A review with P0/P1 findings cannot pass.");
      }
      return {
        content: [{ type: "text", text: `Verdict: ${params.verdict}` }],
        details: { ...params, model: `${ctx.model.provider}/${ctx.model.id}`, tools: pi.getActiveTools().sort() },
        terminate: true,
      };
    },
  });
}
