import { writable } from 'svelte/store';

const speechAvailable = !!(SpeechSynthesisUtterance && window.speechSynthesis);

export const configStore = writable({
    speech: speechAvailable ? {
        enabled: false,
        voiceURI: defaultVoice()?.voiceURI,
        lang: navigator.language
    } : undefined,
    numCards: 12
});

export const allSizes = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48, 56];

export const allVoices = speechAvailable && window.speechSynthesis.getVoices().length > 0
    ? speechSynthesis.getVoices().sort((a, b) => a.name.localeCompare(b.name))
    : null;

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

function defaultVoice(): any {
    return speechSynthesis.getVoices().find(voice => voice.default);
}
