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

	const iconSets: string[] = ["animal", "number"];
	let selectedIconSet: string = iconSets[0];

	const allColors: any[] = [
		"lightblue",
		"greenyellow",
		"salmon",
		"purple",
		"orange",
		"hotpink",
		"forestgreen",
		"royalblue",
		"crimson",
		"sandybrown",
		"slateblue",
		"goldenrod",
		"orangered",
		"deeppink",
		"pink",
		"blueviolet",
		"dodgerblue",
		"navy",
		"deepskyblue",
		"yellowgreen",
		"springgreen",
	];

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
		return shuffleArray(newCards);
	}

	let numCards = 12;
	let numCols: number;
	let numRows: number;
	initGrid();
	let cards: any[] = initCards(numCards);
	let openCards: any[] = [];

	function initGrid() {
		if (numCards == 24) {
			numCols = 4;
			numRows = 6;
		} else {
			numCols = Math.round(Math.sqrt(numCards));
			numRows = Math.ceil(numCards / numCols);
		}
	}

	function startGame() {
		openCards = [];
		cards.forEach((card) => {
			card.open = false;
			card.solved = false;
		});
		cards = cards;
		setTimeout(() => {
			cards = initCards(numCards);
			initGrid();
		}, 300);
	}

	let timeoutId;

	async function flipCard(card) {
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
				openCards[0].solved = true;
				openCards[1].solved = true;
				openCards.length = 0;
				cards = cards;
			} else {
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
	}
</script>

<main>
	<header>
		<h1>MEMORII</h1>
		<!-- <select bind:value={selectedIconSet}>
			{#each iconSets as iconSet}
			<option value={iconSet}>{iconSet}</option>
			{/each}
		</select> -->
		<label>
			Size
			<select bind:value={numCards} on:change={startGame}>
				<option value="4">4</option>
				<option value="6">6</option>
				<option value="8">8</option>
				<option value="10">10</option>
				<option value="12">12</option>
				<option selected value="16">16</option>
				<option value="20">20</option>
				<option value="24">24</option>
				<option value="30">30</option>
				<option value="36">36</option>
				<option value="42">42</option>
			</select>
		</label>
		<button on:click={startGame}>New Game</button>
	</header>
	<div style="--columns: {numCols}; --rows: {numRows}">
		{#each cards as card}
			<Card {card} on:flip={() => flipCard(card)} />
		{/each}
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
		width: 100%;
		height: 100%;
		display: grid;
		padding: 2vmin;
		gap: 2vmin;
	}

	button {
		border: none;
		background-color: slateblue;
		border-radius: 0.2rem;
		font-size: 1.5rem;
		color: white;
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
			max-height: calc(100vw * var(--columns) / var(--rows));
			max-width: calc(100vh / var(--columns) * var(--rows));
			grid-template-columns: repeat(var(--rows), 1fr);
			grid-template-rows: repeat(var(--columns), 1fr);
			font-size: calc(100vmin / var(--rows) * 0.65);
		}
	}
</style>
