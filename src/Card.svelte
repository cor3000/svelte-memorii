<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let card: any;

    const dispatch = createEventDispatcher();
    function flip(event) {
        dispatch("flip", event.detail);
    }
</script>

<div
    class="card"
    class:open={card.open}
    class:solved={card.solved}
    on:mousedown={flip}
    on:touchstart|preventDefault={flip}
>
    <div class="back">?</div>
    <div class="face" style="--card-color: {card.color}">
        {card.icon}
    </div>
</div>

<style>
    div.card {
        cursor: pointer;
        width: 100%;
        height: 100%;
        position: relative;
        border-radius: 7%;
        transform-style: preserve-3d;
        transition: transform 0.3s ease-in-out;
    }
    div.card.open {
        transform: rotateY(180deg);
    }
    div.card > div.face,
    div.card > div.back {
        border-radius: 7%;
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transform-style: flat;
        text-shadow: 2px 2px 5px black;
    }
    div.card > div.back {
        color: #bbb;
        background-color: #666;
        border: 0.7vmin solid #777;
    }
    div.card > div.face {
        border-color: transparent;
        background: linear-gradient(
            150deg,
            white -100%,
            var(--card-color),
            black 230%
        );
        transform: rotateY(180deg);
    }
    div.card.solved > div.face {
        border: 0.7vmin solid wheat;
        transition: transform 0.3s ease-in-out, border-color 0.3s 0s;
    }
</style>
