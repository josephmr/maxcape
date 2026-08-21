<script lang="ts">
	let {
		id,
		label,
		options,
		value = $bindable(),
		required = true
	}: {
		id: string;
		label: string;
		options: readonly string[];
		value: string;
		required?: boolean;
	} = $props();
</script>

<label for={id} class="flex flex-col gap-2">
	<span class="font-pixel text-[8px] text-osrs-gold-dim">{label}</span>
	<select {id} bind:value {required} class="osrs-form-control">
		<option value="" disabled>Select {label.toLowerCase()}</option>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>
