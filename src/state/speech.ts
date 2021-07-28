import { configStore } from "./configStore";

let utterance;
let speechEnabled;

configStore.subscribe(config => {
    if (config.speech) {
        if (config.speech.enabled) {
            utterance = new SpeechSynthesisUtterance("");
            if (config.speech.voiceURI) {
                const voice = findVoice(config.speech.voiceURI);
                utterance.voice = voice;
                utterance.lang = voice.lang;
            }
        }
        speechEnabled = config.speech.enabled;
    } else {
        speechEnabled = false;
    }
})

export const speakCard = function (card: any) {
    speakText(card.icon);
}

export const speakText = function (text: string) {
    if (speechEnabled) {
        utterance.text = text;
        speechSynthesis.speak(utterance);
    }
}


function findVoice(voiceURI: any): any {
    return window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceURI);
}
