function getMuteTextByStatus(status){
  if(status == true){
    return "Unmute";
  }
  return "Mute";
}

function setMuteDomainButtonText(domain, muteStatus){
  console.log("setMuteDomainButtonText");
  var button = document.getElementById("muteDomainButton");
  var muteText = getMuteTextByStatus(muteStatus);
  console.log("buttonText before is: " + button.innerHTML + " and mute status is " + muteStatus);
  button.innerHTML = muteText + " Domain " + domain;
  console.log("buttonText after is: " + button.innerHTML);
}

function setMuteWindowButtonText(muteStatus){
  console.log("setMuteWindowButtonText");
  var button = document.getElementById("muteWindowButton");
  var muteText = getMuteTextByStatus(muteStatus);
  console.log("buttonText before is: " + button.innerHTML + " and mute status is " + muteStatus);
  button.innerHTML = muteText + " Window";
  console.log("buttonText after is: " + button.innerHTML);
}

function changeMuteStatusForAll() {
  chrome.windows.getCurrent(function(window){
    chrome.extension.getBackgroundPage().updateWindowMute(window.id);
  });
  window.close();
}

function changeMuteStatusForDomain(){

}

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded");

  // Set window button
  chrome.windows.getCurrent(function(window){
    console.log("window id is: " + window.id);
    var muteStatus = chrome.extension.getBackgroundPage().windowMuteStatus[window.id];
    console.log("mute status of window is: " + muteStatus);
    setMuteWindowButtonText(muteStatus);
  });

  // Set domain button
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs){
    var tab = tabs[0];
    console.log("get current tab is: " + tab);
    var domain = chrome.extension.getBackgroundPage().getDomainFromUrl(tab.url);
    console.log("tab id is: " + tab.id + " and domain is: " + domain);
    var muteStatus = chrome.extension.getBackgroundPage().isUrlDomainMuted(tab.url);
    console.log("mute status of domain is: " + muteStatus);
    setMuteDomainButtonText(domain, muteStatus);
  });

  console.log("and now text: " + document.getElementById("muteWindowButton").innerHTML)
  document.getElementById("muteWindowButton").addEventListener('click', changeMuteStatusForAll);
  document.getElementById("muteDomainButton").addEventListener('click', changeMuteStatusForDomain);
});