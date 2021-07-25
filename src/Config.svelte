<script lang="ts">
    import { configStore } from "./state/configStore";
    import { allSizes } from "./state/configStore";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    function changeSize(event) {
        dispatch("changeSize", event.detail);
    }
</script>

<label>
    Size
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={$configStore.numCards} on:change={changeSize}>
        {#each allSizes as size}
            <option value={size}>{size}</option>
        {/each}
    </select>
</label>
<label>
    Speech
    <input type="checkbox" bind:checked={$configStore.speechEnabled} />
</label>
{#if $configStore.speechEnabled}
    <label>
        Language
        <select bind:value={$configStore.speechLanguage}>
            <option value="de">Deutsch</option>
            <option value="zh-tw">Taiwanisch</option>
            <option value="en">English</option>
        </select>
    </label>
{/if}
