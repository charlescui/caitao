'use strict';

console.log('Pick Tao!');

function initialize(){
  var tag = $("#input_tag").val();
  var regular = $("#input_regular").val();
  var attr = $("#input_attr").val();

  chrome.tabs.insertCSS(null,{file:"styles/jquery-ui.min.css"});
  chrome.tabs.insertCSS(null,{file:"styles/jqueryui1.8.20-chrome-extension.css"});

  chrome.tabs.executeScript(null,{file:"scripts/jquery-1.11.3.min.js"});
  chrome.tabs.executeScript(null,{file:"scripts/jquery-ui.min.js"});
  chrome.tabs.executeScript(null,{file:"scripts/parse.js"},
    function() {
      // 当前插件的document里面
      // file/code等为被插入页面里面
      var code = "do_parse('"+tag+"','"+attr+"','"+regular+"');";
      console.log("code: "+code);
      chrome.tabs.executeScript(null,{code: code});
    }
  );
  // window.close();
};

// chrome.browserAction.onClicked.addListener(function(tab) {
//   initialize();
// });

// document.addEventListener('DOMContentLoaded', function () {
//   var divs = document.querySelectorAll('div');
//   for (var i = 0; i < divs.length; i++) {
//     divs[i].addEventListener('click', initialize);
//   }
// });

$(function() {
  $( document ).tooltip();
  $( "button" )
    .button({
      icons: {
        primary: "ui-icon-gear",
        secondary: "ui-icon-triangle-1-s"
      }
    })
    .click(function( event ) {
      initialize();
      event.preventDefault();
    });
});
