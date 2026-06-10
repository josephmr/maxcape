<script module lang="ts">
	const reportedFailures = new Set<string>();
</script>

<script lang="ts">
	import fallbackUrl from '$lib/assets/item-icons/cake_of_guidance.png';

	let {
		itemName,
		src,
		alt = itemName,
		width,
		height,
		class: className = ''
	}: {
		itemName: string;
		src: string;
		alt?: string;
		width?: number;
		height?: number;
		class?: string;
	} = $props();

	function reportFailure(failedUrl: string): void {
		const key = `${itemName}\n${failedUrl}`;
		if (reportedFailures.has(key)) return;
		reportedFailures.add(key);

		void fetch('/api/item-icon-failures', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				itemName,
				failedUrl,
				pagePath: window.location.pathname + window.location.search
			}),
			keepalive: true
		}).catch(() => {
			// The local fallback still works when failure reporting is unavailable.
		});
	}

	function handleError(event: Event): void {
		const image = event.currentTarget as HTMLImageElement;
		if (image.dataset.fallbackApplied === 'true') return;

		const failedUrl = image.currentSrc || image.src;
		image.dataset.fallbackApplied = 'true';
		image.src = fallbackUrl;
		reportFailure(failedUrl);
	}
</script>

<img {src} {alt} {width} {height} class={className} onerror={handleError} />
