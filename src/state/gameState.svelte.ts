import { randomDeck } from "./deck";
import { speakCard } from "./speechState.svelte";

const createInitialStats = () => ({
	numTurns: 0,
	numErrors: 0,
	knownCards: new Set(),
	errorRatio: NaN
});

export const game = $state({
	cards: [],
	numCards: 12,
	numCols: 3,
	numRows: 4,
	stats: createInitialStats()
});

function calcGrid(numCards: number) {
	if (numCards === 24) {
		return { numCols: 4, numRows: 6 };
	}
	if (numCards === 48) {
		return { numCols: 6, numRows: 8 };
	}
	const numCols = Math.round(Math.sqrt(numCards));
	return { numCols, numRows: Math.ceil(numCards / numCols) };
}

function initCards(numCards: number) {
	const grid = calcGrid(numCards);
	game.numCards = numCards;
	game.cards = randomDeck(numCards);
	game.numCols = grid.numCols;
	game.numRows = grid.numRows;
}

function clearGame() {
	game.stats = createInitialStats();
	game.cards = game.cards.map((card) => ({
		...card,
		open: false,
		solved: false
	}));
}

function findOtherCard(cards: any[], card: any) {
	return cards.find((c) => card.id === c.id && card.uuid !== c.uuid);
}

function findOpenCards(cards: any[]) {
	return cards.filter((c) => c.open && !c.solved);
}

function replaceByUuid(cards: any[], card: any) {
	cards[cards.findIndex((c) => card.uuid === c.uuid)] = card;
}

function replaceAllByUuid(cards: any[], cardsToReplace: any[]) {
	cardsToReplace.forEach((card) => replaceByUuid(cards, card));
}

function recordTurn(cards: any[], stats: any, [card1, card2]: any[]) {
	const otherCard1 = findOtherCard(cards, card1);
	const error =
		card1.id !== card2.id &&
		(stats.knownCards.has(card1.uuid) ||
			stats.knownCards.has(otherCard1.uuid) ||
			stats.knownCards.has(card2.uuid));

	const knownCards = new Set(stats.knownCards);
	knownCards.add(card1.uuid);
	knownCards.add(card2.uuid);

	const numTurns = stats.numTurns + 1;
	const numErrors = stats.numErrors + (error ? 1 : 0);

	return {
		...stats,
		numTurns,
		numErrors,
		knownCards,
		errorRatio: numErrors / numTurns
	};
}

function flipCard(cardToFlip: any) {
	const cards = [...game.cards];
	const openCards = findOpenCards(cards);
	if (openCards.length === 1 && openCards[0].uuid === cardToFlip.uuid) {
		return;
	}

	if (openCards.length === 2) {
		replaceAllByUuid(
			cards,
			findOpenCards(cards).map((card) => ({ ...card, open: false }))
		);
	}

	const flippedCard = { ...cardToFlip, open: true };
	let stats = game.stats;

	if (openCards.length === 1) {
		const openCard = { ...openCards[0] };
		if (openCard.id === flippedCard.id) {
			speakCard(flippedCard);
			openCard.solved = true;
			replaceByUuid(cards, openCard);
			flippedCard.solved = true;
		}
		stats = recordTurn(cards, game.stats, [openCard, flippedCard]);
	}

	replaceByUuid(cards, flippedCard);
	game.cards = cards;
	game.stats = stats;
}

function unflipCards() {
	const cards = [...game.cards];
	replaceAllByUuid(
		cards,
		findOpenCards(cards).map((card) => ({ ...card, open: false }))
	);
	game.cards = cards;
}

export const actions = {
	initCards,
	clearGame,
	flipCard,
	unflipCards
};
