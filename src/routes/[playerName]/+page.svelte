<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
	}

	function eventLabel(event: { eventType: string; data: Record<string, unknown> }): string {
		if (event.eventType === 'SKILL_LEVEL_UP') {
			return `${event.data.skill} reached level ${event.data.level}`;
		}
		if (event.eventType === 'COLLECTION_LOG') {
			return `Collection log: ${event.data.itemName}`;
		}
		return event.eventType;
	}
</script>

<main class="max-w-2xl mx-auto mt-10 px-4">
	<a href="/" class="text-sm text-blue-600 hover:underline mb-4 inline-block">&larr; Back</a>
	<h1 class="text-2xl font-bold mb-6">{data.playerName}</h1>

	{#if data.events.length === 0}
		<p class="text-gray-500">No events recorded yet. Make sure the plugin is enabled and "Send events to server" is toggled on.</p>
	{:else}
		<ol class="relative border-l border-gray-200 space-y-6 ml-2">
			{#each data.events as event (event.id)}
				<li class="ml-6">
					<span class="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 ring-2 ring-white"></span>
					<time class="block text-xs text-gray-400 mb-1">{formatDate(event.timestamp)}</time>
					<p class="font-medium text-gray-900">{eventLabel(event)}</p>
				</li>
			{/each}
		</ol>
	{/if}
</main>
