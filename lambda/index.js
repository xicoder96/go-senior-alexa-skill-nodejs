/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const AWS = require("aws-sdk");
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
/**
 * Extra start
 
const moment = require('moment');

const { LoggingRequestInterceptor, LoadAttributesRequestInterceptor, SaveAttributesResponseInterceptor } = require('./interceptors');

 * Extra end
 */
const clockSound = '<audio src="soundbank://soundlibrary/clocks/ticks/ticks_01"/> <audio src="soundbank://soundlibrary/clocks/ticks/ticks_01"/> <audio src="soundbank://soundlibrary/clocks/ticks/ticks_01"/>';
const postExerciseComplete = "Are you feeling any pain in the joints or ankle?";
const nextOption = "Glad to hear that. Keep up the good work.  Now, do you want to continue the next exercise? ";
const notifyOption = ": Okay sure. Please take some rest. Do want to remind the next exercise session this evening?";
const setupMsg = ' Before starting the exercise, please make sure you have sufficient space for the exercise. Please put on the mat on the floor to avoid slipping. Once the setup completed, please tell I am ready. If you need time, please do ask. ';
const exerDescribe = 'Okay. Let\'s start exercise one. Lift your left foot for about six inches from the ground and turn your ankle clockwise.  This exercise will help you gain muscle strength. Exercise is also shown on the screen if your device supports video and images display. Please follow the steps carefully. Feel free to ask questions on the go.';
const ansMsg1 = 'Clockwise is a circular motion from right to left. It resembles the hands of a mechanical clock. Here you should twist the ankle to right side first and then point it downward. After that twist the ankle upwards to left side and move upwards to original position. Follow the screen for a sample.';
const ansMsg2 = 'Just about 6 inches would be ideal. However, if you feel knee pain make sure it is not touching the ground. Do not try to raise the feel in level to your hips.  You can follow the screen for a sample';
const ansMsg3 = 'Gently rotate the ankles one after the other for 3 times clockwise first. And then, repeat the same for the anticlockwise direction three times.';
const setCountAssistMsg = 'Do you need assistance is remembering the sets?';
const needMoreTimeMsg = ' Do you need more time?';
const startCountConfirmMsg = 'Sure. Whenever you complete a round, please tell Alexa raise the count. We start now.';
const stepMsg = " <break time =\"3s\"/> The steps are as follows. ";
const askQuestionsMsg = 'Feel free to ask questions while doing the exercise.';
const repeatStepMsg = ' Repeating the steps now. ';
const tadasana = {
    name: 'tadasana',
    basicMsg: 'Tadasana also known as mountain pose is the basis for other standing asanas. ',
    advMsg: 'The asana helps to improve the body posture ,reduces flat feet , activates nerves of the entire body and also strengthening arms,legs , vertebral column and heart. ',
    avoidMsg: 'Avoid Tadasana when you have headache,low blood pressure,dizziness, joint, back or shoulder concerns. ',
    steps: [
        'Stand straight and take a small gap between your feet.  The heels may be just slightly apart, and your hands must be firmly be placed alongside your body. ',
        'Breathe in and stretch your shoulders, arms, and chest upwards. ',
        'Keep your arms upward by interlocking your fingers. ',
        'Now come on the toes by raising your toes simultaneously. Feel the stretch in your body right from your feet to your head. Hold the pose for a few seconds. ',
        'Now exhale and release , come to original position. ',
    ],
    roundInfo: 'You can perform the number of rounds as per the convienience after having relaxation for a while.',
    answerOneInfo: ' As a beginner, you might find it difficult to balance in tadasana pose. To improve your balance, place your inner feet about three to five inches apart until you get comfortable in the pose.',
    breakTime: [5, 5, 5, 10, 10, 5],
    timerange: [0, 2, 11, 14, 17, 26, 30]
}

const marjaryasana = {
    name: 'marjaryasana',
    basicMsg: 'Marjaryasana  also known as cat pose. Marjaryasana is thought to help with stress relief by soothing the mind.',
    advMsg: ' Marjaryasana, gives firmness,flexibility to spine , strenthness wrists and shoulders also improves blood circulation and digestion. ',
    avoidMsg: ' Avoid Marjaryasana when you have shoulder,wrists,neck,hip knee and back injuries or high blood pressure or Migraine or spondylitis or knee and wrist arthritis. ',
    steps: [
        'First get down to the floor on your hands and knees ',
        ' Keep your spine flat so that it is equal to the floor. ',
        ' Next step is to breathe out, at the same time try to rounding your back Spine towards the roof like an arch.  Next step is to breathe out, at the same time try to rounding your back Spine towards the roof like an arch ',
        'Then breathe in and allow your tummy and spine to come down towards the floor. Push your spine downward as much as possible.Keep your head towards the floor, avoid your chin forcing towards the chest. Remain in the pose for 30 seconds.  ',
        'Return to your initial position ',
    ],
    roundInfo: 'Repeat the process as much as you can',
    answerOneInfo: ' In marjaryasana or cat pose , try to initiate your tailbone movement first, then step up the spine to make your head go down for a while. This will help you discover the curve in various sections of the back. ',
    breakTime: [5, 5, 5, 10, 10, 5],
    timerange: [0, 2, 11, 14, 17, 26, 30]
}

const savasana = {
    name: 'savasana',
    basicMsg: ' Savasana is one of the lying restorative yoga poses.Gives complete rest to the mind, body, brain, and soul. ',
    advMsg: ' Performing this pose after other asanas relieve the tiredness of your body in a very short time. Also best relaxation process for high blood pressure, heart diseases, stress,insomnia, and depression. ',
    avoidMsg: ' There is no such restrictions for this exercise. You can do the exercise if you do not feel any pain. ',
    steps: [
    ],
    roundInfo: 'Repeat the process as much as you can',
    answerOneInfo: '  In case you have any lower back, neck, or shoulder issues, you can modify the yoga asana Savasana by placing a pillow under your belly or knees.',
    breakTime: [5, 5, 5, 10, 10, 5],
    timerange: [0, 2, 11, 14, 17, 26, 30]

}
const exerciseList = [
    'tadasana',
    'marjaryasana',
    'sukhasana',
    'savasana',
    'dwichakrikasan'
]

const exerMap = {
    "easy": 'savasana',
    "medium": 'tadasana',
    "hard": 'marjaryasana'
}



const aplATime = require('./timeContent.json');
const aplAtadasana = require('./tadasanaContent.json');
const aplSavasana = require('./savasanaContent.json');
const aplAMarjyasana = require('./marjyasanaContent.json');

const visualTadasana = require('./tadasanaVisual.json');
const visualSavasana = require('./savasanaVisual.json');
const visualMrajyasana = require('./marjyasanaVisual.json');
const visualCountDownTimer = require('./countDownTimer.json');
const visualIntro = require('./welcomeVisual.json');

let currExe = tadasana;
let curAudioAPL = aplAtadasana;
let curVisualAPL = visualTadasana;

let defaultOptionMsg = ' That is not a valid choice. Please select easy, medium or difficult. What is your choice ?';

let launchChoice = ' Please select exercises based on the difficulty. Available options are,  easy, medium, and difficult. What is your choice?  ';

let langObject = {
    LAUNCH_MESSAGE: `Are you ready to start today's exercise? Say start to begin the exercise. Say Options for the exercise menu. What is your choice?`,
    FIRST_TIME_WELECOME_MESSAGE: " Welcome to Go Senior, your Fitness partner, i am in charge of making you fit and healthy. ",
    DEFAULT_WELCOME_BACK: [" Welcome back to Go Senior, your favourite Fitness partner. ", " Welcome back to Go Senior, your Fitness buddy. ", "Welcome back to Go senior!"],
    THIRD_TIME_WELCOME_MESSAGE: `<say-as interpret-as="interjection">woo hoo</say-as>, you know what they say, third time is a charm. Happy to see you back buddy. `,
    USER_HIATUS_MESSAGE: "Welcome Back to Go senior! It's good to see you again. ",
    GOOD_MORNING: [`<say-as interpret-as="interjection">Good Morning!</say-as>`, "Morning!", "Good morning sunshine! ", "Rise and shine. ", "Very Good Morning!", "What a pleasant morning we have!", "Good morning,  I wish you a day as wonderful as you.", "Happy to see you this morning.", "Good morning, Your smile brightens my morning.", "Top of the morning to you."],
    GOOD_AFTERNOON: [`<say-as interpret-as="interjection">Good Afternoon</say-as>`, "Meditation is a way for nourishing and blossoming the divinity within you. Greetings!", "Hope your day is going well.", `The body benefits from movement, and the mind benefits from stillness. <say-as interpret-as="interjection">Good afternoon</say-as>`],
    GOOD_EVENING: [`<say-as interpret-as="interjection">Good Evening</say-as>`, "May all your worries set with the sun, and may a calm and peaceful night await you. Good Evening!", "Good Evening! I hope you had a good and productive day.", "Yoga is the artwork of awareness on the canvas of body, mind, and soul. Good Evening!", "it's wonderful to see you."],
}
function getDirective(content) {
    return {
        "type": "Alexa.Presentation.APLA.RenderDocument",
        "token": "token-1",
        "document": content
    }
}


const getVisualDirective = (visualContent) => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: 'mytoken',
        document: visualContent
    }
};


/* ------------Additional code --------------------
 */

function greetHelp(value) {
    return value[Math.floor(Math.random() * value.length)];
}

const getGreetings = async (handlerInput) => {
    const serviceClientFactory = handlerInput.serviceClientFactory;
    const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let greetings = "Hi. ";
    let userTimeZone;
    try {
        const upsServiceClient = serviceClientFactory.getUpsServiceClient();
        userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
    } catch (error) {
        console.error('cannot retrieve users timezone.', error.message);
        return greetings;
    }

    let requestDate = new Date(handlerInput.requestEnvelope.request.timestamp);
    let hour = parseInt(requestDate.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: userTimeZone }));
    console.log("The current hour in the user's timezone: " + hour);

    if (hour < 12 && hour >= 3) {
        greetings = greetHelp(langObject.GOOD_MORNING);
    } else if (hour <= 15 && hour >= 12) {
        greetings = greetHelp(langObject.GOOD_AFTERNOON);
    }
    else {
        greetings = greetHelp(langObject.GOOD_EVENING);
    }

    return greetings;
}

function getCountBasedMsg(counter){
    let respMsg = greetHelp(langObject.DEFAULT_WELCOME_BACK);
    if(counter == 0){
        respMsg = langObject.FIRST_TIME_WELECOME_MESSAGE;
    }
    else if (counter == 2){
        respMsg = langObject.THIRD_TIME_WELCOME_MESSAGE;
    }
    return respMsg;
}
/*async function getIntroSpeech(handlerInput, lastSeen, count) {
    count = checkValue(count, 0);
    const greetingTxt = await getGreetings(handlerInput)
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let welcomeTxt = langObject.DEFAULT_WELCOME_BACK;
    if (!count) {
        welcomeTxt = langObject.FIRST_TIME_WELECOME_MESSAGE;
        return `${greetingTxt} ${welcomeTxt}`;
    }

    if (lastSeen) {
        const lastSeenDate = moment(lastSeen);
        const today = moment();
        if (today.diff(lastSeenDate, 'days') >= 7) {
            welcomeTxt = langObject.USER_HIATUS_MESSAGE;
            return `${greetingTxt} ${welcomeTxt}`;
        }
    }


    if ((count + 1) === 3) {
        welcomeTxt = langObject.THIRD_TIME_WELCOME_MESSAGE;
        return `${greetingTxt} ${welcomeTxt}`;
    }
    return `${greetingTxt} ${welcomeTxt}`;
}

function getPersistenceAdapter(tableName) {
    return new ddbAdapter.DynamoDbPersistenceAdapter({
        tableName: tableName
    });
}

 * -----------------End of additional code------------------------
 */

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        // Counter part
        const attributesManager = handlerInput.attributesManager;
        const attributes = await attributesManager.getPersistentAttributes() || {};      
        let counter = attributes.hasOwnProperty('counter') ? attributes.counter : 0;
        attributes.counter=counter+1;
        attributesManager.setPersistentAttributes(attributes);
        // Counter part end
        let speakOutput = 'Hi, Welcome to Go Senior';
        attributesManager.savePersistentAttributes();
        speakOutput = await getGreetings(handlerInput)  
        speakOutput += await getCountBasedMsg(counter);
        speakOutput += launchChoice;
        sessionAttributes.state = 'launch';

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = getVisualDirective(visualIntro);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        
    }
};

/* -----------Focus start ------------*/
const LevelChoiceIntentHandler = {
    canHandle(handlerInput) {
        return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChooseLevel')
            || ((Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent')
            );
    },
    handle(handlerInput) {
        // Fetching button by id
        let level = "easy";
        if ((Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent')) level = handlerInput.requestEnvelope.request.source.id;
        else level = Alexa.getSlotValue(handlerInput.requestEnvelope, 'exeLevel');

        if (level == "easy") {
            currExe = savasana;
            curAudioAPL = aplSavasana;
            curVisualAPL = visualSavasana;
        }
        else if (level == "medium") {
            currExe = tadasana;
            curAudioAPL = aplAtadasana;
            curVisualAPL = visualTadasana;
        }
        else {
            currExe = marjaryasana;
            curAudioAPL = aplAMarjyasana;
            curVisualAPL = visualMrajyasana;
        }
        let speakOutput = 'Ok. Setting exercise level to ' + level + ". ";
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.level = level;
        speakOutput += " Let's start with the exercise " + currExe.name + ". " + currExe.basicMsg + currExe.advMsg + currExe.avoidMsg + stepMsg;
        sessionAttributes.state = 'exerciseStart';
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = getVisualDirective(curVisualAPL);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What is your choice?')
            .addDirective(getDirective(curAudioAPL))
            .getResponse();
    }
};

/* -----------Focus end ------------*/
const AdvantageIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AdvantageIntent';
    },
    handle(handlerInput) {
        let speakOutput = currExe.advMsg;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (sessionAttributes.state == 'exerciseStart') {
            speakOutput += repeatStepMsg;
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const aplDirective = getVisualDirective(curVisualAPL);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('What is your choice?')
                .addDirective(getDirective(curAudioAPL))
                .getResponse();

        }
        else {
            speakOutput = defaultOptionMsg;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('What is your choice?')
                .getResponse();
        }
    }
};

const AvoidIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AvoidIntent';
    },
    handle(handlerInput) {
        let speakOutput = currExe.avoidMsg;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (sessionAttributes.state == 'exerciseStart') {
            speakOutput += repeatStepMsg;
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const aplDirective = getVisualDirective(curVisualAPL);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('What is your choice?')
                .addDirective(getDirective(curAudioAPL))
                .getResponse();
        }
        else {
            speakOutput = defaultOptionMsg;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('What is your choice?')
                .getResponse();
        }
    }
};

const DescribeNameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DescribeNameIntent';
    },
    handle(handlerInput) {
        let speakOutput = currExe.basicMsg;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (sessionAttributes.state == 'exerciseStart') {
            speakOutput += repeatStepMsg;
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                const aplDirective = getVisualDirective(curVisualAPL);
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('What is your choice?')
                .addDirective(getDirective(curAudioAPL))
                .getResponse();

        }
        else {
            speakOutput = defaultOptionMsg;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('What is your choice?')
                .getResponse();
        }

    }
};


const WaitIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WaitIntent';
    },
    handle(handlerInput) {
        let speakOutput = 'Sure. I will wait for some time.';

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = getVisualDirective(visualCountDownTimer);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What is your choice?')
            .addDirective(getDirective(aplATime))
            .getResponse();
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent';
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = repeatStepMsg;

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = getVisualDirective(curVisualAPL);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What is your choice?')
            .addDirective(getDirective(curAudioAPL))
            .getResponse();
    }
};


const BalanceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BalanceIntent';
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = tadasana.answerOneInfo + repeatStepMsg;
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = getVisualDirective(curVisualAPL);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What is your choice?')
            .addDirective(getDirective(curAudioAPL))
            .getResponse();
    }
};

const PainIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PainIntent';
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = savasana.answerOneInfo + repeatStepMsg;
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = getVisualDirective(curVisualAPL);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What is your choice?')
            .addDirective(getDirective(curAudioAPL))
            .getResponse();
    }
};


const SpineIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SpineIntent';
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = marjaryasana.answerOneInfo + repeatStepMsg;
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = getVisualDirective(curVisualAPL);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What is your choice?')
            .addDirective(getDirective(curAudioAPL))
            .getResponse();
    }
};
// ----------Not used from here -------------

const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
    },
    handle(handlerInput) {
        let speakOutput = ' okay. I can help with that. Say help to continue';
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let state = sessionAttributes.state;
        if (sessionAttributes.startMenu) {
            sessionAttributes.startMenu = false;
            speakOutput = setupMsg + clockSound + '.' + needMoreTimeMsg;

        }
        else if (state === "rememberCount") {
            sessionAttributes.countEnabled = true;
            sessionAttributes.round = 0;
            sessionAttributes.maxCount = 3;
            sessionAttributes.isRunningExercise = true;
            sessionAttributes.state = "exercisePlay";
            speakOutput = startCountConfirmMsg + clockSound
        }
        else if (state === "overrideCount") {
            sessionAttributes.round = sessionAttributes.overrideCount;
            sessionAttributes.overrideCount = undefined;
        }
        else if (sessionAttributes.whatTime) {
            sessionAttributes.whatTime = false;
            speakOutput = "At what time?";
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What is your choice?')
            .getResponse();
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent'
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = 'ok. good';
        if (sessionAttributes.exerciseComplete) {
            speakOutput = nextOption;
            sessionAttributes.shouldRemind = true;
            sessionAttributes.exerciseComplete = false;
        }
        else if (sessionAttributes.shouldRemind) {
            speakOutput = notifyOption;
            sessionAttributes.whatTime = true;
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Do you have any questions?')
            .getResponse();

    }
}

const TimeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TimeIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sure. I will remind you of the next exercise session at 5 pm today. See in the session. Way to go senior. Bye!!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


// This is old one
/* const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RepeatIntent';
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        /* let curDate = new Date(handlerInput.requestEnvelope.request.timeStamp);
        let refDate =new Date(sessionAttributes.refDate);
        let diffSecs = (curDate-refDate)/1000;
        let i=0;
        let latency = 3;
        diffSecs-=latency;

        while(diffSecs<(currExe.breakTime[i]+timerange[i])){
            i++;
        }
        const speakOutput = currExe.steps[i];     
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse(); 
        let speakOutput = repeatStepMsg;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Did you complete the exercise?')
            .addDirective(getDirective(aplAtadasana))
            .getResponse();
    }
}; */

const ReadyIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadyIntent';
    },
    handle(handlerInput) {
        /*const speakOutput = exerDescribe + clockSound;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.state = "rememberCount";
        sessionAttributes.countEnabled = false;
        sessionAttributes.round = undefined;
        sessionAttributes.maxCount=undefined;
        sessionAttributes.isRunningExercise= false; */
        /*let stepCount = 0;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.refDate = handlerInput.requestEnvelope.request.timeStamp;
        let speakOutput = "<amazon:domain name=\"long-form\">Ok. Let's start " + currExe.name + ". " ;
        while(stepCount< currExe.steps.length) {
            speakOutput += currExe.steps[stepCount];
            if(currExe.breakTime[stepCount]) speakOutput +=  "<break time=\"" + currExe.breakTime[stepCount] + "s\"/>";
            stepCount+=1;
        }
        speakOutput += currExe.roundInfo; + "<break time =\"10s\"/>";
        speakOutput +=" </amazon:domain>";
        speakOutput += askQuestionsMsg; */
        speakOutput = "tadasana message from APLA";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Do you have any questions?')
            .getResponse();
    }
};

const ClockwiseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClockwiseIntent';
    },
    handle(handlerInput) {
        const speakOutput = ansMsg1;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Do you have any questions?')
            .getResponse();
    }
};

const LiftFootIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LiftFootIntent';
    },
    handle(handlerInput) {
        const speakOutput = ansMsg2 + clockSound;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Do you have any questions?')
            .getResponse();
    }
};

const AskSetInfoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskSetInfoIntent';
    },
    handle(handlerInput) {
        const speakOutput = ansMsg3 + setCountAssistMsg;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Do you have any questions?')
            .getResponse();
    }
};

const RoundCountIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RoundCountIntent';
    },
    handle(handlerInput) {
        let speakOutput = 'Good. Move to next round' + clockSound;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let state = sessionAttributes.state;
        if (sessionAttributes.isRunningExercise) {
            sessionAttributes.round = sessionAttributes.round + 1;
            if (sessionAttributes.round == sessionAttributes.maxCount) {
                sessionAttributes.state = "exerciseDone";
                sessionAttributes.countEnabled = false;
                speakOutput = 'Well done. You have completed this exercise. <audio src="soundbank://soundlibrary/human/amzn_sfx_crowd_applause_01"/>'
                speakOutput += postExerciseComplete;
                sessionAttributes.exerciseComplete = true;
            }

        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Do you have any questions?')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Okay. I can help you here. If you need help is choosing the levels, please say easy or medium or difficult. While doing the exercise, you can ask the skill to repeat the exercise or wait for sometime. If you want to close the skill say stop. Now, what is your choice?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const OptionsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OptionsIntent';
    },
    handle(handlerInput) {
        const speakOutput = ' Please select exercises based on the difficulty. Available levels are easy, medium and difficult. What is your choice?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('which level do you select')
            .getResponse();
    }
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thank you for using go senior. Stay healthy, stay fit. See you soon! ';
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes = {};
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        OptionsIntentHandler,
        AvoidIntentHandler,
        AdvantageIntentHandler,
        DescribeNameIntentHandler,
        BalanceIntentHandler,
        PainIntentHandler,
        SpineIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        WaitIntentHandler,
        ReadyIntentHandler,
        RepeatIntentHandler,
        ClockwiseIntentHandler,
        LevelChoiceIntentHandler,
        LiftFootIntentHandler,
        AskSetInfoIntentHandler,
        RoundCountIntentHandler,
        TimeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
            createTable:false,
            dynamoDBClient: new AWS.DynamoDB({ apiVersion: 'latest', region: process.env.DYNAMODB_PERSISTENCE_REGION})
        })
    )
    .withCustomUserAgent('sample/hello-world/v1.2')
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();