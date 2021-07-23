import { writable } from 'svelte/store';

import { randomDeck } from "./deck";

export const gameStore = writable({
    cards: [],
    numCards: 12,
    numCols: 3,
    numRows: 4,
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
            openCards: undefined,
            cards: game.cards.map(card => { return { ...card, open: false, solved: false } })
        }
    });
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

let unflipTimeout;
let toUnflip: number[];

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
    const unflipCurrent = function (cards) {
        replaceAllByUuid(cards,
            findOpenCards(cards)
                .map(c => { return { ...c, open: false } }));
    }

    gameStore.update(game => {
        const cards = [...game.cards];

        const openCards = findOpenCards(cards);
        if (openCards.length === 1 && openCards[0].uuid === cardToFlip.uuid) {
            return game;
        }

        clearTimeout(unflipTimeout);
        if (openCards.length === 2) {
            unflipCurrent(cards);
        }

        const flippedCard = { ...cardToFlip, open: true }

        let openCard;
        if (openCards.length === 1) {
            const openCard = { ...openCards[0] };
            if (openCard.id === flippedCard.id) {
                // if ($config.speechEnabled) {
                //     spokenText.text = card.icon;
                //     speechSynthesis.speak(spokenText);
                // }
                //incrementTurns(true);
                openCard.solved = true;
                replaceByUuid(cards, openCard);
                flippedCard.solved = true;
            } else {
                //incrementTurns(false);
                unflipTimeout = setTimeout(() => {
                    gameStore.update(game => {
                        const cards = [...game.cards];
                        unflipCurrent(cards);
                        return { ...game, cards }
                    })
                }, 2000);
            }
        }

        replaceByUuid(cards, flippedCard);
        const updated = {
            ...game, cards
        }
        console.log(game, updated);
        return updated;
    });
}


export const actions = {
    initCards,
    clearGame,
    flipCard
}