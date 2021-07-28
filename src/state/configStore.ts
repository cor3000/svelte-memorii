import { writable } from 'svelte/store';

const synth = window.speechSynthesis;
const speechAvailable = !!(SpeechSynthesisUtterance && synth);

export const configStore = writable({
    speech: speechAvailable ? {
        enabled: false,
        voiceURI: defaultVoice()?.voiceURI
    } : undefined,
    numCards: 12
});

export const allSizes = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48, 56];

export let allVoices;
setTimeout(() => {
    allVoices = speechAvailable && synth.getVoices().length > 0
        ? synth.getVoices().sort((a, b) => a.name.localeCompare(b.name))
        : null;
    configStore.update(config => {
        return { 
            ...config, 
            voiceURI: defaultVoice()?.voiceURI
        };
    });
}, 0);

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
    return synth.getVoices().find(voice => voice.lang === navigator.language);
}
