import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

type Role = "foreman" | "worker";

export function roleModel(role: Role, provider?: string): string {
  const file = process.env.BOB_MODELS_FILE || new URL("../models.json", import.meta.url);
  const config = JSON.parse(readFileSync(file, "utf8"));
  const selected = provider || process.env.PI_PROVIDER || config.defaultProvider;
  const id = config.providers?.[selected]?.[role];
  if (typeof selected !== "string" || !selected || typeof id !== "string" || !id) {
    throw new Error(`Bob has no ${role} model for provider ${selected}; edit ${file}.`);
  }
  return `${selected}/${id}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [role, provider] = process.argv.slice(2);
  if (role !== "foreman" && role !== "worker") throw new Error("usage: model foreman|worker [provider]");
  console.log(roleModel(role, provider));
}
