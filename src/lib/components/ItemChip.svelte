<script lang="ts">
	import { itemIconUrl } from '$lib/osrs';

	let { itemName }: { itemName: string } = $props();
</script>

<div class="flex items-stretch border border-osrs-chip-border overflow-hidden cursor-default">
	<div class="bg-osrs-chip-icon chip-icon-pad flex items-center shrink-0 border-r border-osrs-chip-border">
		<img src={itemIconUrl(itemName)} alt={itemName} width="36" height="36" class="pixelated w-7 h-7 lg:w-9 lg:h-9" />
	</div>
	<div class="bg-osrs-chip-bg chip-content-pad flex items-center">
		<span class="font-game text-[20px] lg:text-[25px] text-osrs-chip-item leading-none">{itemName}</span>
	</div>
</div>
