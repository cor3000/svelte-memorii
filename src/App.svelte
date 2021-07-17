<script lang="ts">
	import { tick } from "svelte";
	import Card from "./Card.svelte";

	function shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}

	const iconSets: string[] = ["animal", "number"];
	let selectedIconSet: string = iconSets[0];

	const allCards: any[] = [
		{ id: 0, color: "lightblue", number: "1", animal: "\\1f989" },
		{ id: 1, color: "greenyellow", number: "2", animal: "\\1f420" },
		{ id: 2, color: "red", number: "3", animal: "\\1f422" },
		{ id: 3, color: "purple", number: "4", animal: "\\1f40c" },
		{ id: 4, color: "orange", number: "5", animal: "\\1f98b" },
		{ id: 5, color: "hotpink", number: "6", animal: "\\1f41d" },
		{ id: 6, color: "forestgreen", number: "7", animal: "\\1f41e" },
		{ id: 7, color: "royalblue", number: "8", animal: "\\1f986" },
	];

	const initCard = (card) => {
		return { ...card, icon: card[selectedIconSet] };
	};

	function initCards() {
		var cards = [...allCards.map(initCard), ...allCards.map(initCard)];
		shuffleArray(cards);
		return cards;
	}

	let cards: any[] = initCards();
	let openCards: any[] = [];

	function startGame() {
		openCards = [];
		cards.forEach((card) => {
			card.open = false;
			card.solved = false;
		});
		cards = cards;
		setTimeout(() => (cards = initCards()), 300);
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

<h1>
	MEMORII
	<button on:click={startGame}>START</button>
	<select bind:value={selectedIconSet}>
		{#each iconSets as iconSet}
			<option value={iconSet}>{iconSet}</option>
		{/each}
	</select>
</h1>
<main>
	{#each cards as card}
		<Card {card} on:flip={() => flipCard(card)} />
	{/each}
</main>

<style>
	main {
		display: grid;
		gap: 10px;
		grid-template-columns: repeat(4, 1fr);
		font-size: calc(100vw / 4 * 0.7);
	}
</style>
