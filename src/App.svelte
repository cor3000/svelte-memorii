<script lang="ts">
	import { onMount } from "svelte";
	import {
		config,
		allSizes,
		allVoices,
		actions as configActions,
		initVoices
	} from "./state/configState.svelte";
	import { game, actions as gameActions } from "./state/gameState.svelte";
	import { speakText, updateSpeech } from "./state/speechState.svelte";
	import { delay, lastValuesGreater } from "./utils";
	import { settings } from "./settings";
	import { fade, scale } from "./transitions";

	import Card from "./Card.svelte";
	import Config from "./Config.svelte";

	let status = $state("initial");
	let finishType = $state("");
	let successRatioHistory = $state([]);
	let autoIncreaseSize = $state(false);
	let configOpen = $state(false);

	onMount(() => initVoices());
	$effect(() => updateSpeech(config));

	gameActions.initCards(config.numCards);

	async function startGame() {
		if (status === "initial") {
			status = "playing";
			return;
		}
		if (autoIncreaseSize) {
			increaseSize();
			await updateSize();
		} else {
			await clearGame();
		}
		status = "playing";
	}

	async function flipCard(card: any) {
		if (status === "initial") {
			startGame();
		}
		gameActions.flipCard(card);
		checkGameStatus();
	}

	function checkGameStatus() {
		if (!game.cards.find((c) => !c.dummy && !c.solved)) {
			finishGame("won");
		}
	}

	function giveUpGame() {
		game.cards = game.cards.map((card) =>
			card.dummy ? card : { ...card, open: true }
		);
		setTimeout(() => finishGame("givenup"), 300);
	}

	function finishGame(type: string) {
		status = "finished";
		finishType = type;
		if (finishType === "won") {
			successRatioHistory = [
				...successRatioHistory,
				1 - game.stats.errorRatio
			];
			autoIncreaseSize =
				lastValuesGreater(successRatioHistory, 3, 0.85) ||
				lastValuesGreater(successRatioHistory, 2, 0.925) ||
				lastValuesGreater(successRatioHistory, 1, 1);
		}
	}

	async function updateSize() {
		autoIncreaseSize = false;
		successRatioHistory = [];
		await clearGame();
		gameActions.initCards(config.numCards);
	}

	async function clearGame() {
		if (status !== "initial") {
			gameActions.clearGame();
			await delay(settings.cardFlipDuration);
			gameActions.initCards(config.numCards);
			status = "initial";
		}
		return null;
	}

	const toggleConfig = () => {
		configOpen = !configOpen;
	};

	const rating = $derived.by(() => {
		const errorRatio = game.stats.errorRatio;
		if (isNaN(errorRatio)) {
			return {
				successRatioLabel: "",
				ratingLabel: "",
				starRating: ""
			};
		}
		const successRatioLabel = `${Math.floor((1 - errorRatio) * 100)}%`;
		let ratingLabel = "";
		let starRating = "";
		if (errorRatio === 0) {
			ratingLabel = "Perfect!";
			starRating = "⭐⭐⭐";
		} else if (errorRatio <= 0.08) {
			ratingLabel = "Excellent!";
			starRating = "⭐⭐";
		} else if (errorRatio <= 0.15) {
			ratingLabel = "Impressive!";
			starRating = "⭐";
		} else if (errorRatio <= 0.2) {
			ratingLabel = "Amazing";
			starRating = "";
		} else if (errorRatio <= 0.3) {
			ratingLabel = "Very Good";
			starRating = "";
		} else if (errorRatio <= 0.5) {
			ratingLabel = "Good";
			starRating = "";
		} else {
			ratingLabel = "Well Done";
			starRating = "";
		}
		return {
			successRatioLabel,
			ratingLabel,
			starRating
		};
	});
</script>

<main>
	<header>
		<h1>Memorii</h1>
		{#if status === "playing"}
			<span>
				{game.stats.numErrors}/{game.stats.numTurns}
				{rating.successRatioLabel}
			</span>
			<button onclick={giveUpGame}>give up</button>
		{:else}
			<button onclick={toggleConfig}>config</button>
		{/if}
	</header>
	<div
		style="--columns: {game.numCols}; --rows: {game.numRows}; --flipDuration: {settings.cardFlipDuration}ms"
	>
		{#each game.cards as card}
			{#if card.id >= 0}
				<Card {card} on:flip={() => flipCard(card)} />
			{:else}
				<div></div>
			{/if}
		{/each}
		{#if status === "finished"}
			<button
				type="button"
				class="finish-overlay"
				transition:fade={{ duration: 300 }}
				onclick={startGame}
			>
				<div
					in:scale={{ duration: 500 }}
					out:scale={{ duration: 300, start: 2 }}
				>
					{#if finishType === "won"}
						<p>{rating.ratingLabel}</p>
						<span class="finish">🎉</span>
						<span class="stars">{rating.starRating}</span>
						<p>{rating.successRatioLabel}</p>
					{:else if finishType === "givenup"}
						<span class="finish">💩</span>
					{/if}
				</div>
			</button>
		{/if}
	</div>
	<footer></footer>
</main>
{#if configOpen}
	<Config
		{config}
		{allSizes}
		{allVoices}
		{speakText}
		setNumCards={configActions.setNumCards}
		setSpeechEnabled={configActions.setSpeechEnabled}
		setSpeechVoice={configActions.setSpeechVoice}
		on:changeSize={updateSize}
		on:closeConfig={toggleConfig}
	/>
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

	button.finish-overlay {
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: radial-gradient(rgba(0, 0, 0, 0.6), transparent 80%);
	}
	button.finish-overlay > div {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	button.finish-overlay > div > span.finish {
		font-size: 35vmin;
		text-shadow: 2vmin 2vmin 3vmin black;
	}
	button.finish-overlay > div > span.stars {
		font-size: 16vmin;
	}
	button.finish-overlay > div > p {
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
