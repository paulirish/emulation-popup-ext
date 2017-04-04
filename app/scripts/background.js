'use strict';

/* global chrome */
/* eslint-disable no-console */

var tabId;
var popUrl = "https://drive.google.com/corp/drive/u/0/mobile/search";

var chromeRegex = new RegExp('(?:^|\\W)Chrome/(\\S+)');
var chromeMatch = navigator.userAgent.match(chromeRegex);
const mobileUA = `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeMatch[1]} Mobile Safari/537.36`;

console.log({ mobileUA })

const height = 200;
const width = 400;

// https://drive.google.com/corp/drive/u/0/mobile/search

// the good stuff.
function turnItOn(tabId){

    // good god this sucks without promises.

    // UA.
    chrome.debugger.sendCommand({
        tabId: tabId
    }, "Network.setUserAgentOverride",{
        userAgent : mobileUA
    }, function() {

        console.log('useragent in place!', arguments);


        setTimeout(_ => {
            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Page.navigate",{
                url : popUrl
            }, function() {
                console.log('navigated!', arguments);
                chrome.debugger.detach({tabId: tabId});
            });
         }, 50);

    });

}


function launchPopup(tab){
    chrome.windows.create({
        "height" :  height,
        "width" :   width,
        // "top" : 100,
        // "left" : 100,
        "type" : "popup",
        "url" : 'about:blank'}
    , function(windows){

        var newTabId = windows.tabs[0].id;
        setTimeout(_ => attachDebugger(newTabId), 20);
    });

}

// this sets up the debugger. attached to all the things.
function attachDebugger(tabId) {

    var protocolVersion = '1.1';
    chrome.debugger.attach({
        tabId: tabId
    }, protocolVersion, function() {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            return;
        }
        // 2. Debugger attached, now prepare for modifying the UA
        turnItOn(tabId);

    });

}

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

//chrome.browserAction.setBadgeText({text: 'mobile'});

chrome.browserAction.onClicked.addListener(launchPopup);


console.log('\'Allo \'Allo! Event Page for Browser Action');
