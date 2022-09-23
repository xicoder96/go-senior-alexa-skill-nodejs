// @ts-check
const Alexa = require('ask-sdk-core');
const _ = require('lodash');


class MasterTemplate {
    getPayloadProperties() { }
    getDocument() { }
}

function isAplSupported(handlerInput) {
    const interfaces = Alexa.getSupportedInterfaces(handlerInput.requestEnvelope);
    const aplInterface = interfaces["Alexa.Presentation.APL"];
    return _.get(aplInterface, 'runtime.maxVersion') >= "1.1";
}

function addAplIfSupported(handlerInput, token, document, data = {}) {
    if (isAplSupported(handlerInput)) {
        handlerInput.responseBuilder
            .addDirective({
                "type": "Alexa.Presentation.APL.RenderDocument",
                "token": token,
                "document": document,
                "datasources": {
                    "data": {
                        "type": "object",
                        "properties": data
                    }
                }
            });
    }
}

function getAplADirective(token, document, data = {}) {
    return {
        "type": "Alexa.Presentation.APLA.RenderDocument",
        "token": token,
        "document": document,
        "datasources": {
            "data": {
                "type": "object",
                "properties": data
            }
        }
    }
}

/**
 * Check a value for validity or return a default.
 * @param value The value being checked
 * @param defaultValue A default value if the passed value is not valid
 * @returns {*} The passed value if valid otherwise the default value.
 */
function checkValue(value, defaultValue) {

    // @ts-ignore
    if (value === undefined || value === {} || value === "") {
        return defaultValue;
    }

    return value;
}


module.exports = {
    MasterTemplate,
    checkValue,
    isAplSupported,
    addAplIfSupported,
    getAplADirective,
}