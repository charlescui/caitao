// 解析当前页面是否有淘宝商品
function do_parse(tag, attr, pattern){
  console.log("tag: "+tag+"attr: "+attr+", pattern: "+pattern);
  var lists = [];
  // <a href="//defeisi.tmall.com/campaign-3734-1.htm?spm=a222r.7714196.7489773486.46.fm0bCU&amp;acm=lb-zebra-3904-100711.1003.4.287486&amp;scm=1003.4.lb-zebra-3904-100711.ITEM_21524700687_287486" target="_blank" data-spm-anchor-id="a222r.7714196.7489773486.46"></a>
  $(tag).each(function(argument) {
    var reg = new RegExp(pattern, 'i');
    var link = $(this).attr(attr);
    if (reg.test(link)) {
      var tid = RegExp.$1;
      var detail = "http://detail.tmall.com/item.htm?id="+tid;
      lists.push(detail);
      console.log(link);
    }
  });
  // 去掉重复项
  show_urls($.unique(lists));
};

// Chrome无效
// 复制到剪贴板
function copyToClipBoard(content){
  console.log("copy to clip board");
  // window.clipboardData.setData("Text",content);
  $('#dialog_textarea').focus().select();
}

// 通过浮层展示URL清单
function show_urls(arr){
  var title = "采淘";
  if (arr.length > 0) {
    title = title + " - " + "本次采集" + arr.length + "条";
    var content = $(arr).map(function(idx, e){
        return e;
    }).get();
  }else{
    title = title + " - " + "没有找到任何数据"
    var content = ["没有找到任何数据"];
  }

  var rows = (content.length < 50) ? content.length : 50;
  var area = '<textarea id="dialog_textarea" style="max-height:200px;border:0;background:none;margin-left:10px;" readonly="value" rows="'+rows+'" cols="50">'+content.join("\r\n")+'</textarea>';

  ctx = '<div id="MenuDialog">'+area+'</div>';
  var dig = $(ctx);

  dig.dialog({
    modal: false,
    title: title,
    show: 'clip',
    hide: 'clip',
    zIndex: 9999,
    width: 420,
    'max-height': 480,
    buttons: [
        {text: "全选", click: function() {copyToClipBoard(content.join("\n"))}},
        {text: "关闭", click: function() {$(this).dialog("close")}}
    ]
  });
  dig.dialog("open");
};
