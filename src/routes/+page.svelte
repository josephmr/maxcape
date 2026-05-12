<script lang="ts">
	import { goto } from '$app/navigation';

	let playerName = $state('');

	function search(e: Event) {
		e.preventDefault();
		const name = playerName.trim();
		if (name) goto('/players/' + name);
	}
</script>

<div class="osrs-bg min-h-screen flex flex-col items-center justify-center px-4 font-game text-osrs-body">
	<div class="w-full max-w-sm text-center">
		<h1 class="font-pixel text-[22px] text-osrs-gold [text-shadow:0_0_24px_#c8a04b55,0_2px_0_#000] tracking-[2px] mb-2">
			MaxCape
		</h1>
		<p class="font-game text-[22px] text-osrs-gold-dim tracking-[3px] mb-8">OSRS milestone tracker</p>

		<form onsubmit={search} class="flex">
			<input
				bind:value={playerName}
				type="text"
				placeholder="Enter player name"
				class="flex-1 bg-osrs-chip-bg border border-osrs-chip-border text-osrs-body font-game text-[20px] px-3 py-2 focus:outline-none focus:border-osrs-accent placeholder:text-osrs-gold-dim"
			/>
			<button
				type="submit"
				class="bg-osrs-card-head border border-osrs-accent text-osrs-gold font-pixel text-[8px] px-4 py-2 hover:bg-osrs-accent hover:text-osrs-bg transition-colors duration-[120ms]"
			>
				Search
			</button>
		</form>
	</div>
</div>
