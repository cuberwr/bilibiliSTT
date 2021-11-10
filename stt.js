const sdk = require("microsoft-cognitiveservices-speech-sdk")
const fs = require('fs')
const fetch=require('node-fetch')

async function stt(wav,text){
    let res = await fetch('https://azure.microsoft.com/zh-cn/services/cognitive-services/speech-to-text/#overview')
    res = await res.text()
    token = res.split('token: "')[1]
    authorizationToken = token.split('"')[0]
    region = res.split('region: "')[1]
    serviceRegion = region.split('"')[0]

    let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(wav))
    var speechConfig = sdk.SpeechConfig.fromAuthorizationToken(authorizationToken, serviceRegion)
    speechConfig.speechRecognitionLanguage = "zh-CN"
    speechConfig.setServiceProperty("punctuation", "explicit", sdk.ServicePropertyChannel.UriQueryParameter)
    let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    var t = ''
    recognizer.recognizing = (s, e) => {
        console.clear()
        //console.log(t+e.result.text)
        console.log(`RECOGNIZING: Text=${e.result.text}`);
    };

    recognizer.recognized = (s, e) => {
        t += e.result.text + '\n'
        fs.writeFileSync(text, t)
        if (e.result.reason == ResultReason.RecognizedSpeech) {
            console.log(`RECOGNIZED: Text=${e.result.text}`);
        } else if (e.result.reason == ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be recognized.");
        }
    };

    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        fs.writeFileSync(text, t)
        if (e.reason == CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log("CANCELED: Did you update the key and location/region info?");
        }

        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
        console.log("\n    Session stopped event.");
        recognizer.stopContinuousRecognitionAsync();
        fs.writeFileSync(text, t)
    };

    recognizer.startContinuousRecognitionAsync();
}

module.exports=stt