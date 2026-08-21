<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {
		BOSSES,
		COLLECTION_LOG_ITEMS,
		DIARY_AREAS,
		DIARY_DIFFICULTIES,
		EVENT_TYPE_OPTIONS,
		QUESTS,
		SKILLS,
		type ManualEventType
	} from '$lib/event-options';
	import SearchSelect from './SearchSelect.svelte';

	let { playerName }: { playerName: string } = $props();

	let dialog: HTMLDialogElement;
	let type = $state<ManualEventType>('SKILL_LEVEL_UP');
	let timestamp = $state('');
	let skill = $state('');
	let level = $state<number | undefined>();
	let bossName = $state('');
	let totalKc = $state<number | undefined>();
	let itemName = $state('');
	let area = $state('');
	let difficulty = $state('');
	let questName = $state('');
	let error = $state('');
	let busy = $state(false);

	function localDateTimeNow(): string {
		const now = new Date();
		const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
		return local.toISOString().slice(0, 16);
	}

	function resetForm() {
		type = 'SKILL_LEVEL_UP';
		timestamp = localDateTimeNow();
		skill = '';
		level = undefined;
		bossName = '';
		totalKc = undefined;
		itemName = '';
		area = '';
		difficulty = '';
		questName = '';
		error = '';
	}

	export function open() {
		resetForm();
		dialog.showModal();
	}

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === dialog) dialog.close();
	}

	function eventData(): Record<string, unknown> {
		switch (type) {
			case 'SKILL_LEVEL_UP':
				return { skill, level };
			case 'BOSS_KILL':
				return { bossName, totalKc };
			case 'COLLECTION_LOG':
				return { itemName };
			case 'ACHIEVEMENT_DIARY':
				return { area, difficulty };
			case 'QUEST_COMPLETED':
				return { questName };
		}
	}

	async function addEvent(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		error = '';
		try {
			const occurredAt = new Date(timestamp);
			if (!timestamp || Number.isNaN(occurredAt.getTime())) {
				error = 'Enter a valid occurrence time.';
				return;
			}
			const response = await fetch(`/api/accounts/${encodeURIComponent(playerName)}/events`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ type, timestamp: occurredAt.toISOString(), data: eventData() })
			});
			const result = (await response.json()) as { error?: string };
			if (!response.ok) {
				if (response.status === 401) {
					dialog.close();
					await invalidateAll();
					return;
				}
				error = result.error ?? 'Unable to add the event.';
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
</script>

<dialog
	bind:this={dialog}
	onclick={closeOnBackdrop}
	class="m-auto w-[calc(100%-2rem)] max-w-[560px] border border-osrs-card-border bg-osrs-card p-0 text-osrs-body shadow-2xl backdrop:bg-black/75"
>
	<div class="border-t-2 border-osrs-accent p-5 lg:p-7">
		<div class="mb-6 flex items-start justify-between gap-4">
			<div>
				<h2 class="font-pixel text-[12px] text-osrs-gold lg:text-[15px]">Add event</h2>
				<p class="mt-2 font-game text-[18px] text-osrs-gold-dim">{playerName}</p>
			</div>
			<button
				type="button"
				onclick={() => dialog.close()}
				class="cursor-pointer px-2 font-game text-[28px] leading-none text-osrs-gold-dim hover:text-osrs-gold"
				aria-label="Close modal">×</button
			>
		</div>

		<form onsubmit={addEvent} class="flex flex-col gap-4">
			<label for="event-type" class="flex flex-col gap-2">
				<span class="font-pixel text-[8px] text-osrs-gold-dim">Event type</span>
				<select id="event-type" bind:value={type} class="osrs-form-control">
					{#each EVENT_TYPE_OPTIONS as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>

			{#if type === 'SKILL_LEVEL_UP'}
				<SearchSelect id="event-skill" label="Skill" options={SKILLS} bind:value={skill} />
				<label for="event-level" class="flex flex-col gap-2">
					<span class="font-pixel text-[8px] text-osrs-gold-dim">Level</span>
					<input
						id="event-level"
						type="number"
						min="2"
						max="99"
						bind:value={level}
						required
						class="osrs-form-control"
					/>
				</label>
			{:else if type === 'BOSS_KILL'}
				<SearchSelect id="event-boss" label="Boss" options={BOSSES} bind:value={bossName} />
				<label for="event-kc" class="flex flex-col gap-2">
					<span class="font-pixel text-[8px] text-osrs-gold-dim">Total KC</span>
					<input
						id="event-kc"
						type="number"
						min="1"
						step="1"
						bind:value={totalKc}
						required
						class="osrs-form-control"
					/>
					<span class="font-game text-[16px] text-osrs-gold-dim">
						Adds one event per KC since the previous total, up to 50 at once.
					</span>
				</label>
			{:else if type === 'COLLECTION_LOG'}
				<SearchSelect
					id="event-item"
					label="Item"
					options={COLLECTION_LOG_ITEMS}
					bind:value={itemName}
				/>
			{:else if type === 'ACHIEVEMENT_DIARY'}
				<label for="event-area" class="flex flex-col gap-2">
					<span class="font-pixel text-[8px] text-osrs-gold-dim">Area</span>
					<select id="event-area" bind:value={area} required class="osrs-form-control">
						<option value="" disabled>Select an area</option>
						{#each DIARY_AREAS as option}<option value={option}>{option}</option>{/each}
					</select>
				</label>
				<label for="event-difficulty" class="flex flex-col gap-2">
					<span class="font-pixel text-[8px] text-osrs-gold-dim">Difficulty</span>
					<select id="event-difficulty" bind:value={difficulty} required class="osrs-form-control">
						<option value="" disabled>Select a tier</option>
						{#each DIARY_DIFFICULTIES as option}<option value={option}>{option}</option>{/each}
					</select>
				</label>
			{:else if type === 'QUEST_COMPLETED'}
				<SearchSelect id="event-quest" label="Quest" options={QUESTS} bind:value={questName} />
			{/if}

			<label for="event-time" class="flex flex-col gap-2">
				<span class="font-pixel text-[8px] text-osrs-gold-dim">Occurred at</span>
				<input
					id="event-time"
					type="datetime-local"
					bind:value={timestamp}
					required
					class="osrs-form-control"
				/>
			</label>

			{#if error}<p class="font-game text-[18px] text-red-400" role="alert">{error}</p>{/if}
			<div class="mt-2 flex justify-end gap-3">
				<button type="button" onclick={() => dialog.close()} class="osrs-secondary-button"
					>Cancel</button
				>
				<button class="osrs-primary-button" disabled={busy}>{busy ? 'Adding…' : 'Add event'}</button
				>
			</div>
		</form>
	</div>
</dialog>
