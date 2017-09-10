var windowMuteStatus = {};
var mutedDomain = {};
const defaultMuteStatus = false;
var doNotHandleTabs = {}; // 0 = don't update. 1 = update by domain

// Returns the domain from a given url
function getDomainFromUrl(url){
  console.log("METHOD [getDomainFromUrl], url: [" + url + "]");
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
  console.log("RETURN from [getDomainFromUrl]: " + domain);
  return domain;
}

// Mutes and unmutes tab
function muteUnmuteTab(tab, muteStatus){
  console.log("METHOD [muteUnmuteTab], tabId: [" + tab.id + "], muteStatus: [" + muteStatus + "]");
  if(tab.mutedInfo.muted != muteStatus){
    chrome.tabs.update(tab.id, {muted: muteStatus});
  }
}

// Returns window mute status
// If window id is new - adds it with the default mute status
function getWindowMuteStatus(winId){
  console.log("METHOD [getWindowMuteStatus], winId: [" + winId + "]");
  var muteStatus = windowMuteStatus[winId];
  if(muteStatus == null){
    windowMuteStatus[winId] = defaultMuteStatus;
    muteStatus = defaultMuteStatus;
  }
  console.log("RETURN from [getWindowMuteStatus]: " + muteStatus);
  return muteStatus;
}

// Return true if url's domain is listed in the muted domains
function isUrlDomainMuted(url){
  console.log("METHOD [isUrlDomainMuted], url: [" + url + "]");
  var domain = getDomainFromUrl(url);
  if(mutedDomain[domain] == null){
    console.log("RETURN from [isUrlDomainMuted]: false");
    return false;
  }
  console.log("RETURN from [isUrlDomainMuted]: true");
  return true;
}

// Sets the mute status for the tab by its domain if listed and returns true.
// If not listed, returns false.
function handleMuteByDomain(tab){
  console.log("METHOD [handleMuteByDomain], tabId: [" + tab.id + "]");
  if(isUrlDomainMuted(tab.url) == false){
    console.log("RETURN from [handleMuteByDomain]: false");
    return false;
  }
  // Mute this tab
  muteUnmuteTab(tab, true);
  console.log("RETURN from [handleMuteByDomain]: true");
  return true;
}

function handleTabUrlUpdate(tab){
  console.log("METHOD [handleTabUrlUpdate], tabId: [" + tab.id + "]");
  var tabId = tab.id;
  // Do not handle check - user manualy unmuted 'muted domain'
  if(doNotHandleTabs[tabId] == 0){
    return;
  }
  // Handle only ny domain - user manualy unmuted/muted a tab
  if(doNotHandleTabs[tabId] == 1){
    handleMuteByDomain(tab);
    return;
  }
  // No special tab id - handle regular by domain first, or by window
  if(handleMuteByDomain(tab)){
    return;
  }
  var muteStatus = windowMuteStatus[tab.windowId];
  muteUnmuteTab(tab, muteStatus);
}

// Saves the manualy mute or unmuted tab to the doNotHandleTabs list
function handleUserTabMuteUpdate(tab){
  console.log("METHOD [handleUserTabMuteUpdate], tabId: [" + tab.id + "]");
  // User unmuted a muted domain tab
  if(isUrlDomainMuted(tab.url) == true){
    doNotHandleTabs[tab.id] = 0;
  }
  // User unmuted / muted normal domain tab
  else{
    doNotHandleTabs[tab.id] = 1;
  }
}

// Handles tab updated manualy by user
function handleUpdateTab(tabId, changedInfo, tab){
  console.log("METHOD [handleUpdateTab], tabId: [" + tabId + "]");
  if(changedInfo.mutedInfo != null && changedInfo.mutedInfo.reason == "user"){
    handleUserTabMuteUpdate(tab);
  }
  else if(changedInfo.url != null){
    handleTabUrlUpdate(tab);
  }
}

// Changes and updates the window's tabs mute
function updateWindowMute(winId){
  console.log("METHOD [updateWindowMute], winId: [" + winId + "]");
  chrome.tabs.query({windowId: winId}, function(tabs){
    var newStatus = !windowMuteStatus[winId];
    var tabsCount = tabs.length;
    for(var i = 0; i < tabsCount; i++){
      delete doNotHandleTabs[tabs[i].id];
      muteUnmuteTab(tabs[i], newStatus);
    }
    windowMuteStatus[winId] = newStatus;
  });
}

// Changes and updates the tab's domain mute
function updateDomainMute(tab){
  console.log("METHOD [updateDomainMute], tabId: [" + tab.id + "]");
  var domain = getDomainFromUrl(tab.url);
  if(mutedDomain[domain] != null){
    // Unmute domain
    delete mutedDomain[domain];
    muteUnmuteTab(tab, false);
  }
  else{
    // Mute domain
    mutedDomain[domain] = 1;
    muteUnmuteTab(tab, true);
  }
}

function handleWindowClosed(winId){
  console.log("METHOD [handleWindowClosed], winId: [" + winId + "]");
  chrome.tabs.query({windowId: winId}, function(tabs){
    var tabsCount = tabs.length;
    for(var i = 0; i < tabsCount; i++){
      delete doNotHandleTabs[tabs[i].id];
    }
    windowMuteStatus[winId] = newStatus;
  });
  delete windowMuteStatus[winId];
}

chrome.tabs.onCreated.addListener(handleTabUrlUpdate);
chrome.tabs.onUpdated.addListener(handleUpdateTab);
chrome.windows.onRemoved.addListener(handleWindowClosed); // TBD empty all lists of this window