<script lang="ts">
	import { tick } from "svelte";
	import { emojisFlat } from "./emojis";
	import Card from "./Card.svelte";

	function shuffleArray(array: any[]): any[] {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}

	const allColors: any[] = [
		"blueviolet",
		"cadetblue",
		"crimson",
		"deeppink",
		"deepskyblue",
		"dodgerblue",
		"forestgreen",
		"goldenrod",
		"greenyellow",
		"hotpink",
		"indianred",
		"indigo",
		"lightblue",
		"lightcoral",
		"navy",
		"maroon",
		"mediumseagreen",
		"mediumvioletred",
		"orange",
		"orangered",
		"pink",
		"purple",
		"royalblue",
		"salmon",
		"sandybrown",
		"slateblue",
		"springgreen",
		"yellowgreen",
	];

	const allSizes = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48, 56];

	function initCards(numCards) {
		const numPairs = numCards / 2;
		const colors = shuffleArray([...allColors]).slice(0, numPairs);
		const icons = shuffleArray([...emojisFlat]).slice(0, numPairs);

		const newCards = [];
		icons.forEach((icon, index) => {
			const card = {
				id: index,
				icon: icon,
				color: colors[index],
			};
			newCards.push(card);
			newCards.push({ ...card });
		});
		shuffleArray(newCards);
		if (numCards == 8) {
			newCards.splice(4, 0, { dummy: true });
		}
		if (numCards == 10) {
			newCards.splice(4, 0, { dummy: true });
			newCards.splice(7, 0, { dummy: true });
		}
		return newCards;
	}

	let numCards = 12;
	let numCols: number;
	let numRows: number;
	initGrid();
	let cards: any[] = initCards(numCards);
	let status: string = "initial";
	let finishType: string;
	let openCards: any[] = [];
	let numTurns: number = 0;
	let numTurnsCorrect: number = 0;
	let successRatio = NaN;
	$: successRatioLabel = isNaN(successRatio)
		? ""
		: Math.floor(successRatio * 100) + "%";
	const successRatioHistory: number[] = [];
	let autoIncreaseSize: boolean = false;

	function initGrid() {
		if (numCards == 24) {
			numCols = 4;
			numRows = 6;
		} else if (numCards == 48) {
			numCols = 6;
			numRows = 8;
		} else {
			numCols = Math.round(Math.sqrt(numCards));
			numRows = Math.ceil(numCards / numCols);
		}
	}

	function checkGameStatus() {
		if (!cards.find((c) => !c.dummy && !c.solved)) {
			finishGame("won");
		}
	}

	function giveUpGame() {
		cards.forEach((card, index) => {
			card.open = true;
		});
		cards = cards;
		finishGame("givenup");
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

	function updateSize() {
		cards = initCards(numCards);
		initGrid();
		status = "initial";
		autoIncreaseSize = false;
		successRatioHistory.length = 0;
	}

	function startGame() {
		resetTurns();
		clearGame();
		if (status === "initial") {
			status = "playing";
			return;
		}
		console.log(autoIncreaseSize, successRatioHistory);
		if (autoIncreaseSize) {
			numCards =
				allSizes[
					Math.min(allSizes.indexOf(numCards) + 1, allSizes.length)
				];
			updateSize();
		}
		setTimeout(() => {
			cards = initCards(numCards);
			initGrid();
			status = "playing";
		}, 300);
	}

	function clearGame() {
		openCards = [];
		cards.forEach((card, index) => {
			card.open = false;
			card.solved = false;
		});
		cards = cards;
	}

	let timeoutId;

	async function flipCard(card) {
		if (status !== "playing") {
			if (status === "finished") {
				startGame();
				return;
			}
			startGame();
		}
		clearTimeout(timeoutId);
		if (card.open || card.solved || openCards.length >= 2) {
			cards = cards;
			return;
		}
		card.open = !card.open;
		openCards.push(card);
		cards = cards;
		if (openCards.length === 2) {
			if (openCards[0].id === openCards[1].id) {
				incrementTurns(true);
				openCards[0].solved = true;
				openCards[1].solved = true;
				openCards.length = 0;
				cards = cards;
			} else {
				incrementTurns(false);
				let toUnflip = [...openCards];
				openCards.length = 0;
				await tick();
				toUnflip[0].open = false;
				toUnflip[1].open = false;
				timeoutId = setTimeout(() => {
					cards = cards;
				}, 2000);
			}
		}
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
				<select bind:value={numCards} on:change={updateSize}>
					{#each allSizes as size}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</label>
			<button on:click={startGame}>START</button>
		{/if}
	</header>
	<div style="--columns: {numCols}; --rows: {numRows}">
		{#each cards as card}
			{#if card.id >= 0}
				<Card {card} on:flip={() => flipCard(card)} />
			{:else}
				<div />
			{/if}
		{/each}
		{#if status === "finished"}
			<section>
				{#if finishType === "won"}
					<span>🎉</span>
					<p>{successRatioLabel}</p>
				{:else if finishType === "givenup"}
					<span>💩</span>
				{/if}
			</section>
		{/if}
	</div>
	<footer />
</main>

<style>
	h1 {
		margin: 0;
	}

	header {
		padding: 2vmin;
		flex: 1;
		align-self: flex-start;
	}
	footer {
		flex: 1;
	}

	main {
		position: relative;
		height: calc(100vh);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	div {
		position: relative;
		width: 100%;
		height: 100%;
		display: grid;
		padding: 2vmin;
		gap: 2vmin;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		background: radial-gradient(rgba(0, 0, 0, 0.6), transparent 80%);
	}
	section > span {
		font-size: 40vmin;
		text-shadow: 2vmin 2vmin 3vmin black;
	}
	section > p {
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
