<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import { configStore, actions as configActions } from "./state/configStore";
	import { gameStore, actions as gameActions } from "./state/gameStore";
	import { delay, lastValuesGreater } from "./utils";
	import { settings } from "./settings";

	import Card from "./Card.svelte";
	import Config from "./Config.svelte";

	let status: string = "initial";
	let finishType: string;
	const successRatioHistory: number[] = [];
	let autoIncreaseSize: boolean = false;

	gameActions.initCards($configStore.numCards);

	async function startGame() {
		if (status === "initial") {
			status = "playing";
			return;
		}
		if (autoIncreaseSize) {
			configActions.increaseSize();
			await updateSize();
		} else {
			await clearGame();
		}
		status = "playing";
	}

	async function flipCard(card) {
		if (status === "initial") {
			startGame();
		}
		gameActions.flipCard(card);
		checkGameStatus();
	}

	function checkGameStatus() {
		if (!$gameStore.cards.find((c) => !c.dummy && !c.solved)) {
			finishGame("won");
		}
	}

	function giveUpGame() {
		$gameStore.cards.forEach((card, index) => {
			card.open = true;
		});
		$gameStore.cards = $gameStore.cards;
		setTimeout(() => finishGame("givenup"), 300);
	}

	function finishGame(type) {
		status = "finished";
		finishType = type;
		if (finishType === "won") {
			successRatioHistory.push(1 - $gameStore.stats.errorRatio);
			autoIncreaseSize =
				lastValuesGreater(successRatioHistory, 3, 0.85) ||
				lastValuesGreater(successRatioHistory, 2, 0.925) ||
				lastValuesGreater(successRatioHistory, 1, 1);
		}
	}

	async function updateSize() {
		autoIncreaseSize = false;
		successRatioHistory.length = 0;
		await clearGame();
		gameActions.initCards($configStore.numCards);
	}

	async function clearGame() {
		if (status !== "initial") {
			gameActions.clearGame();
			await delay(settings.cardFlipDuration); // wait for card flip animation
			gameActions.initCards($configStore.numCards);
			status = "initial";
		}
		return null;
	}

	let configOpen: boolean = false;
	const toggleConfig = function () {
		configOpen = !configOpen;
	};

	$: successRatioLabel = "";
	$: ratingLabel = "";
	$: {
		const errorRatio = $gameStore.stats.errorRatio;
		if (isNaN(errorRatio)) {
			successRatioLabel = "";
			ratingLabel = "";
		} else {
			successRatioLabel =
				Math.floor((1 - $gameStore.stats.errorRatio) * 100) + "%";
			if (errorRatio === 0) {
				ratingLabel = "⭐⭐⭐ Perfect!";
			} else if (errorRatio <= 0.08) {
				ratingLabel = "⭐⭐ Excellent!";
			} else if (errorRatio <= 0.15) {
				ratingLabel = "⭐ Impressive!";
			} else if (errorRatio <= 0.2) {
				ratingLabel = "Amazing";
			} else if (errorRatio <= 0.3) {
				ratingLabel = "Very Good";
			} else if (errorRatio <= 0.5) {
				ratingLabel = "Good";
			} else {
				ratingLabel = "Well Done";
			}
		}
	}
</script>

<main>
	<header>
		<h1>MEMORII</h1>
		{#if status === "playing"}
			<span>
				{$gameStore.stats.numErrors}/{$gameStore.stats.numTurns}
				{successRatioLabel}
			</span>
			<button on:click={giveUpGame}>give up</button>
		{:else}
			<button on:click={toggleConfig}>config</button>
		{/if}
	</header>
	<div
		style="--columns: {$gameStore.numCols}; --rows: {$gameStore.numRows}; --flipDuration: {settings.cardFlipDuration}ms"
	>
		{#each $gameStore.cards as card}
			{#if card.id >= 0}
				<Card {card} on:flip={() => flipCard(card)} />
			{:else}
				<div />
			{/if}
		{/each}
		{#if status === "finished"}
			<section transition:fade={{ duration: 300 }} on:click={startGame}>
				<div
					in:scale={{ duration: 500 }}
					out:scale={{ duration: 300, start: 2 }}
				>
					{#if finishType === "won"}
						<p>{ratingLabel}</p>
						<span>🎉</span>
						<p>{successRatioLabel}</p>
					{:else if finishType === "givenup"}
						<span>💩</span>
					{/if}
				</div>
			</section>
		{/if}
	</div>
	<footer />
</main>
{#if configOpen}
	<Config on:changeSize={updateSize} on:closeConfig={toggleConfig} />
{/if}

<style>
	h1 {
		margin: 0;
	}

	main {
		position: relative;
		height: calc(100vh);
		display: flex;
		justify-content: space-between;
		align-items: center;
		overflow: hidden;
	}

	header {
		padding: 2vmin;
		align-self: flex-start;
	}
	footer {
	}

	div {
		position: relative;
		width: 100%;
		height: 100%;
		display: grid;
		padding: 2vmin;
		gap: 2vmin;
		user-select: none;
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

	section {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: radial-gradient(rgba(0, 0, 0, 0.6), transparent 80%);
	}
	section > div {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	section > div > span {
		font-size: 40vmin;
		text-shadow: 2vmin 2vmin 3vmin black;
	}
	section > div > p {
		margin: 0;
		padding: 1vmin;
		font-size: 15vmin;
		text-shadow: 1vmin 1vmin 2vmin black;
		text-align: center;
	}

	@media (orientation: portrait) {
		header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
		}
		main {
			flex-direction: column;
		}
		div {
			max-height: calc(100vw * 1.2 / var(--columns) * var(--rows));
			max-width: calc(100vh * var(--columns) / var(--rows));
			grid-template-columns: repeat(var(--columns), 1fr);
			grid-template-rows: repeat(var(--rows), 1fr);
			font-size: calc(100vmin / var(--columns) * 0.65);
		}
	}

	@media (orientation: landscape) {
		header {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10vh;
		}
		main {
		}
		div {
			grid-auto-flow: column;
			max-height: calc(100vw * var(--columns) / var(--rows));
			max-width: calc(100vh / var(--columns) * var(--rows));
			grid-template-columns: repeat(var(--rows), 1fr);
			grid-template-rows: repeat(var(--columns), 1fr);
			font-size: calc(100vmin / var(--rows) * 0.65);
		}
	}
</style>
