<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import { tick } from "svelte";
	import { config } from "./state/configStore";
	import { gameStore as game } from "./state/gameStore";
	import { actions } from "./state/gameStore";
	import Card from "./Card.svelte";

	const allSizes = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48, 56];

	let spokenText;
	$: {
		if ($config.speechEnabled) {
			spokenText = new SpeechSynthesisUtterance("Welcome to Memorii");
			spokenText.lang = $config.speechLanguage;
		}
	}

	actions.initCards($config.numCards);

	let status: string = "initial";
	let finishType: string;
	let numTurns: number = 0;
	let numTurnsCorrect: number = 0;
	let successRatio = NaN;
	$: successRatioLabel = isNaN(successRatio)
		? ""
		: Math.floor(successRatio * 100) + "%";
	const successRatioHistory: number[] = [];
	let autoIncreaseSize: boolean = false;

	function checkGameStatus() {
		if (!$game.cards.find((c) => !c.dummy && !c.solved)) {
			finishGame("won");
		}
	}

	function giveUpGame() {
		$game.cards.forEach((card, index) => {
			card.open = true;
		});
		$game.cards = $game.cards;
		setTimeout(() => finishGame("givenup"), 300);
	}

	function finishGame(type) {
		status = "finished";
		finishType = type;
		if (finishType === "won") {
			successRatioHistory.push(successRatio);
			autoIncreaseSize =
				lastValuesGreater(successRatioHistory, 3, 0.4) ||
				lastValuesGreater(successRatioHistory, 2, 0.5) ||
				lastValuesGreater(successRatioHistory, 1, 0.6);
		}
	}

	function resetTurns() {
		numTurns = 0;
		numTurnsCorrect = 0;
		successRatio = NaN;
	}

	function incrementTurns(correct) {
		numTurns++;
		if (correct) {
			numTurnsCorrect++;
		}
		successRatio = numTurnsCorrect / numTurns;
	}

	function lastValuesGreater(
		arr: number[],
		numValues: number,
		value: number
	) {
		if (arr.length >= numValues) {
			if (!arr.slice(-numValues).find((n) => n < value)) {
				return true;
			}
		}
		return false;
	}

	async function updateSize() {
		$game.cards = [];
		await tick(); // clear cards to avoid css transition
		actions.initCards($config.numCards);
		status = "initial";
		autoIncreaseSize = false;
		successRatioHistory.length = 0;
	}

	function startGame() {
		resetTurns();
		actions.clearGame();
		if (status === "initial") {
			status = "playing";
			return;
		}
		if (autoIncreaseSize) {
			$config.numCards =
				allSizes[
					Math.min(
						allSizes.indexOf($config.numCards) + 1,
						allSizes.length
					)
				];
			updateSize();
		}
		setTimeout(() => {
			actions.initCards($config.numCards);
			status = "playing";
		}, 300);
	}

	async function flipCard(card) {
		if (status !== "playing") {
			if (status === "finished") {
				startGame();
				return;
			}
			startGame();
		}
		actions.flipCard(card);
		checkGameStatus();
	}
</script>

<main>
	<header>
		<h1>MEMORII</h1>
		{#if status === "playing"}
			<span>{numTurnsCorrect}/{numTurns} {successRatioLabel}</span>
			<button on:click={giveUpGame}>GIVE UP</button>
		{:else}
			<label>
				Size
				<select bind:value={$config.numCards} on:change={updateSize}>
					{#each allSizes as size}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</label>
			<label>
				Speech
				<input type="checkbox" bind:checked={$config.speechEnabled} />
			</label>
			{#if $config.speechEnabled}
				<label>
					Language
					<select bind:value={$config.speechLanguage}>
						<option value="de">Deutsch</option>
						<option value="zh-tw">Taiwanisch</option>
						<option value="en">English</option>
					</select>
				</label>
			{/if}
			<button on:click={startGame}>START</button>
		{/if}
	</header>
	<div style="--columns: {$game.numCols}; --rows: {$game.numRows}">
		{#each $game.cards as card}
			{#if card.id >= 0}
				<Card {card} on:flip={() => flipCard(card)} />
			{:else}
				<div />
			{/if}
		{/each}
		{#if status === "finished"}
			<section transition:fade={{ duration: 300 }}>
				<div
					in:scale={{ duration: 500 }}
					out:scale={{ duration: 300, start: 2 }}
				>
					{#if finishType === "won"}
						<p>{successRatioLabel ? "Well Done!" : ""}</p>
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

<style>
	h1 {
		margin: 0;
	}

	main {
		position: relative;
		height: calc(100vh);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	header {
		padding: 2vmin;
		flex: 1;
		align-self: flex-start;
	}
	footer {
		flex: 1;
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
		font-size: 1.5rem;
		color: white;
		text-align: center;
	}

	section {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
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
