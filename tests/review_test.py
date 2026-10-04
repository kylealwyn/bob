import importlib.machinery
import importlib.util
from pathlib import Path
import unittest

path = Path(__file__).resolve().parents[1] / "scripts/review-result"
spec = importlib.util.spec_from_loader("review_result", importlib.machinery.SourceFileLoader("review_result", str(path)))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def event(verdict="pass", findings=None, **extra):
    return {"type": "tool_execution_end", "toolName": "review_result", "toolCallId": "verdict", "result": {"terminate": True,
        "details": {"model": "provider/model", "verdict": verdict, "findings": findings or [], "tools": sorted(["read", "grep", "find", "ls", "review_result"])}}, **extra}


def stream(report):
    return [report, {"type": "agent_end", "willRetry": False, "messages": [
        {"role": "assistant", "stopReason": "toolUse", "content": [{"type": "toolCall", "id": "verdict", "name": "review_result"}]},
        {"role": "toolResult", "toolCallId": "verdict", "isError": False}]}, {"type": "agent_settled"}]


class ReviewTest(unittest.TestCase):
    def test_structured_result_is_required(self):
        self.assertEqual(module.result(stream(event()))["verdict"], "pass")
        for events in ([], [{"type": "message_end", "message": {"content": "Verdict: pass"}}], [event(isError=True)], [event(), event()]):
            with self.assertRaises(ValueError):
                module.result(events)

    def test_high_priority_findings_cannot_pass(self):
        findings = [{"priority": "P1", "finding": "Breaks worker resume"}]
        with self.assertRaises(ValueError):
            module.result(stream(event(findings=findings)))
        self.assertEqual(module.result(stream(event("changes_requested", findings)))["verdict"], "changes_requested")

    def test_malformed_reports_never_pass(self):
        for update in ({"model": ""}, {"model": "model\npass"}, {"findings": None}, {"verdict": "approve"}, {"findings": [{}]}, {"tools": ["bash", "review_result"]}):
            e = event(); e["result"]["details"].update(update)
            with self.assertRaises(ValueError):
                module.result(stream(e))

    def test_verdict_followed_by_activity_or_provider_failure_never_passes(self):
        mixed = stream(event())
        mixed[1]["messages"][0]["content"].append({"type": "toolCall", "id": "other", "name": "read"})
        failed = stream(event())
        failed[1]["messages"].append({"role": "assistant", "stopReason": "error", "content": []})
        continued = stream(event())
        continued.insert(1, {"type": "tool_execution_start", "toolName": "read"})
        nonterminating = stream(event()); nonterminating[0]["result"]["terminate"] = False
        for events in (mixed, failed, continued, nonterminating, stream(event())[:-1]):
            with self.assertRaises(ValueError):
                module.result(events)
