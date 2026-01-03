const synth = window.speechSynthesis;
let utterance: SpeechSynthesisUtterance | null = null;

function findVoice(voiceURI: string): SpeechSynthesisVoice | undefined {
	return synth.getVoices().find((voice) => voice.voiceURI === voiceURI);
}

export function updateSpeech(config: any) {
	if (!config?.speech?.enabled || !synth) {
		utterance = null;
		return;
	}
	utterance = new SpeechSynthesisUtterance("");
	if (config.speech.voiceURI) {
		const voice = findVoice(config.speech.voiceURI);
		if (voice) {
			utterance.voice = voice;
			utterance.lang = voice.lang;
		}
	}
}

export function speakText(text: string) {
	if (!utterance) {
		return;
	}
	utterance.text = text;
	speechSynthesis.speak(utterance);
}

export function speakCard(card: any) {
	speakText(card.icon);
}
