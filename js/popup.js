// document.addEventListener('DOMContentLoaded', function(tab) {
//     console.log("Click!");
//     document.getElementById("muteButton").innerHTML  = "mute";
//     console.log(chrome.extension.getBackgroundPage().getT());
// });
  // var viewTabUrl = chrome.extension.getURL('../popup.html');

  // console.log("muteStatus is: " + muteStatus);
  // //var viewTabUrl = chrome.extension.getURL('image.html');
  // // var imageUrl = /* an image's URL */;

  // // // Look through all the pages in this extension to find one we can use.
  // var views = chrome.extension.getViews();
  // for (var i = 0; i < views.length; i++) {
  //   var current = "view #" + i + "id is: " + views[i].id + "....and type is: " + views[i].type + ".....total of " + views[i].tabs.length + " tabs.";
  //   console.log(current);
  //   viewTabUrl.getElementById("muteButton").innerHTML  = current;
  // //   // If this view has the right URL and hasn't been used yet...
  // //   if (view.location.href == viewTabUrl && !view.imageAlreadySet) {

  // //     // ...call one of its functions and set a property.
  // //     view.setImageUrl(imageUrl);
  // //     view.imageAlreadySet = true;
  // //     break; // we're done
  //   }
//   }
// )



function changeMuteStatusForAll() {
  chrome.windows.getCurrent(function(window){
    var newMuteStatus = chrome.extension.getBackgroundPage().updateWindowMute(window.id);
    if(newMuteStatus){
      document.getElementById("muteButton").innerHTML  = "Unmute Window";
    } else{
      document.getElementById("muteButton").innerHTML  = "Mute Window";
    }
  });
}

document.addEventListener('DOMContentLoaded', function(tab) {
  console.log(chrome.extension.getBackgroundPage().getT());
  var muteWinButton = document.getElementById("muteButton");
  if(chrome.extension.getBackgroundPage().getMuteStatusByWindow(tab.windowId)){
    muteWinButton.innerHTML = "Unmute Window";
  }
  else{
    muteWinButton.innerHTML = "Mute Window";
  }

  muteWinButton.addEventListener('click', changeMuteStatusForAll);
});