var windowMuteStatus = {};
var mutedDomain = {};
const defaultMuteStatus = false;
var doNotHandleTabs = {}; // 0 = don't update. 1 = update by domain

function getT(){
  return "hi";
}

function getMuteStatusByDomain(tabId){
  return false;
}

// Checks if the window ID is listed, if so - returns the mute status: true or false
// If not listed - returns NULL
function getWindowMuteStatus(windowId){
  return windowMuteStatus[windowId];
}

// Adds a new window ID with the default mute status
function listNewWindow(windowId){
  console.log("listNewWindow. status before: " + windowMuteStatus[windowId]);
  if(windowMuteStatus[windowId] == null){
    windowMuteStatus[windowId] = defaultMuteStatus;
  }
  console.log("listNewWindow. status after: " + windowMuteStatus[windowId]);
}

function removeWindow(winId){
  delete windowMuteStatus.winId;
  console.log("after deletion: " + windowMuteStatus.winId)
}

// Changes a window's mute status
function changeWindowMuteStatusByWinId(windowId){
  windowMuteStatus[windowId] = (!windowMuteStatus[windowId]);
}

// Updates the tab's mute status if necessary
function setTabMuteStatus(tab, muteStatus){
  var time = new Date().getTime();
  console.log(time + " UPDATED TAB .. Muted? -" + tab.mutedInfo.muted + "- .. Reason? -" + tab.mutedInfo.reason + "-");
  if(tab.mutedInfo.muted != muteStatus){
    chrome.tabs.update(tab.id, {muted: muteStatus});
  }
}

// Returns the mute status needed by window
function getMuteStatusByWindow(winId){
  console.log("getMuteStatusByWindow");
  var muteStatus = getWindowMuteStatus(winId);
  console.log("mute status: " + muteStatus);
  if(muteStatus == null){
    listNewWindow(winId);
    muteStatus = defaultMuteStatus;
  }
  return muteStatus;
}

// Sets the mute status for the tab by its window's mute status
function handleMuteByWindow(tab){
  var muteStatus = getMuteStatusByWindow(tab.windowId);
  setTabMuteStatus(tab, muteStatus);
}

function getDomainFromUrl(url){
  var domain;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];
    //find & remove "?"
    domain = domain.split('?')[0];

    // var splitArr = domain.split('.');
    // var arrLen = splitArr.length;

    // //extracting the root domain here
    // if (arrLen > 2) {
    //     domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    // }
    console.log("URL    : " + url);
    console.log("DOMAIN : " + domain);
    return domain;
}

// Sets the mute status for the tab by its domain if listed and returns true.
// If not listed, returns false.
function handleMuteByDomain(tab){
  getDomainFromUrl(tab.url);
  return false;
}

function handleTabMute(tab){
  tabId = tab.id;
  if(doNotHandleTabs[tabId] == 0){
    return;
  }
  if(doNotHandleTabs[tabId] == 1){
    handleMuteByDomain(tab);
    return;
  }

  if(handleMuteByDomain(tab)){
    return;
  }
  handleMuteByWindow(tab);
}

function handleUserTabMuteUpdate(changedInfo, tab){
  if((changedInfo.mutedInfo != null && changedInfo.mutedInfo.muted == true) /*|| isUrlInDomainList() == false*/){ //TBD
    // Add this tab id to the list of - Do not update mute unless it's done from window button mute/unmute
    doNotHandleTabs[tabId] = 0;
  }
  else{ // User unmuted normal domain
    // Add this tab id to the list of - Update only by domain, unless it's done from window button mute/unmute
    doNotHandleTabs[tabId] = 1;
  }
}

function handleUpdateTab(tabId, changedInfo, tab){
  if(changedInfo.mutedInfo != null && changedInfo.mutedInfo.reason == "user"){
    handleUserTabMuteUpdate(changedInfo, tab);
  }
  else if(changedInfo.url != null){
    handleTabMute(tab);
  }
}

// Changes and updates the window's tabs mute
function updateWindowMute(winId){
  console.log("updateWindowMute(" + winId + ")");
  chrome.tabs.query({windowId: winId}, function(tabs){
    var newStatus = !getMuteStatusByWindow(winId);
    var tabsCount = tabs.length;
    console.log("tabsCount " + tabsCount + " newStatus " + newStatus);
    for(var i = 0; i < tabsCount; i++){
      setTabMuteStatus(tabs[i], newStatus);
    }
    changeWindowMuteStatusByWinId(winId);
  });
  // TBD remove tabs from tabs list
}

function handleWindowClosed(winId){
  console.log("deleting!");
  removeWindow(winId);
}

chrome.tabs.onCreated.addListener(handleTabMute);
chrome.tabs.onUpdated.addListener(handleUpdateTab);
chrome.windows.onRemoved.addListener(handleWindowClosed); // TBD empty all lists of this window