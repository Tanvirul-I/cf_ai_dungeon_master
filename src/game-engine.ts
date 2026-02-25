import { DurableObject } from "cloudflare:workers";

const SYSTEM_PROMPT = `You are an AI Dungeon Master running a text-based fantasy RPG.

CRITICAL RULES FOR NARRATIVE CONTINUITY:
- You MUST remember and stay consistent with every detail you have described: locations, characters, objects, weather, time of day, and events.
- When the player takes an action, respond based on the CURRENT scene you described. Never introduce locations, doorways, characters, or objects that weren't already established or logically reachable.
- If the player does something unexpected (e.g. refuses to move, does something silly, ignores your hooks), react naturally within the current scene. Do NOT force them onto a different path or skip to a new scene.
- Track the player's inventory, health status, and any NPCs they've met. Reference these when relevant.
- Each response should describe: what happens as a result of the player's action, any changes to the environment, and what the player now sees/hears/feels.
- Keep responses concise (2-4 paragraphs) but immersive.
- Responses should not be repetitive, do not use the same adjectives and sentence structure constantly in a response.
- Every response must end with a subtle prompt for the player's next action, without listing explicit choices.
- NEVER contradict or forget something you previously described.`;

export class GameRoom extends DurableObject<CloudflareEnv> {
	constructor(state: DurableObjectState, env: CloudflareEnv) {
		super(state, env);
		this.ctx.storage.sql.exec(`
			CREATE TABLE IF NOT EXISTS history (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				role TEXT NOT NULL,
				content TEXT NOT NULL
			)
		`);
	}

	private getHistory(): { role: string; content: string }[] {
		const cursor = this.ctx.storage.sql.exec(
			`SELECT role, content FROM history ORDER BY id ASC`
		);
		return cursor.toArray().map((row) => ({
			role: row.role as string,
			content: row.content as string,
		}));
	}

	private async runAI(messages: { role: string; content: string }[]): Promise<string> {
		const aiResponse = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
			messages,
			max_tokens: 2048,
		});
		return (aiResponse as any).response;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// --- GET /history: return full conversation log ---
		if (url.pathname === "/history" && request.method === "GET") {
			return Response.json({ history: this.getHistory() });
		}

		// --- POST /init: generate opening scene if new game, return history ---
		if (url.pathname === "/init" && request.method === "POST") {
			let history = this.getHistory();

			if (history.length === 0) {
				// Generate the opening scene via AI
				const opening = await this.runAI([
					{ role: "system", content: SYSTEM_PROMPT },
					{
						role: "user",
						content:
							"Begin a new adventure. Describe the opening scene the player finds themselves in. Set the mood, describe the environment, and hint at possible directions or mysteries.",
					},
				]);

				// Store only the assistant's opening (the seed prompt is not part of the ongoing conversation)
				this.ctx.storage.sql.exec(
					`INSERT INTO history (role, content) VALUES (?, ?)`,
					"assistant",
					opening
				);

				history = this.getHistory();
			}

			return Response.json({ history });
		}

		// --- POST /turn: process a player action ---
		if (url.pathname === "/turn" && request.method === "POST") {
			const { action } = (await request.json()) as { action: string };
			const history = this.getHistory();

			const messages = [
				{ role: "system", content: SYSTEM_PROMPT },
				...history,
				{ role: "user", content: action },
			];

			const answer = await this.runAI(messages);

			// Persist both the player action and AI response
			this.ctx.storage.sql.exec(
				`INSERT INTO history (role, content) VALUES (?, ?), (?, ?)`,
				"user",
				action,
				"assistant",
				answer
			);

			return Response.json({ response: answer });
		}

		// --- POST /reset: clear history and start a fresh game ---
		if (url.pathname === "/reset" && request.method === "POST") {
			this.ctx.storage.sql.exec(`DELETE FROM history`);
			return Response.json({ success: true });
		}

		return new Response("Not Found", { status: 404 });
	}
}

