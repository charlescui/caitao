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

// combobox
(function( $ ) {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },

      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";

        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });

        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },

          autocompletechange: "_removeIfInvalid"
        });
      },

      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;

        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "Show All Items" )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();

            // 如果已经可见则关闭
            if ( wasOpen ) {
              return;
            }

            // 传递空字符串作为搜索的值，显示所有的结果
            input.autocomplete( "search", "" );
          });
      },

      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },

      _removeIfInvalid: function( event, ui ) {

        // 选择一项，不执行其他动作
        if ( ui.item ) {
          return;
        }

        // 搜索一个匹配（不区分大小写）
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });

        // 找到一个匹配，不执行其他动作
        if ( valid ) {
          return;
        }

        // 移除无效的值
        this.input
          .val( "" )
          .attr( "title", value + " didn't match any item" )
          .tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.data( "ui-autocomplete" ).term = "";
      },

      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
  })( jQuery );

  $(function() {
    $( "#input_tag" ).combobox();
    $( "#input_attr" ).combobox();
    $( "#input_regular" ).combobox();
  });
