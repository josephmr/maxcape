<script lang="ts">
	import type { PageData } from './$types';
	import EventGroupCard from '$lib/components/EventGroupCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="osrs-bg min-h-screen text-osrs-body font-game py-8 px-4 flex flex-col items-center">
	<div class="w-full max-w-[720px]">
		<a href="/" class="font-game text-[18px] text-osrs-gold-dim hover:text-osrs-gold mb-6 inline-block">
			&larr; Back
		</a>

		<header class="text-center mb-8 pb-5 border-b border-osrs-head-div relative">
			<h1 class="font-pixel text-[20px] text-osrs-gold [text-shadow:0_0_24px_#c8a04b55,0_2px_0_#000] tracking-[2px]">
				{data.playerName}
			</h1>
			<p class="font-game text-[20px] text-osrs-gold-dim mt-[6px] tracking-[4px]">Account History</p>
			<span class="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[120px] h-px bg-osrs-accent"></span>
		</header>

		<div class="flex mb-6 font-pixel text-[7px] border border-osrs-card-border">
			<a
				href="/players/{data.playerName}"
				class="px-4 py-2 text-osrs-gold-dim hover:text-osrs-gold"
			>
				Day
			</a>
			<a
				href="/players/{data.playerName}/month"
				class="px-4 py-2 border-l border-osrs-card-border bg-osrs-accent text-black"
			>
				Month
			</a>
		</div>

		{#if data.months.length === 0}
			<p class="font-game text-[20px] text-osrs-gold-dim text-center mt-12">
				No events recorded yet. Make sure the plugin is enabled and send events is toggled on.
			</p>
		{:else}
			{#each data.months as month (month.dateKey)}
				<EventGroupCard day={month} />
			{/each}
		{/if}
	</div>
</div>
