<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "./transitions";

    export let config;
    export let allSizes = [];
    export let allVoices = [];
    export let speakText;
    export let setNumCards;
    export let setSpeechEnabled;
    export let setSpeechVoice;

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

    function handleSizeChange(event) {
        const nextValue = Number(event.currentTarget.value);
        setNumCards(nextValue);
        changeSize(event);
    }

    function handleSpeechToggle(event) {
        setSpeechEnabled(event.currentTarget.checked);
    }

    function handleVoiceChange(event) {
        setSpeechVoice(event.currentTarget.value);
    }

    function handleWindowKeydown(event) {
        if (event.key === "Escape") {
            event.preventDefault();
            closeConfig(event);
        }
    }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div
    transition:fade={{ from: 'top', duration: 300 }}
    role="button"
    tabindex="0"
    aria-label="Close configuration"
    onclick={closeConfig}
    onkeydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            closeConfig(event);
        }
    }}
></div>
<section
    transition:fly={{ from: 'top', duration: 300 }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
>
    <header>
        <h1>Config</h1>
        <button onclick={closeConfig}>close</button>
    </header>
    <p>
        <label>
            Size
            <!-- svelte-ignore a11y-no-onchange -->
            <select
                value={config.numCards}
                onchange={handleSizeChange}
            >
                {#each allSizes as size}
                    <option value={size}>{size}</option>
                {/each}
            </select>
        </label>
    </p>
    {#if config.speech && allVoices.length > 0}
        <p>
            <label>
                Speech
                <input
                    type="checkbox"
                    checked={config.speech.enabled}
                    onchange={handleSpeechToggle}
                />
            </label>
        </p>
        {#if config.speech.enabled}
            <p>
                <label>
                    Voice
                    <select value={config.speech.voiceURI} onchange={handleVoiceChange}>
                        {#each allVoices as voice}
                            <option value={voice.voiceURI}>
                                {voice.name} ({voice.lang})
                            </option>
                        {/each}
                    </select>
                </label>
                <button onclick={testVoice}>Test</button>
            </p>
        {/if}
    {/if}
</section>

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
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
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
