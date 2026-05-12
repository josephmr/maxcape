<script lang="ts">
	let { area, difficulty }: { area: string; difficulty: string } = $props();

	const tierColor: Record<string, string> = {
		Elite:  'text-osrs-tier-elite',
		Hard:   'text-osrs-tier-hard',
		Medium: 'text-osrs-tier-medium',
		Easy:   'text-osrs-tier-easy'
	};

	const tierClass = tierColor[difficulty] ?? 'text-osrs-gold-dim';
</script>

<div class="flex items-stretch border border-osrs-chip-border overflow-hidden cursor-default">
	<div class="bg-osrs-chip-icon px-[7px] py-[6px] flex items-center shrink-0 border-r border-osrs-chip-border">
		<img
			src="https://oldschool.runescape.wiki/images/Achievement_Diaries.png"
			alt="Achievement Diary"
			width="24"
			height="24"
			class="pixelated w-6 h-6"
		/>
	</div>
	<div class="bg-osrs-chip-bg px-[10px] py-[4px] flex flex-col justify-center">
		<span class="font-game text-[17px] text-osrs-chip-skill leading-none">{area}</span>
		<span class="font-pixel text-[8px] {tierClass} leading-[1.4]">{difficulty}</span>
	</div>
</div>
