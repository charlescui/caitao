'use strict';

// 设置采淘全局变量
var CT = {};
// 用来判断是否加载过
CT.loaded = false;

console.log('Pick Tao!');
var dbg;
function debug_obj(obj){
  dbg = obj;
  $.each(obj, function(n, v){
    console.log(n, v);
  })
};

function save_configs(tag, attr, regular){
  chrome.storage.sync.get(["tag","attr", 'regular'],function(data){
    console.log("before save: ");
    debug_obj(data)
    var obj = {}
    // 如果入参有效，则保存到存储中，以便下次查询时使用
    if (tag) {
      if (data['tag'] && (data['tag'] instanceof Object)) {
        data['tag'][tag] = true;
        obj["tag"] = data['tag'];
      }else {
        obj["tag"] = {tag : true};
      }
    }
    if (attr) {
      if (data['attr'] && (data['attr'] instanceof Object)) {
        data['attr'][attr] = true;
        obj["attr"] = data['attr'];
      }else {
        obj["attr"] = {attr : true};
      }
    }
    if (regular) {
      if (data['regular'] && (data['regular'] instanceof Object)) {
        data['regular'][regular] = true;
        obj["regular"] = data['regular'];
      }else {
        obj["regular"] = {regular : true};
      }
    }
    chrome.storage.sync.set(obj,function(){
      console.log("保存完毕");
      chrome.storage.sync.get(["tag","attr", 'regular'],function(data){
        console.log("after save: ");
        debug_obj(data)
        // window.close();
      });
    })
  })
};

// 点击确认按钮后开始执行的函数
function initialize(){
  var tag = $(".input_tag input").val();
  var regular = $(".input_regular input").val();
  var attr = $(".input_attr input").val();

  // 如果加载过，则不用再把资源文件载入被操作页面
  if (!CT.loaded) {
    chrome.tabs.insertCSS(null,{file:"styles/jquery-ui.min.css"});
    chrome.tabs.insertCSS(null,{file:"styles/jqueryui1.8.20-chrome-extension.css"});

    chrome.tabs.executeScript(null,{file:"scripts/jquery-1.11.3.min.js"});
    chrome.tabs.executeScript(null,{file:"scripts/jquery-ui.min.js"});
    chrome.tabs.executeScript(null,{file:"scripts/parse.js"},
      function() {
        call_content_script(tag, attr, regular);
      }
    );
    flag_loaded = true;
  }else {
    call_content_script(tag, attr, regular);
  }
  // window.close();
};

// 准备执行嵌入页面内的环境操作
function call_content_script(tag, attr, regular){
  // 当前插件的document里面
  // file/code等为被插入页面里面
  var code = "do_parse('"+tag+"','"+attr+"','"+regular+"');";
  console.log("code: "+code);
  chrome.tabs.executeScript(null,{code: code}, function(){
    save_configs(tag, attr, regular);
  });
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
  // 激活提示符
  $( document ).tooltip();
  // 设置按钮
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
        }
        // ,autocompletechange: "_removeIfInvalid"
      });
    },

    _createShowAllButton: function() {
      var input = this.input,
        wasOpen = false;

      $( "<a>" )
        .attr( "tabIndex", -1 )
        .attr( "title", "显示全部" )
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

// data => storage
// 取值范围：
// tag, attr, regular
// flag => 属性名称
function appendOptions(data, flag){
  var flags = data[flag] || {};
  var keys = Object.keys(flags);

  $(keys).each(function(n, v){
    console.log("appendOptions:"+v);
    $("#input_"+flag).append("<option value='"+v+"'>"+v+"</option>");
  });

  $( "#input_"+flag ).combobox().addClass("combobox_input_"+flag);
}

$(function() {
  // $("#input_tag option").remove();
  // $("#input_attr option").remove();
  // $("#input_regular option").remove();

  chrome.storage.sync.get(["tag","attr", 'regular'],function(data){
    var tags = data["tag"] || {};
    var attrs = data["attr"] || {};
    var regualrs = data["regular"] || {};

    appendOptions(data, "tag");
    appendOptions(data, "attr");
    appendOptions(data, "regular");
  });
});
