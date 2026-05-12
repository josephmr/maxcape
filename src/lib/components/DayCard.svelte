<script lang="ts">
	import type { DayGroup } from '$lib/events';
	import SkillChip from './SkillChip.svelte';
	import ItemChip from './ItemChip.svelte';

	let { day }: { day: DayGroup } = $props();
</script>

<div class="mb-5 border border-osrs-card-border card-accent-border bg-gradient-to-br from-osrs-card to-[#0d0b07] shadow-[0_2px_20px_rgba(0,0,0,0.6)]">
	<!-- Header -->
	<div class="flex items-center justify-between px-4 py-[10px] bg-gradient-to-r from-osrs-card-head to-osrs-card border-b border-osrs-card-border">
		<span class="font-pixel text-[8px] text-osrs-gold">{day.dateLabel}</span>
		<div class="flex gap-3">
			{#if day.skills.length > 0}
				<span class="font-game text-[17px] text-osrs-summary-text px-[9px] py-[1px] border border-osrs-summary-border select-none cursor-default">
					<span class="text-osrs-gold">{day.skills.length}</span>
					{day.skills.length === 1 ? 'level' : 'levels'}
				</span>
			{/if}
			{#if day.items.length > 0}
				<span class="font-game text-[17px] text-osrs-summary-text px-[9px] py-[1px] border border-osrs-summary-border select-none cursor-default">
					<span class="text-osrs-gold">{day.items.length}</span>
					{day.items.length === 1 ? 'item' : 'items'}
				</span>
			{/if}
		</div>
	</div>

	<!-- Body -->
	<div class="px-4 py-3 flex flex-col gap-[14px]">
		{#if day.skills.length > 0}
			<div>
				<div class="font-pixel text-[6px] text-osrs-gold-dim tracking-[2px] uppercase mb-2 pb-[5px] border-b border-osrs-section-div">
					Level Ups
				</div>
				<div class="flex flex-wrap gap-[6px]">
					{#each day.skills as entry (entry.skill)}
						<SkillChip skill={entry.skill} level={entry.level} />
					{/each}
				</div>
			</div>
		{/if}

		{#if day.items.length > 0}
			<div>
				<div class="font-pixel text-[6px] text-osrs-gold-dim tracking-[2px] uppercase mb-2 pb-[5px] border-b border-osrs-section-div">
					Collection Log
				</div>
				<div class="flex flex-wrap gap-[6px]">
					{#each day.items as entry (entry.itemName)}
						<ItemChip itemName={entry.itemName} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
