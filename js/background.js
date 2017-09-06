var windowMuteStatus = {};
var mutedDomain = {};
const defaultMuteStatus = false;

function getT(){
  return "hi";
}

// Checks if the window ID is listed, if so - returns the mute status: true or false
// If not listed - returns NULL
function getWindowMuteStatus(windowId){
  return windowMuteStatus.windowId;
}

// Adds a new window ID with the default mute status
function listNewWindow(windowId){
  if(windowMuteStatus.windowId == null){
    windowMuteStatus.windowId = defaultMuteStatus;
  }
}

function removeWindow(winId){
  delete windowMuteStatus.winId;
  console.log("after deletion: " + windowMuteStatus.winId)
}

// Changes a window's mute status
function changeWindowMuteStatusByWinId(windowId){
  windowMuteStatus.windowId = !windowMuteStatus.windowId;
}

// Updates the tab's mute status if necessary
function setTabMuteStatus(tab, muteStatus){
  if(tab.mutedInfo.muted != muteStatus){
    chrome.tabs.update(tab.id, {muted: muteStatus});
  }
}

// Returns the mute status needed by window
function getMuteStatusByWindow(winId){
  var muteStatus = getWindowMuteStatus(winId);
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

// Sets the mute status for the tab by its domain if listed and returns true.
// If not listed, returns false.
function handleMuteByDomain(tab){
  return false;
}

function handleTabMute(tab){
  if(handleMuteByDomain(tab)){
    return;
  }
  handleMuteByWindow(tab);
}

function handleUpdateTabMute(tabId, changedInfo, tab){
  if(changedInfo.url != null){
    handleTabMute(tab);
  }
}

function changeTabsMuteStatusByWinId(winId){
  console.log("changeTabsMuteStatusByWinId " + winId);
  chrome.tabs.query({currentWindow: true}, function(tabs){
    var newStatus = !getMuteStatusByWindow(winId);
    var tabsCount = tabs.length;
    console.log("tabsCount " + tabsCount + " newStatus " + newStatus);
    for(var i = 0; i < tabsCount; i++){
      setTabMuteStatus(tabs[i], newStatus);
    }
  });
}

// Changes and updates the window's tabs mute
// Returns the new mute status
function updateWindowMute(winId){
  console.log("updateWindowMute(" + winId + ")");
  changeTabsMuteStatusByWinId(winId);
  changeWindowMuteStatusByWinId(winId);
  return getMuteStatusByWindow(winId);
}

function handleWindowClosed(winId){
  console.log("deleting!");
  removeWindow(winId);
}

chrome.tabs.onCreated.addListener(handleTabMute);
chrome.tabs.onUpdated.addListener(handleUpdateTabMute);
chrome.windows.onRemoved.addListener(handleWindowClosed);

// exports.updateWindowMute = updateWindowMute;
// exports.getMuteStatusByWindow = getMuteStatusByWindow;
// function updateMuteStatusForTab(tab){
//   chrome.tabs.update(tab.id, {muted: muteStatus});
// }

// function changeMuteStatusForAll() {
//   getCurrentTabId(function(tabs) {
//     muteStatus = !muteStatus;
//     for(var i = 0; i < tabs.length; i++){
//       updateMuteStatusForTab(tabs[i]);
//     }

//     if(muteStatus){
//       document.getElementById("muteButton").innerHTML  = "Unmute Window";
//     } else{
//       document.getElementById("muteButton").innerHTML  = "Mute Window";
//     }
//   });
// };


// document.addEventListener('DOMContentLoaded', function () {
// window.onload = function () {
//   console.log("new window");
//   document.getElementById("muteButton").innerHTML  = "Mute Window";
//   document.getElementById("muteButton").addEventListener('click', changeMuteStatusForAll);
//   chrome.tabs.onCreated.addListener(updateMuteStatusForTab(tab));
// };

// chrome.browserAction.onClicked.addListener(function(tab) {
//   var viewTabUrl = chrome.extension.getURL('../popup.html');

//   console.log("muteStatus is: " + muteStatus);
//   //var viewTabUrl = chrome.extension.getURL('image.html');
//   // var imageUrl = /* an image's URL */;

//   // // Look through all the pages in this extension to find one we can use.
//   var views = chrome.extension.getViews();
//   for (var i = 0; i < views.length; i++) {
//     var current = "view #" + i + "id is: " + views[i].id + "....and type is: " + views[i].type + ".....total of " + views[i].tabs.length + " tabs.";
//     console.log(current);
//     viewTabUrl.getElementById("muteButton").innerHTML  = current;
//   //   // If this view has the right URL and hasn't been used yet...
//   //   if (view.location.href == viewTabUrl && !view.imageAlreadySet) {

//   //     // ...call one of its functions and set a property.
//   //     view.setImageUrl(imageUrl);
//   //     view.imageAlreadySet = true;
//   //     break; // we're done
//     }
//   }
// )