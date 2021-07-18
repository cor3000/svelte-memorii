<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let card: any;

    $: cardStyle = `--card-color: ${card.color}; --card-icon: '${card.icon}'`;

    const dispatch = createEventDispatcher();

    function flip(event) {
        dispatch("flip", event.detail);
    }
</script>

<div
    class="card"
    class:open={card.open}
    class:solved={card.solved}
    style={cardStyle}
    on:mousedown={flip}
    on:touchstart|preventDefault={flip}
/>

<style>
    div.card {
        position: relative;
        border-radius: 7%;
        background-color: #888;
        border: 0.5vmin solid transparent;
        transform: rotateY(0deg) scale(0.9);
        transition: transform 0.3s ease-in-out, background-color 0s 0.15s;
    }
    div.card.open {
        background-color: var(--card-color);
        transform: rotateY(180deg) scale(1);
    }
    div.card.solved {
        border: 0.7vmin solid wheat;
        transition: transform 0.3s ease-in-out, background-color 0s 0.15s,
            border-color 0.3s 0s;
    }
    div.card::before,
    div.card::after {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0s 0.15s;
        text-shadow: 2px 2px 5px black;
    }
    div.card::before {
        content: "?";
        opacity: 1;
    }
    div.card.open::before {
        opacity: 0;
    }
    div.card::after {
        content: var(--card-icon);
        opacity: 0;
        transform: rotateY(180deg);
    }
    div.card.open::after {
        opacity: 1;
    }
</style>
