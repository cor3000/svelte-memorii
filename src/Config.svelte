<script lang="ts">
    import { fade } from "svelte/transition";
    import { configStore } from "./state/configStore";
    import { allSizes, allVoices } from "./state/configStore";
    import { createEventDispatcher } from "svelte";
    import { speakText } from "./state/speech";

    const dispatch = createEventDispatcher();
    function changeSize(event) {
        dispatch("changeSize", event.detail);
    }
    function closeConfig(event) {
        dispatch("closeConfig", event.detail);
    }

    function testVoice() {
        speakText("🐕 🍎 🍌");
    }
</script>

<div transition:fade={{ duration: 300 }} on:click={closeConfig}>
    <section on:click|stopPropagation={() => {}}>
        <header>
            <h1>CONFIG</h1>
            <button on:click={closeConfig}>close</button>
        </header>
        <p>
            <label>
                Size
                <!-- svelte-ignore a11y-no-onchange -->
                <select
                    bind:value={$configStore.numCards}
                    on:change={changeSize}
                >
                    {#each allSizes as size}
                        <option value={size}>{size}</option>
                    {/each}
                </select>
            </label>
        </p>
        {#if $configStore.speech}
            <p>
                <label>
                    Speech
                    <input
                        type="checkbox"
                        bind:checked={$configStore.speech.enabled}
                    />
                </label>
            </p>
            {#if $configStore.speech.enabled}
                <p>
                    <label>
                        Voice
                        <select bind:value={$configStore.speech.voiceURI}>
                            {#each allVoices as voice}
                                <option value={voice.voiceURI}>
                                    {voice.name} ({voice.lang})
                                </option>
                            {/each}
                        </select>
                    </label>
                    <button on:click={testVoice}>Test</button>
                </p>
            {/if}
        {/if}
    </section>
</div>

<style>
    div {
        position: absolute;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        background-color: rgba(0, 0, 0, 0.3);
    }
    section {
        background-color: #333;
        padding: 2vmin;
        box-shadow: 0 5px 5vmin black;
    }
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
    h1 {
        font-size: 2em;
        margin: 0;
    }
    div {
        margin-bottom: 1em;
    }

    button {
        border: none;
        background-color: #444;
        border-radius: 0.2rem;
        font-size: 1.2rem;
        padding: 0.4rem 1rem;
        color: #aaa;
        text-align: center;
    }
</style>
