import { writable } from 'svelte/store';

export const configStore = writable({
    speechEnabled: false,
    speechLanguage: 'de-de',
    numCards: 12
});

export const allSizes = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48, 56];

const increaseSize = function () {
    configStore.update(config => {
        const newNumCards = allSizes[Math.min(
            allSizes.indexOf(config.numCards) + 1,
            allSizes.length
        )];
        return {
            ...config,
            numCards: newNumCards
        };
    });
};

export const actions = {
    increaseSize
}