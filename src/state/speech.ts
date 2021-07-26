import { configStore } from "./configStore";

let utterance;
let speechEnabled;

configStore.subscribe(config => {
    if (config.speech) {
        if (config.speech.enabled) {
            utterance = new SpeechSynthesisUtterance("");
            utterance.text = "🐕🐈🐁";
            if (config.speech.voiceURI) {
                utterance.voice = findVoice(config.speech.voiceURI);
            } else {
                utterance.lang = config.speech.lang;
            }
            if (!speechEnabled) {
                speechSynthesis.speak(utterance);
            }
        }
        speechEnabled = config.speech.enabled;
    } else {
        speechEnabled = false;
    }
})

export const speakCard = function (card: any) {
    if (speechEnabled) {
        utterance.text = card.icon;
        speechSynthesis.speak(utterance);
    }
}

function findVoice(voiceURI: any): any {
    return window.speechSynthesis.getVoices().find(voice => voice.voiceURI === voiceURI);
}
