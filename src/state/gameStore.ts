import { writable } from 'svelte/store';

import { randomDeck } from "./deck";
import { speakCard } from "./speech";

const initialStats = {
    numTurns: 0,
    numErrors: 0,
    knownCards: new Set(),
    errorRatio: NaN
};

export const gameStore = writable({
    cards: [],
    numCards: 12,
    numCols: 3,
    numRows: 4,
    stats: initialStats
});

const initCards = function (numCards) {
    gameStore.update(game => {
        return {
            ...game,
            numCards,
            cards: randomDeck(numCards),
            ...calcGrid(numCards)
        }
    });
}

const clearGame = function () {
    gameStore.update(game => {
        return {
            ...game,
            stats: initialStats,
            cards: game.cards.map(card => { return { ...card, open: false, solved: false } })
        }
    });
}

function recordTurn(cards, stats, [card1, card2]) {
    var otherCard1 = findOtherCard(cards, card1);
    const error = card1.id !== card2.id
        && (stats.knownCards.has(card1.uuid)
            || stats.knownCards.has(otherCard1.uuid)
            || stats.knownCards.has(card2.uuid));

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
    }
}

const calcGrid = function (numCards) {
    if (numCards == 24) {
        return { numCols: 4, numRows: 6 };
    } else if (numCards == 48) {
        return { numCols: 6, numRows: 8 };
    } else {
        let numCols = Math.round(Math.sqrt(numCards));
        return { numCols, numRows: Math.ceil(numCards / numCols) };
    }
}


const findOtherCard = function (cards: any[], card: any) {
    return cards.find(c => card.id === c.id && card.uuid !== c.uuid);
}

const findByUuid = function (cards: any[], uuid: number) {
    return cards.find(c => uuid === c.uuid);
}

const replaceByUuid = function (cards: any[], card) {
    cards[cards.findIndex(c => card.uuid === c.uuid)] = card;
}

const findOpenCards = function (cards: any[]): any[] {
    return cards.filter(c => c.open && !c.solved);
}

const replaceAllByUuid = function (cards: any[], cardsToReplace: any[]) {
    cardsToReplace.forEach(card => replaceByUuid(cards, card));
}

const flipCard = async function (cardToFlip) {
    gameStore.update(game => {
        const cards = [...game.cards];

        const openCards = findOpenCards(cards);
        if (openCards.length === 1 && openCards[0].uuid === cardToFlip.uuid) {
            return game;
        }

        if (openCards.length === 2) {
            replaceAllByUuid(cards,
                findOpenCards(cards)
                    .map(c => { return { ...c, open: false } }));
        }

        const flippedCard = { ...cardToFlip, open: true }
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
        return {
            ...game, cards, stats
        }
    });
}
const unflipCards = function () {
    gameStore.update(game => {
        const cards = [...game.cards];
        replaceAllByUuid(cards,
            findOpenCards(cards)
                .map(c => { return { ...c, open: false } }));
        return { ...game, cards }
    })
}

export const actions = {
    initCards,
    clearGame,
    flipCard,
    unflipCards
}