'use strict';

var tabId, popUrl;

// stolen from https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/devtools/front_end/toolbox/OverridesUI.js&q=%22Nexus%204%22&sq=package:chromium&type=cs&l=315
var phonesArray = [
    {title: "Apple iPhone 4", width: 320, height: 480, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_2_1 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5", touch: true, mobile: true},
    {title: "Apple iPhone 5", width: 320, height: 568, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53", touch: true, mobile: true},

    {title: "Google Nexus 4", width: 384, height: 640, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 4 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},
    {title: "Google Nexus 5", width: 360, height: 640, deviceScaleFactor: 3, userAgent: "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19", touch: true, mobile: true},
    {title: "Google Nexus S", width: 320, height: 533, deviceScaleFactor: 1.5, userAgent: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Nexus S Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1", touch: true, mobile: true}
    ];

var phones = {};
phonesArray.forEach(function(phone){
    phones[phone.title.replace(/\s+/gi,'')] = phone;
});
// thus…
// phones.AppleiPhone4
// phones.AppleiPhone5
// phones.GoogleNexus4
// phones.GoogleNexus5
// phones.GoogleNexusS

// usage:
// phones.GoogleNexus4.width , etc.


// the good stuff.
function turnItOn(tabId){

    // good god this sucks without promises.

    // UA.
    chrome.debugger.sendCommand({
        tabId: tabId
    }, "Network.setUserAgentOverride",{
        userAgent : phones.GoogleNexus4.userAgent
    }, function() {
         console.log('useragent in place!', arguments);

        // set up device metrics
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Page.setDeviceMetricsOverride",{
            width:              phones.GoogleNexus4.width,
            height:             phones.GoogleNexus4.height,
            deviceScaleFactor:  phones.GoogleNexus4.deviceScaleFactor,
            mobile:             phones.GoogleNexus4.mobile,
            fitWindow: false,
            emulateViewport: true
        }, function() {
             console.log('metrics!', arguments);

            // reload page
            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Page.navigate",{
                url : popUrl
            }, function() {
                 console.log('navigated!', arguments);
                // chrome.debugger.detach({tabId: tabId});
            });

        });


    });

}


function launchPopup(tab){
    chrome.windows.create({
        "width" :   phones.GoogleNexus4.width,
        "height" :  phones.GoogleNexus4.height,
        // "top" : 100,
        // "left" : 100,
        "type" : "popup",
        "url" : 'about:blank'}
    , function(windows){

        //save the url we want to load in global for use later 
        popUrl = tab.url;

        // attach listener for when the tab in the new window loads.
        var newTabId = windows.tabs[0].id;
        chrome.tabs.onUpdated.addListener( function(updatedTabId, changeInfo, tab) {
            if(updatedTabId===newTabId && changeInfo.status == "complete"){ 
                // use new tabID
                attachDebugger(newTabId);
            }
        } );
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
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Network.enable", {}, function(response) {
            // Possible response: response.id / response.error
            // 3. do stuff

            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Page.enable", {}, function(response) {

                // oh yeah
                turnItOn(tabId);
            });


        });
    });

}

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

//chrome.browserAction.setBadgeText({text: 'mobile'});

chrome.browserAction.onClicked.addListener(launchPopup);


console.log('\'Allo \'Allo! Event Page for Browser Action');
