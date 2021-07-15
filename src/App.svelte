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

	let allCards: any[] = [
		{ id: 0, color: "lightblue", icon: "1" },
		{ id: 1, color: "lime", icon: "2" },
		{ id: 2, color: "red", icon: "3" },
		{ id: 3, color: "purple", icon: "4" },
		{ id: 4, color: "orange", icon: "5" },
		{ id: 5, color: "hotpink", icon: "6" },
	];

	const copy = (o) => {
		return { ...o };
	};

	function initCards() {
		var cards = [...allCards.map(copy), ...allCards.map(copy)];
		shuffleArray(cards);
		return cards;
	}

	let cards: any[] = initCards();
	let openCards: any[] = [];

	function startGame() {
		cards.forEach((card) => (card.open = false));
		cards = cards;
		setTimeout(() => (cards = initCards()), 500);
	}

	let timeoutId;

	async function flipCard(card) {
		clearTimeout(timeoutId);
		if (card.open || card.solved || openCards.length >= 2) {
			return;
			cards = cards;
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
				}, 3000);
			}
		}
	}
</script>

<h1>Memory <button on:click={startGame}>START</button></h1>
<main>
	{#each cards as card}
		<Card {card} on:flip={() => flipCard(card)} />
	{/each}
</main>

<style>
	main {
		display: grid;
		gap: 10px;
		grid-template-columns: 1fr 1fr 1fr;
		font-size: 25vw;
	}
</style>
