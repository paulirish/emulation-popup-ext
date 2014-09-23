'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'sup'});

chrome.browserAction.onClicked.addListener(function (tab) {

    var tabId = tab.id;

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
        }, "Page.enable", {}, function(response) {
            // Possible response: response.id / response.error
            // 3. do stuff

            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Page.setDeviceMetricsOverride",{
                width: 300,
                height: 300,
                deviceScaleFactor: 2,
                mobile: true,
                fitWindow: false
            }, function(response) {
                 console.log('metrics!', arguments);
                // chrome.debugger.detach({tabId: tabId});
            });


            chrome.debugger.sendCommand({
                tabId: tabId
            }, "Page.reload",{
                ignoreCache : true
            }, function(response) {
                 console.log('reloaded!', arguments);
                // chrome.debugger.detach({tabId: tabId});
            });




        });
    });


});


console.log('\'Allo \'Allo! Event Page for Browser Action');
