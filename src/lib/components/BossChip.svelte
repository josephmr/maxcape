<script lang="ts">
	import { bossImageUrl } from '$lib/osrs';

	let { bossName, killsToday, totalKc }: {
		bossName: string;
		killsToday: number;
		totalKc: number | null;
	} = $props();
</script>

<div class="flex items-stretch border border-osrs-chip-border overflow-hidden cursor-default">
	<div class="bg-osrs-chip-icon w-[46px] p-[4px] flex items-center justify-center shrink-0 border-r border-osrs-chip-border">
		<img
			src={bossImageUrl(bossName)}
			alt={bossName}
			class="pixelated w-9 h-9 object-contain"
		/>
	</div>
	<div class="bg-osrs-chip-bg px-[10px] py-[4px] flex flex-col justify-center">
		<span class="font-game text-[17px] text-osrs-chip-skill leading-none">{bossName}</span>
		<span class="font-pixel text-[10px] text-osrs-gold-bright leading-[1.4]">
			+{killsToday}{#if totalKc != null}<span class="text-[8px] text-osrs-gold-dim ml-1">{totalKc.toLocaleString()} kc</span>{/if}
		</span>
	</div>
</div>
