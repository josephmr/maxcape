<script lang="ts">
	import { questPointIconUrl } from '$lib/osrs';
	let { questName }: { questName: string } = $props();
</script>

<div class="flex items-stretch border border-osrs-chip-border overflow-hidden cursor-default">
	<div class="bg-osrs-chip-icon chip-icon-pad flex items-center shrink-0 border-r border-osrs-chip-border">
		<img
			src={questPointIconUrl}
			alt="Quest"
			width="32"
			height="32"
			class="pixelated w-6 h-6 lg:w-8 lg:h-8"
		/>
	</div>
	<div class="bg-osrs-chip-bg chip-content-pad flex flex-col justify-center">
		<span class="font-game text-[17px] lg:text-[21px] text-osrs-chip-skill leading-none">{questName}</span>
	</div>
</div>
