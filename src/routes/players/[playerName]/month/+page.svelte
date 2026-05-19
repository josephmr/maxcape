<script lang="ts">
	import type { PageData } from './$types';
	import PlayerHistoryLayout from '$lib/components/PlayerHistoryLayout.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.playerName} | MaxCape</title>
	<meta name="description" content="View {data.playerName}'s OSRS skill gains, boss kills, and collection log items on MaxCape." />
</svelte:head>

<PlayerHistoryLayout playerName={data.playerName} activeTab="month" groups={data.months} />
