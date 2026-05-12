<script lang="ts">
	import { goto } from '$app/navigation';

	let playerName = $state('');

	function search(e: Event) {
		e.preventDefault();
		const name = playerName.trim();
		if (name) goto('/' + name);
	}
</script>

<main class="max-w-xl mx-auto mt-24 px-4 text-center">
	<h1 class="text-4xl font-bold mb-2">MaxCape</h1>
	<p class="text-gray-500 mb-8">Account milestone tracker for OSRS</p>

	<form onsubmit={search} class="flex gap-2">
		<input
			bind:value={playerName}
			type="text"
			placeholder="Enter player name"
			class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
			type="submit"
			class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded"
		>
			Search
		</button>
	</form>
</main>
