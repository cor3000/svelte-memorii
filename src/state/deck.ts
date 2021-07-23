import { cardColors, emojisFlat } from "./cards";
import { shuffle } from "../utils"

export const randomDeck = function (numCards) {
    const numPairs = numCards / 2;
    const colors = shuffle(cardColors).slice(0, numPairs);
    const icons = shuffle(emojisFlat).slice(0, numPairs);

    let deck = [];
    let uuid = 1000;
    icons.forEach((icon, index) => {
        const card = {
            id: index,
            icon: icon,
            color: colors[index],
        };
        deck.push({ ...card, uuid });
        uuid++;
        deck.push({ ...card, uuid });
        uuid++;
    });
    deck = shuffle(deck);
    if (numCards == 8) {
        deck.splice(4, 0, { dummy: true });
    }
    if (numCards == 10) {
        deck.splice(4, 0, { dummy: true });
        deck.splice(7, 0, { dummy: true });
    }
    return deck;
}