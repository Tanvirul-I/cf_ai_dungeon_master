"use client";
import { useState, useEffect, useRef } from "react";
import { processTurn, startGame, resetGame } from "@/app/actions";

const ROOM_ID_KEY = "ai-dungeon-room-id";

export default function GameChat() {
	const [roomId, setRoomId] = useState<string | null>(null);
	const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [initializing, setInitializing] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Get or create a unique room ID for this user
	useEffect(() => {
		let id = localStorage.getItem(ROOM_ID_KEY);
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem(ROOM_ID_KEY, id);
		}
		setRoomId(id);
	}, []);

	// Auto-scroll only if the user is already near the bottom
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;
		const { scrollTop, scrollHeight, clientHeight } = container;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
		if (isNearBottom) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages, loading]);

	// On mount, initialize the game room and fetch the opening scene
	useEffect(() => {
		if (!roomId) return;
		let cancelled = false;
		(async () => {
			try {
				const history = await startGame(roomId);
				if (!cancelled) {
					setMessages(history);
				}
			} catch (err) {
				console.error("Failed to initialize game:", err);
			} finally {
				if (!cancelled) setInitializing(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [roomId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || loading || !roomId) return;

		const userMessage = input;
		setInput("");
		setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
		setLoading(true);

		try {
			const aiResponse = await processTurn(roomId, userMessage);
			setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async () => {
		if (!confirm("Start a new adventure? Your current progress will be lost.") || !roomId) return;
		setLoading(true);
		try {
			const history = await resetGame(roomId);
			setMessages(history);
		} catch (err) {
			console.error("Failed to reset game:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-[80vh] w-full max-w-2xl border border-white/10 rounded-lg bg-black/20 p-4">
			<div className="flex justify-end mb-2">
				<button
					onClick={handleReset}
					disabled={loading || initializing}
					className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1 rounded transition-colors disabled:opacity-50"
				>
					✨ New Adventure
				</button>
			</div>
			<div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto space-y-4 mb-4 pr-2">
				{initializing && (
					<div className="text-zinc-400 italic animate-pulse">
						The Dungeon Master is preparing your adventure...
					</div>
				)}
				{messages.map((m, i) => (
					<div
						key={i}
						className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[80%] p-3 rounded-lg ${
								m.role === "user"
									? "bg-blue-600 text-white"
									: "bg-zinc-800 text-zinc-100"
							}`}
						>
							<p className="text-sm font-bold opacity-50 uppercase mb-1">{m.role}</p>
							<p>{m.content}</p>
						</div>
					</div>
				))}
				{loading && (
					<div className="text-zinc-500 italic">The Dungeon Master is thinking...</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your action..."
					disabled={initializing}
				/>
				<button
					disabled={loading || initializing}
					className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold disabled:opacity-50"
				>
					Send
				</button>
			</form>
		</div>
	);
}

