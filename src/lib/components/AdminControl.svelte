<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { authenticated }: { authenticated: boolean } = $props();
	let dialog: HTMLDialogElement;
	let password = $state('');
	let error = $state('');
	let busy = $state(false);

	function openLogin() {
		password = '';
		error = '';
		dialog.showModal();
	}

	async function login(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		error = '';
		try {
			const response = await fetch('/api/admin/session', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const result = (await response.json()) as { error?: string };
			if (!response.ok) {
				error = result.error ?? 'Unable to authenticate.';
				return;
			}
			dialog.close();
			await invalidateAll();
		} catch {
			error = 'Unable to reach the server.';
		} finally {
			busy = false;
		}
	}

	async function logout() {
		busy = true;
		try {
			await fetch('/api/admin/session', { method: 'DELETE' });
			await invalidateAll();
		} finally {
			busy = false;
		}
	}

	function activate() {
		if (authenticated) logout();
		else openLogin();
	}

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === dialog) dialog.close();
	}
</script>

<button
	type="button"
	onclick={activate}
	disabled={busy}
	class="relative cursor-pointer text-osrs-gold-dim opacity-70 transition-colors duration-[120ms] hover:text-osrs-gold hover:opacity-100 disabled:cursor-wait"
	aria-label={authenticated ? 'Log out of admin' : 'Admin login'}
	title={authenticated ? 'Log out of admin' : 'Admin login'}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		class="h-5 w-5 lg:h-6 lg:w-6"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M15.75 5.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 21a7.5 7.5 0 0 1 15 0"
		/>
	</svg>
	{#if authenticated}
		<span class="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 bg-osrs-accent" aria-hidden="true"
		></span>
	{/if}
</button>

<dialog
	bind:this={dialog}
	onclick={closeOnBackdrop}
	class="m-auto w-[calc(100%-2rem)] max-w-[400px] border border-osrs-card-border bg-osrs-card p-0 text-osrs-body shadow-2xl backdrop:bg-black/75"
>
	<form onsubmit={login} class="border-t-2 border-osrs-accent p-5 lg:p-7">
		<div class="mb-6 flex items-start justify-between gap-4">
			<h2 class="font-pixel text-[12px] text-osrs-gold lg:text-[15px]">Admin login</h2>
			<button
				type="button"
				onclick={() => dialog.close()}
				class="cursor-pointer px-2 font-game text-[28px] leading-none text-osrs-gold-dim hover:text-osrs-gold"
				aria-label="Close modal">×</button
			>
		</div>
		<label for="admin-password" class="flex flex-col gap-2">
			<span class="font-pixel text-[8px] text-osrs-gold-dim">Password</span>
			<input
				id="admin-password"
				type="password"
				bind:value={password}
				required
				autocomplete="current-password"
				class="osrs-form-control"
			/>
		</label>
		{#if error}<p class="mt-4 font-game text-[18px] text-red-400" role="alert">{error}</p>{/if}
		<div class="mt-6 flex justify-end gap-3">
			<button type="button" onclick={() => dialog.close()} class="osrs-secondary-button"
				>Cancel</button
			>
			<button class="osrs-primary-button" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
		</div>
	</form>
</dialog>
