var Messages = require('./constants').Messages;

var androidBridgeNameBase = 'mParticleAndroid';
var iosBridgeNameBase = 'mParticle';

function isBridgeV2Available(bridgeName) {
    if (!bridgeName) {
        return false;
    }
    var androidBridgeName = androidBridgeNameBase + '_' + bridgeName + '_v2';
    var iosBridgeName = iosBridgeNameBase + '_' + bridgeName + '_v2';

    // iOS v2 bridge
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.hasOwnProperty(iosBridgeName)) {
        return true;
    }
    // other iOS v2 bridge
    if (window.mParticle.uiwebviewBridgeName === iosBridgeName) {
        return true;
    }
    // android
    if (window.hasOwnProperty(androidBridgeName)) {
        return true;
    }
    return false;
}

function isWebviewEnabled(requiredWebviewBridgeName, minWebviewBridgeVersion) {
    mParticle.Store.bridgeV2Available = isBridgeV2Available(requiredWebviewBridgeName);
    mParticle.Store.bridgeV1Available = isBridgeV1Available();

    if (minWebviewBridgeVersion === 2) {
        return mParticle.Store.bridgeV2Available;
    }

    // iOS BridgeV1 can be available via mParticle.isIOS, but return false if uiwebviewBridgeName doesn't match requiredWebviewBridgeName
    if (window.mParticle.uiwebviewBridgeName && window.mParticle.uiwebviewBridgeName !== (iosBridgeNameBase + '_' + requiredWebviewBridgeName + '_v2')) {
        return false;
    }

    if (minWebviewBridgeVersion < 2) {
        // ios
        return mParticle.Store.bridgeV2Available || mParticle.Store.bridgeV1Available;
    }

    return false;
}

function isBridgeV1Available() {
    if (mParticle.Store.SDKConfig.useNativeSdk || window.mParticleAndroid
        || mParticle.Store.SDKConfig.isIOS) {
        return true;
    }

    return false;
}

function sendToNative(path, value) {
    if (mParticle.Store.bridgeV2Available && mParticle.Store.SDKConfig.minWebviewBridgeVersion === 2) {
        sendViaBridgeV2(path, value, mParticle.Store.SDKConfig.requiredWebviewBridgeName);
        return;
    }
    if (mParticle.Store.bridgeV2Available && mParticle.Store.SDKConfig.minWebviewBridgeVersion < 2) {
        sendViaBridgeV2(path, value, mParticle.Store.SDKConfig.requiredWebviewBridgeName);
        return;
    }
    if (mParticle.Store.bridgeV1Available && mParticle.Store.SDKConfig.minWebviewBridgeVersion < 2) {
        sendViaBridgeV1(path, value);
        return;
    }
}

function sendViaBridgeV1(path, value) {
    if (window.mParticleAndroid && window.mParticleAndroid.hasOwnProperty(path)) {
        mParticle.Logger.verbose(Messages.InformationMessages.SendAndroid + path);
        window.mParticleAndroid[path](value);
    }
    else if (mParticle.Store.SDKConfig.isIOS) {
        mParticle.Logger.verbose(Messages.InformationMessages.SendIOS + path);
        sendViaIframeToIOS(path, value);
    }
}

function sendViaIframeToIOS(path, value) {
    var iframe = document.createElement('IFRAME');
    iframe.setAttribute('src', 'mp-sdk://' + path + '/' + encodeURIComponent(value));
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}

function sendViaBridgeV2(path, value, requiredWebviewBridgeName) {
    if (!requiredWebviewBridgeName) {
        return;
    }

    var androidBridgeName = androidBridgeNameBase + '_' + requiredWebviewBridgeName + '_v2',
        androidBridge = window[androidBridgeName],
        iosBridgeName = iosBridgeNameBase + '_' + requiredWebviewBridgeName + '_v2',
        iOSBridgeMessageHandler,
        iOSBridgeNonMessageHandler;

    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers[iosBridgeName]) {
        iOSBridgeMessageHandler = window.webkit.messageHandlers[iosBridgeName];
    }

    if (window.mParticle.uiwebviewBridgeName === iosBridgeName) {
        iOSBridgeNonMessageHandler = window.mParticle[iosBridgeName];
    }

    if (androidBridge && androidBridge.hasOwnProperty(path)) {
        mParticle.Logger.verbose(Messages.InformationMessages.SendAndroid + path);
        androidBridge[path](value);
        return;
    } else if (iOSBridgeMessageHandler) {
        mParticle.Logger.verbose(Messages.InformationMessages.SendIOS + path);
        iOSBridgeMessageHandler.postMessage(JSON.stringify({path:path, value: value ? JSON.parse(value) : null}));
    } else if (iOSBridgeNonMessageHandler) {
        mParticle.Logger.verbose(Messages.InformationMessages.SendIOS + path);
        sendViaIframeToIOS(path, value);
    }
}

module.exports = {
    isWebviewEnabled: isWebviewEnabled,
    isBridgeV2Available:isBridgeV2Available,
    sendToNative: sendToNative,
    sendViaBridgeV1: sendViaBridgeV1,
    sendViaBridgeV2: sendViaBridgeV2
};
