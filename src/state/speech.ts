import { configStore } from "./configStore";

const utterance = SpeechSynthesisUtterance ? new SpeechSynthesisUtterance("") : null;
let speechEnabled;

configStore.subscribe(config => {
    if (config.speechEnabled) {
        utterance.text = "OK";
        utterance.lang = config.speechLanguage;
        if (!speechEnabled) {
            speechSynthesis.speak(utterance);
        }
    }
    speechEnabled = config.speechEnabled;
})

export const speakCard = function (card: any) {
    if (speechEnabled && utterance) {
        utterance.text = card.icon;
        speechSynthesis.speak(utterance);
    }
}
