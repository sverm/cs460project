function openPopup(info,tab) {
  chrome.tabs.create({url:'popup.html'});
}

chrome.contextMenus.create({
  title: 'Encrypt/Decrypt', 
  contexts:['selection'], 
  onclick: openPopup
});
