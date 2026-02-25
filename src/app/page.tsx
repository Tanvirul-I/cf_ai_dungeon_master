import GameChat from "./components/GameChat";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 text-white">
			<h1 className="text-3xl font-bold mb-8 text-white">
				AI Dungeon Master
			</h1>
			<GameChat />
		</main>
	);
}