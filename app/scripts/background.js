'use strict';

/* global chrome */
/* eslint-disable no-console */

let tabId;
var popUrl = 'https://drive.google.com/corp/drive/u/0/mobile/search';

var chromeRegex = new RegExp('(?:^|\\W)Chrome/(\\S+)');
var chromeMatch = navigator.userAgent.match(chromeRegex);
const userAgent = `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMatch[1]} Mobile Safari/537.36`;

console.log({userAgent});

const height = 200;
const width = 400;

const sendCommand = (command, params) => {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({tabId}, command, params, result => {
      if (chrome.runtime.lastError) {
        // The error from the extension has a `message` property that is the
        // stringified version of the actual protocol error object.
        const message = chrome.runtime.lastError.message;
        let errorMessage;
        try {
          errorMessage = JSON.parse(message).message;
        } catch (e) {}
        errorMessage = errorMessage || 'Unknown debugger protocol error.';
        return reject(new Error(`Protocol error (${command}): ${errorMessage}`));
      }
      resolve(result);
    });
  });
};

// https://drive.google.com/corp/drive/u/0/mobile/search

// the good stuff.
function turnItOn() {
  // good god this sucks without promises.

  // UA.
  return Promise.resolve().then(_ => sendCommand('Network.setUserAgentOverride', {userAgent})).then(_ => {
    console.log('useragent in place!', arguments);

    return sendCommand('Page.navigate', {url: popUrl}).then(_ => {
      console.log('navigated!', arguments);
      chrome.debugger.detach({tabId});
    });
  });
}

function launchPopup(tab) {
  chrome.windows.create(
    {
      height: height,
      width: width,
      // "top" : 100,
      // "left" : 100,
      type: 'popup',
      url: 'about:blank'
    },
    function(windows) {
      tabId = windows.tabs[0].id;
      setTimeout(attachDebugger, 20);
    }
  );
}

// this sets up the debugger. attached to all the things.
function attachDebugger() {
  var protocolVersion = '1.1';
  chrome.debugger.attach({tabId}, protocolVersion, function() {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
      return;
    }
    // 2. Debugger attached, now prepare for modifying the UA
    turnItOn();
  });
}

chrome.runtime.onInstalled.addListener(function(details) {
  console.log('previousVersion', details.previousVersion);
});

//chrome.browserAction.setBadgeText({text: 'mobile'});

chrome.browserAction.onClicked.addListener(launchPopup);

console.log("'Allo 'Allo! Event Page for Browser Action");
