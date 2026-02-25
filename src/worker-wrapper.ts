import { GameRoom } from "./game-engine";
import { StoryWorkflow } from "./story-workflow";
// @ts-ignore
import { default as handler } from "../.open-next/worker.js";

export { GameRoom, StoryWorkflow };

export default {
  async fetch(request, env, ctx) {
    return handler.fetch(request, env, ctx);
  }
} satisfies ExportedHandler<CloudflareEnv>;