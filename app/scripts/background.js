'use strict';

/* global chrome */
/* eslint-disable no-console */

const driveSearchURL = 'https://drive.google.com/corp/drive/u/0/mobile/search';

const chromeRegex = new RegExp('(?:^|\\W)Chrome/(\\S+)');
const chromeMatch = navigator.userAgent.match(chromeRegex);
const userAgent = `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMatch[1]} Mobile Safari/537.36`;

const height = 315;
const width = 475;

let enabled = false;

function handler(details) {
  if (!enabled) return;

  details.requestHeaders.find(header => header.name === 'User-Agent').value = userAgent;
  enabled = false;

  return {
    requestHeaders: details.requestHeaders
  };
}

chrome.webRequest.onBeforeSendHeaders.addListener(handler, {
  urls: [driveSearchURL]
}, ["blocking", "requestHeaders"]);


function launchPopup() {
  enabled = true;

  chrome.windows.create({
    height: height,
    width: width,
    type: 'popup',
    url: driveSearchURL
  }, function(windows) {
        // window started, but navigation not yet started
  });
}

chrome.runtime.onInstalled.addListener(function(details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'drive'});
chrome.browserAction.onClicked.addListener(launchPopup);
