<script lang="ts">
	import { diaryIconUrl } from '$lib/osrs';
	let { area, difficulty }: { area: string; difficulty: string } = $props();

	const tierColor: Record<string, string> = {
		Elite:  'text-osrs-tier-elite',
		Hard:   'text-osrs-tier-hard',
		Medium: 'text-osrs-tier-medium',
		Easy:   'text-osrs-tier-easy'
	};

	const tierClass = $derived(tierColor[difficulty] ?? 'text-osrs-gold-dim');
</script>

<div class="flex items-stretch border border-osrs-chip-border overflow-hidden cursor-default">
	<div class="bg-osrs-chip-icon chip-icon-pad flex items-center shrink-0 border-r border-osrs-chip-border">
		<img
			src={diaryIconUrl}
			alt="Achievement Diary"
			width="32"
			height="32"
			class="pixelated w-6 h-6 lg:w-8 lg:h-8"
		/>
	</div>
	<div class="bg-osrs-chip-bg chip-content-pad flex flex-col justify-center">
		<span class="font-game text-[17px] lg:text-[21px] text-osrs-chip-skill leading-none">{area}</span>
		<span class="font-pixel text-[8px] lg:text-[10px] {tierClass} leading-[1.4]">{difficulty}</span>
	</div>
</div>
