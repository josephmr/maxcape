<script lang="ts">
	import { skillIconUrl } from '$lib/osrs';

	let { skill, level, levelsGained }: { skill: string; level: number; levelsGained: number } = $props();
</script>

<div class="flex items-stretch border border-osrs-chip-border overflow-hidden cursor-default">
	<div class="bg-osrs-chip-icon px-[7px] py-[6px] flex items-center shrink-0 border-r border-osrs-chip-border">
		<img src={skillIconUrl(skill)} alt={skill} width="20" height="20" class="pixelated w-5 h-5" />
	</div>
	<div class="bg-osrs-chip-bg px-[10px] py-[4px] flex flex-col justify-center">
		<span class="font-game text-[17px] text-osrs-chip-skill leading-none">{skill}</span>
		<span class="font-pixel text-[10px] text-osrs-gold-bright leading-[1.4]">
			{level}{#if levelsGained > 1}<span class="text-[8px] text-osrs-gold-dim ml-1">+{levelsGained}</span>{/if}
		</span>
	</div>
</div>
