"use server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getRoomStub(env: CloudflareEnv, roomId: string) {
	const id = env.GAME_ROOM.idFromName(roomId);
	return env.GAME_ROOM.get(id);
}

export async function startGame(roomId: string) {
	const { env } = await getCloudflareContext({ async: true });
	const roomStub = getRoomStub(env, roomId);

	const response = await roomStub.fetch("http://do/init", {
		method: "POST",
	});

	if (!response.ok) throw new Error("Failed to initialize game room");

	const data = (await response.json()) as {
		history: { role: string; content: string }[];
	};
	return data.history;
}

export async function processTurn(roomId: string, playerInput: string) {
	const { env } = await getCloudflareContext({ async: true });
	const roomStub = getRoomStub(env, roomId);

	const response = await roomStub.fetch("http://do/turn", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ action: playerInput }),
	});

	if (!response.ok) throw new Error("Failed to communicate with DM");

	const data = (await response.json()) as { response: string };
	return data.response;
}

export async function resetGame(roomId: string) {
	const { env } = await getCloudflareContext({ async: true });
	const roomStub = getRoomStub(env, roomId);

	const resetResponse = await roomStub.fetch("http://do/reset", {
		method: "POST",
	});
	if (!resetResponse.ok) throw new Error("Failed to reset game room");

	// Re-initialize to get a fresh opening scene
	const initResponse = await roomStub.fetch("http://do/init", {
		method: "POST",
	});
	if (!initResponse.ok) throw new Error("Failed to initialize new game");

	const data = (await initResponse.json()) as {
		history: { role: string; content: string }[];
	};
	return data.history;
}

