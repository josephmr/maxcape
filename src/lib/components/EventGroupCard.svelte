<script lang="ts">
	import type { EventGroup } from '$lib/events';
	import SkillChip from './SkillChip.svelte';
	import BossChip from './BossChip.svelte';
	import ItemChip from './ItemChip.svelte';
	import DiaryChip from './DiaryChip.svelte';
	import QuestChip from './QuestChip.svelte';

	let { day }: { day: EventGroup } = $props();

	const totalLevels = $derived(day.skills.reduce((sum, e) => sum + e.levelsGained, 0));
</script>

<div class="mb-5 border border-osrs-card-border card-accent-border bg-osrs-card">
	<!-- Header -->
	<div class="flex items-center justify-between px-4 py-[10px] lg:px-5 lg:py-[13px] bg-osrs-card-head border-b border-osrs-card-border">
		<span class="font-pixel text-[8px] lg:text-[10px] text-osrs-gold">{day.dateLabel}</span>
		<div class="flex gap-3 flex-wrap justify-end">
			{#if day.skills.length > 0}
				<span class="osrs-summary-badge">
					<span class="text-osrs-gold">{totalLevels}</span>
					{totalLevels === 1 ? 'level' : 'levels'}
				</span>
			{/if}
			{#if day.bosses.length > 0}
				<span class="osrs-summary-badge">
					<span class="text-osrs-gold">{day.bosses.length}</span>
					{day.bosses.length === 1 ? 'boss' : 'bosses'}
				</span>
			{/if}
			{#if day.items.length > 0}
				<span class="osrs-summary-badge">
					<span class="text-osrs-gold">{day.items.length}</span>
					{day.items.length === 1 ? 'item' : 'items'}
				</span>
			{/if}
			{#if day.diaries.length > 0}
				<span class="osrs-summary-badge">
					<span class="text-osrs-gold">{day.diaries.length}</span>
					{day.diaries.length === 1 ? 'diary' : 'diaries'}
				</span>
			{/if}
			{#if day.quests.length > 0}
				<span class="osrs-summary-badge">
					<span class="text-osrs-gold">{day.quests.length}</span>
					{day.quests.length === 1 ? 'quest' : 'quests'}
				</span>
			{/if}
		</div>
	</div>

	<!-- Body -->
	<div class="px-4 py-3 flex flex-col gap-[14px]">
		{#if day.skills.length > 0}
			<div>
				<div class="font-pixel text-[6px] lg:text-[8px] text-osrs-gold-dim tracking-[2px] uppercase mb-2 pb-[5px] border-b border-osrs-section-div">
					Level Ups
				</div>
				<div class="flex flex-wrap gap-[6px]">
					{#each day.skills as entry (entry.skill)}
						<SkillChip skill={entry.skill} level={entry.level} levelsGained={entry.levelsGained} />
					{/each}
				</div>
			</div>
		{/if}

		{#if day.bosses.length > 0}
			<div>
				<div class="font-pixel text-[6px] lg:text-[8px] text-osrs-gold-dim tracking-[2px] uppercase mb-2 pb-[5px] border-b border-osrs-section-div">
					Boss Kills
				</div>
				<div class="flex flex-wrap gap-[6px]">
					{#each day.bosses as entry (entry.bossName)}
						<BossChip bossName={entry.bossName} killsToday={entry.killsToday} totalKc={entry.totalKc} />
					{/each}
				</div>
			</div>
		{/if}

		{#if day.items.length > 0}
			<div>
				<div class="font-pixel text-[6px] lg:text-[8px] text-osrs-gold-dim tracking-[2px] uppercase mb-2 pb-[5px] border-b border-osrs-section-div">
					Collection Log
				</div>
				<div class="flex flex-wrap gap-[6px]">
					{#each day.items as entry (entry.itemName)}
						<ItemChip itemName={entry.itemName} />
					{/each}
				</div>
			</div>
		{/if}

		{#if day.diaries.length > 0}
			<div>
				<div class="font-pixel text-[6px] lg:text-[8px] text-osrs-gold-dim tracking-[2px] uppercase mb-2 pb-[5px] border-b border-osrs-section-div">
					Achievement Diaries
				</div>
				<div class="flex flex-wrap gap-[6px]">
					{#each day.diaries as entry (`${entry.area}:${entry.difficulty}`)}
						<DiaryChip area={entry.area} difficulty={entry.difficulty} />
					{/each}
				</div>
			</div>
		{/if}

		{#if day.quests.length > 0}
			<div>
				<div class="font-pixel text-[6px] lg:text-[8px] text-osrs-gold-dim tracking-[2px] uppercase mb-2 pb-[5px] border-b border-osrs-section-div">
					Quests
				</div>
				<div class="flex flex-wrap gap-[6px]">
					{#each day.quests as entry (entry.questName)}
						<QuestChip questName={entry.questName} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
