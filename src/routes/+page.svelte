<script lang="ts">
	import { goto } from '$app/navigation';
	import RecentPlayers from '$lib/components/RecentPlayers.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let playerName = $state('');

	function search(e: Event) {
		e.preventDefault();
		const name = playerName.trim();
		if (name) goto('/players/' + name);
	}
</script>

<svelte:head>
	<title>MaxCape | OSRS Milestone Tracker</title>
	<meta
		name="description"
		content="Track your Old School RuneScape skill gains, boss kills, and collection log milestones with MaxCape."
	/>
</svelte:head>

<main
	class="osrs-bg flex-1 flex flex-col items-center justify-center px-4 font-game text-osrs-body"
>
	<div class="w-full max-w-sm lg:max-w-lg text-center">
		<h1
			class="font-pixel text-[22px] lg:text-[28px] text-osrs-gold [text-shadow:0_0_24px_#c8a04b55,0_2px_0_#000] tracking-[2px] mb-2"
		>
			MaxCape
		</h1>
		<p class="font-game text-[22px] lg:text-[28px] text-osrs-gold-dim tracking-[3px] mb-8">
			OSRS milestone tracker
		</p>

		<form onsubmit={search} class="flex">
			<input
				bind:value={playerName}
				type="text"
				placeholder="Enter player name"
				class="flex-1 bg-osrs-chip-bg border border-osrs-chip-border text-osrs-body font-game text-[20px] lg:text-[25px] px-3 py-2 lg:px-4 lg:py-3 focus:outline-none focus:border-osrs-accent placeholder:text-osrs-gold-dim"
			/>
			<button
				type="submit"
				class="bg-osrs-card-head border border-osrs-accent text-osrs-gold font-pixel text-[8px] lg:text-[10px] px-4 py-2 lg:px-5 lg:py-3 hover:bg-osrs-accent hover:text-osrs-bg transition-colors duration-[120ms]"
			>
				Search
			</button>
		</form>
	</div>

	<div class="w-full max-w-xl mt-6 px-4">
		<RecentPlayers players={data.recentPlayers} />
	</div>
</main>
