<script lang="ts">
	import { itemIconUrl } from '$lib/osrs';

	let { itemName }: { itemName: string } = $props();
</script>

<div class="flex items-stretch border border-osrs-chip-border overflow-hidden cursor-default">
	<div class="bg-osrs-chip-icon px-[7px] py-[6px] flex items-center shrink-0 border-r border-osrs-chip-border">
		<img src={itemIconUrl(itemName)} alt={itemName} width="28" height="28" class="pixelated w-7 h-7" />
	</div>
	<div class="bg-osrs-chip-bg px-[10px] py-[4px] flex items-center">
		<span class="font-game text-[20px] text-osrs-chip-item leading-none">{itemName}</span>
	</div>
</div>
