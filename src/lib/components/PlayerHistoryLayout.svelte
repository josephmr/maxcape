<script lang="ts">
	import type { EventGroup } from '$lib/events';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import EventGroupCard from './EventGroupCard.svelte';

	let { playerName, activeTab, groups }: {
		playerName: string;
		activeTab: 'day' | 'month';
		groups: EventGroup[];
	} = $props();

	let currentTz = $derived(page.url.searchParams.get('tz') ?? '');
	let isLocal = $derived(!!currentTz);
	let tzQuery = $derived(isLocal ? '?tz=' + encodeURIComponent(currentTz) : '');

	function switchToLocal() {
		goto(page.url.pathname + '?tz=' + encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone));
	}
</script>

<div class="osrs-bg min-h-dvh text-osrs-body font-game py-8 px-4 flex flex-col items-center">
	<div class="w-full max-w-[720px] lg:max-w-[900px]">
		<a href="/" class="font-game text-[18px] lg:text-[22px] text-osrs-gold-dim hover:text-osrs-gold mb-6 inline-block">
			&larr; Back
		</a>

		<header class="text-center mb-8 pb-5 border-b border-osrs-head-div relative">
			<h1 class="font-pixel text-[20px] lg:text-[25px] text-osrs-gold [text-shadow:0_0_24px_#c8a04b55,0_2px_0_var(--color-osrs-shadow)] tracking-[2px]">
				{playerName}
			</h1>
			<span class="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[120px] h-px bg-osrs-accent"></span>
		</header>

		<div class="flex justify-between items-center mb-6">
			<div class="flex font-pixel text-[7px] lg:text-[9px] border border-osrs-card-border w-fit">
				<a
					href="/players/{playerName}{tzQuery}"
					class="px-4 py-2 lg:px-5 lg:py-3 {activeTab === 'day' ? 'bg-osrs-accent text-black' : 'text-osrs-gold-dim hover:text-osrs-gold'}"
				>
					Day
				</a>
				<a
					href="/players/{playerName}/month{tzQuery}"
					class="px-4 py-2 lg:px-5 lg:py-3 border-l border-osrs-card-border {activeTab === 'month' ? 'bg-osrs-accent text-black' : 'text-osrs-gold-dim hover:text-osrs-gold'}"
				>
					Month
				</a>
			</div>

			<div class="flex font-pixel text-[7px] lg:text-[9px] border border-osrs-card-border w-fit">
				<a
					href={page.url.pathname}
					class="px-4 py-2 lg:px-5 lg:py-3 {!isLocal ? 'bg-osrs-accent text-black' : 'text-osrs-gold-dim hover:text-osrs-gold'}"
				>
					UTC
				</a>
				<button
					onclick={switchToLocal}
					class="px-4 py-2 lg:px-5 lg:py-3 border-l border-osrs-card-border cursor-pointer {isLocal ? 'bg-osrs-accent text-black' : 'text-osrs-gold-dim hover:text-osrs-gold'}"
				>
					Local
				</button>
			</div>
		</div>

		{#if groups.length === 0}
			<p class="font-game text-[20px] lg:text-[25px] text-osrs-gold-dim text-center mt-12">
				No events recorded yet. Make sure the plugin is enabled and send events is toggled on.
			</p>
		{:else}
			{#each groups as group (group.dateKey)}
				<EventGroupCard day={group} />
			{/each}
		{/if}
	</div>
</div>
