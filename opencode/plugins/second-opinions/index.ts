import { readFile } from "node:fs/promises"

export default {
  id: "second-opinions",
  async setup(ctx) {
    const policy = (await readFile(new URL("./policy.md", import.meta.url), "utf8")).trim()
    const agents = Array.isArray(ctx.options?.agents) ? ctx.options.agents : ["build"]

    await ctx.session.hook("context", (event) => {
      if (agents.includes(event.agent)) event.system.push({ type: "text", text: policy })
    })
  },
}
