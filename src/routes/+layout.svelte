<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ThemeSwitcher />

<a
	href="https://github.com/josephmr/maxcape"
	target="_blank"
	rel="noopener noreferrer"
	class="fixed top-4 right-4 text-osrs-gold-dim hover:text-osrs-gold transition-colors duration-[120ms] z-50"
	aria-label="GitHub repository"
>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-6 h-6 lg:w-7 lg:h-7">
		<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
	</svg>
</a>

<div class="flex flex-col min-h-dvh">
	{@render children()}

	<footer class="flex justify-center items-center gap-1.5 py-4">
		<span class="font-game text-[17px] lg:text-[19px] text-osrs-gold-dim">Made with</span>
		<img
			src="https://oldschool.runescape.wiki/images/Hitpoints_icon.png"
			alt="hitpoints"
			width="16"
			height="16"
			class="pixelated w-4 h-4 object-contain"
		/>
		<span class="font-game text-[17px] lg:text-[19px] text-osrs-gold-dim">by</span>
		<a
			href="https://github.com/josephmr"
			target="_blank"
			rel="noopener noreferrer"
			class="font-game text-[17px] lg:text-[19px] text-osrs-gold-dim hover:text-osrs-gold transition-colors duration-[120ms]"
		>josephmr</a>
	</footer>
</div>
