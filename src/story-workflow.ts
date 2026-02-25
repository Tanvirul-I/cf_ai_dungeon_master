import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";

// Not implemented yet, will be used to orchestrate longer running and multi-step story logic
export class StoryWorkflow extends WorkflowEntrypoint<CloudflareEnv> {
  async run(event: WorkflowEvent<any>, step: WorkflowStep) {
    // This is the main logic for the narrative director
    await step.do("Log start", async () => {
      console.log("Narrative workflow started");
    });
  }
}