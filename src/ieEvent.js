import {document, msie} from "./browser";
import {propHooks} from "./diffProps";

import {eventHooks, addEvent, eventPropHooks, dispatchEvent} from "./event";
import {oneObject, toLowerCase, innerHTML} from "./util";

//Ie6-8 oninput使用propertychange进行冒充，触发一个ondatasetchanged事件
function fixIEInputHandle(e) {
  if (e.propertyName === "value") {
    dispatchEvent(e, "input");
  }
}

function fixIEInput(dom) {
  addEvent(dom, "propertychange", fixIEInputHandle);
}
//IE8中select.value不会在onchange事件中随用户的选中而改变其value值，也不让用户直接修改value 只能通过这个hack改变
var noCheck = false;
function setSelectValue(e) {
  if (e.propertyName === "value" && !noCheck) {
    syncValueByOptionValue(e.srcElement);
  }
}

function syncValueByOptionValue(e) {
  var dom = e.srcElement,
    idx = dom.selectedIndex,
    option,
    attr;
  if (idx > -1) {
    //IE 下select.value不会改变
    option = dom.options[idx];
    attr = option.attributes.value;
    dom.value = attr && attr.specified
      ? option.value
      : option.text;
  }
}

function fixIEChangeHandle(e) {
  var dom = e.srcElement;
  if (dom.type === "select-one") {
    if (!dom.__bindFixValueFn) {
      addEvent(dom, "propertychange", setSelectValue);
      dom.__bindFixValueFn = true;
    }
    noCheck = true;
    syncValueByOptionValue(e);
    noCheck = false;
  }
  dispatchEvent(e, "change");
}

function fixIEChange(dom) {
  //IE6-8, radio, checkbox的点击事件必须在失去焦点时才触发 select则需要做更多补丁工件
  var mask = dom.type === "radio" || dom.type === "checkbox"
    ? "click"
    : "change";
  addEvent(dom, mask, fixIEChangeHandle);
}

function fixIESubmit(dom) {
  if (dom.nodeName === "FORM") {
    addEvent(dom, "submit", dispatchEvent);
  }
}

if (msie < 9) {
  propHooks[innerHTML] = function (dom, name, val, lastProps) {
    var oldhtml = lastProps[name] && lastProps[name].__html;
    var html = val && val.__html;
    if (html !== oldhtml) {
      //IE8-会吃掉最前面的空白
      dom.innerHTML = String.fromCharCode(0xFEFF) + html;
      var textNode = dom.firstChild;
      if (textNode.data.length === 1) {
        dom.removeChild(textNode);
      } else {
        textNode.deleteData(0, 1);
      }
    }
  };

  String("focus,blur").replace(/\w+/g, function (type) {
    eventHooks[type] = function (dom, name) {
      var mark = "__" + name;
      if (!dom[mark]) {
        dom[mark] = true;
        var mask = name === "focus"
          ? "focusin"
          : "focusout";
        addEvent(dom, mask, function (e) {
          //https://www.ibm.com/developerworks/cn/web/1407_zhangyao_IE11Dojo/ window
          var tagName = e.srcElement.tagName;
          if (!tagName) {
            return;
          }
          // <body> #document
          var tag = toLowerCase(tagName);
          if (tag == "#document" || tag == "body") {
            return;
          }
          e.target = dom; //因此focusin事件的srcElement有问题，强行修正
          dispatchEvent(e, name, dom.parentNode);
        });
      }
    };
  });

  Object.assign(eventPropHooks, oneObject("mousemove, mouseout,mouseenter, mouseleave, mouseout,mousewheel, mousewheel, whe" +
      "el, click",
  function (event) {
    if (!("pageX" in event)) {
      var doc = event.target.ownerDocument || document;
      var box = doc.compatMode === "BackCompat"
        ? doc.body
        : doc.documentElement;
      event.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0);
      event.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0);
    }
  }));

  Object.assign(eventPropHooks, oneObject("keyup, keydown, keypress", function (event) {
    /* istanbul ignore next  */
    if (event.which == null && event.type.indexOf("key") === 0) {
      /* istanbul ignore next  */
      event.which = event.charCode != null
        ? event.charCode
        : event.keyCode;
    }
  }));

  eventHooks.input = fixIEInput;
  eventHooks.inputcapture = fixIEInput;
  eventHooks.change = fixIEChange;
  eventHooks.changecapture = fixIEChange;
  eventHooks.submit = fixIESubmit;
}
