<script lang="ts">
	import type { PageData } from './$types';
	import PlayerHistoryLayout from '$lib/components/PlayerHistoryLayout.svelte';

	let { data }: { data: PageData } = $props();
</script>

<PlayerHistoryLayout playerName={data.playerName} activeTab="month" groups={data.months} />
