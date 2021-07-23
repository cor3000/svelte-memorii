import { writable } from 'svelte/store';

export const config = writable({
    speechEnabled: false,
    speechLanguage: 'de-de',
    numCards: 12
});