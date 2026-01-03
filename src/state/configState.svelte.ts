const synth = window.speechSynthesis;
const speechAvailable = !!(
	typeof SpeechSynthesisUtterance !== "undefined" && synth
);

export const config = $state({
	speech: speechAvailable
		? {
				enabled: false,
				voiceURI: defaultVoice()?.voiceURI
			}
		: undefined,
	numCards: 12
});

export const allSizes = [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48, 56];
export const allVoices = $state([]);

function refreshVoices() {
	if (!speechAvailable) {
		allVoices.length = 0;
		return;
	}
	const voices = synth.getVoices();
	allVoices.length = 0;
	if (voices.length) {
		allVoices.push(...voices.sort((a, b) => a.name.localeCompare(b.name)));
	}
	if (config.speech) {
		config.speech.voiceURI = defaultVoice()?.voiceURI;
	}
}

function defaultVoice(): SpeechSynthesisVoice | undefined {
	return synth
		.getVoices()
		.find((voice) => voice.lang === navigator.language);
}

export function initVoices() {
	if (!speechAvailable) {
		allVoices.length = 0;
		return undefined;
	}
	refreshVoices();
	const timeout = setTimeout(refreshVoices, 1000);
	const handler = () => refreshVoices();
	synth.addEventListener("voiceschanged", handler);
	return () => {
		clearTimeout(timeout);
		synth.removeEventListener("voiceschanged", handler);
	};
}

function increaseSize() {
	const newNumCards =
		allSizes[Math.min(allSizes.indexOf(config.numCards) + 1, allSizes.length)];
	config.numCards = newNumCards;
}

function setNumCards(numCards: number) {
	config.numCards = numCards;
}

function setSpeechEnabled(enabled: boolean) {
	if (config.speech) {
		config.speech.enabled = enabled;
	}
}

function setSpeechVoice(voiceURI: string) {
	if (config.speech) {
		config.speech.voiceURI = voiceURI;
	}
}

export const actions = {
	increaseSize,
	setNumCards,
	setSpeechEnabled,
	setSpeechVoice
};
