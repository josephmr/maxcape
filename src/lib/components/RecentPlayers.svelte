<script lang="ts">
	import ItemIcon from './ItemIcon.svelte';

	let {
		players
	}: {
		players: Array<{ playerName: string; iconUrl: string; itemName: string | null }>;
	} = $props();
</script>

{#if players.length > 0}
	<div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
		{#each players as { playerName, iconUrl, itemName }}
			<a
				href="/players/{playerName}"
				class="flex items-center gap-1.5 font-game text-[17px] lg:text-[19px] text-osrs-gold-dim hover:text-osrs-gold transition-colors duration-[120ms]"
			>
				{#if itemName}
					<ItemIcon
						{itemName}
						src={iconUrl}
						alt=""
						width={16}
						height={16}
						class="pixelated w-4 h-4 object-contain shrink-0"
					/>
				{:else}
					<img
						src={iconUrl}
						alt=""
						width="16"
						height="16"
						class="pixelated w-4 h-4 object-contain shrink-0"
						onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
					/>
				{/if}
				{playerName}
			</a>
		{/each}
	</div>
{/if}
