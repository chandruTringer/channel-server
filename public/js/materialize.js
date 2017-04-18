(function () {
  var activeToasts = [];
  var dialogActive;
  // Q returns new Library object that hold our selector. Ex: Q('.wrapper')
  var mze = function (params) {
    return new Materialize(params);
  };

  // define the class
  var Materialize = function(params) {
  var elementsList;
    if(typeof params === 'undefined') {
      elementsList = document.querySelectorAll(".material");
    } else {
      elementsList = document.querySelectorAll(params);
    }
    this.elements = elementsList;
  };

  Materialize.prototype.init = function() {
    var _this = this;
    var tempLength = _this.elements.length;
    while(tempLength--) {
      switch(_this.elements[tempLength].nodeName) {
        case "FORM":
        var outerDiv = document.createElement("DIV");
        outerDiv.classList.add("material-form-outer");
        _this.elements[tempLength].innerHTML = "<div class='material-form-outer'>" + _this.elements[tempLength].innerHTML + '</div>';
        _this.forms(_this.elements[tempLength].firstChild);
        break;
        default:
        console.log("Materialize not yet handled for this element. Kindly report.");
        break;
      }
    }
  };

  Materialize.prototype.forms = function(element) {
    var _this = this;
    var type = "normal";
    if(element.parentNode.classList.contains("steppers")) {
      type = "steppers";
    }
    if(type == "steppers") {
      var loadingDiv = document.createElement("DIV");
      loadingDiv.classList.add("material-form-load");
      element.parentNode.insertBefore(loadingDiv, element.parentNode.firstChild);

      titleDiv = document.createElement("DIV");
      titleDiv.classList.add("material-form-steppers-title");
      element.parentNode.insertBefore(titleDiv, element.parentNode.firstChild);

      _this.routeElement(element);
    } else {
      _this.routeElement(element);
    }
  };

  Materialize.prototype.routeElement = function(element) {
    var _this = this;
    var children = element.children;
    var childrenTotal = children.length;
    while(childrenTotal--) {
      var child = children[childrenTotal];
      child.classList.add("transformed");
      switch(child.nodeName) {
        case "INPUT":
        switch (child.type) {
          case "text":
          _this.handleInputText(child);
          break;
          case "radio":
          _this.handleRadioButton(child);
          break;
          case "checkbox":
          _this.handleCheckBox(child);
          break;
          default:
          break;
        }
        break;
        case "SELECT":
        if(child.getAttribute("multiple") !== null) {
          _this.handleSelectMultiple(child);
        } else {
          _this.handleSelectSingle(child);
        }
        break;
        case "BUTTON":

        break;
        case "DIV":
        _this.handleSegments(child);
        break;
        default:

        break;
      }
    }
  };

  Materialize.prototype.handleSegments = function(element) {
    var _this = this;
    if(element.dataset.core && (element.dataset.core == "segment")) {
      _this.routeElement(element);
    } else {
      console.log("unknown core");
    }
  };

  Materialize.prototype.handleInputText = function(element) {
    var label = document.createElement("LABEL");
    var div = document.createElement("DIV");
    div.classList.add("elementHolder");
    label.innerText = element.dataset.label;
    label.classList.add("inserted");
    element.parentNode.insertBefore(div, element.nextSibling);
    div.appendChild(element, div);
    element.parentNode.insertBefore(label, element.nextSibling);
    element.onchange = function() {
      if(element.value !== "") {
        element.classList.add("notEmpty");
      } else {
        element.classList.remove("notEmpty");
      }
    };
    if(element.value != "") {
      element.classList.add("notEmpty");
    } else {
      element.classList.remove("notEmpty");
    }
  };

  Materialize.prototype.handleSelectSingle = function(element) {
    element.style.display = "none";
    var label = document.createElement("LABEL");
    label.innerText = element.dataset.label;
    label.classList.add("inserted");
    var div = document.createElement("DIV");
    var sym = document.createElement("I");
    sym.classList.add("material-icons");
    sym.classList.add("material-form-symbols");
    sym.innerHTML = '&#xE5CF;';
    div.appendChild(sym);
    div.classList.add("elementHolder");
    element.parentNode.insertBefore(div, element.nextSibling);
    div.appendChild(element);
    var selectDiv = document.createElement("div");
    selectDiv.classList.add("materialSelect");
    var innerDiv = document.createElement("div");
    innerDiv.innerText = element.options[element.selectedIndex].text;
    var outerDiv = document.createElement("div");
    var list = document.createElement("ul");
    outerDiv.appendChild(list);
    for(var i = 0; i < element.options.length; i++) {
      var innerList = document.createElement("li");
      innerList.innerText = element.options[i].text;
      innerList.dataset.value = element.options[i].value;
      innerList.onclick = function(event) {
        if(element.name == "userType") {
          if(event.target.dataset.value == "customer") {
            var randomNumber = Math.floor(Math.random()*Math.pow(10,10));
            document.getElementById('customer-form').style.display = "block";
            document.getElementsByName("firstName")[0].value = "abcd";
            document.getElementsByName("email")[0].value = "abcd"+randomNumber+"@gmail.com";
            document.getElementsByName("phone")[0].value = randomNumber;
          } else {
            document.getElementById('customer-form').style.display = "none";
            document.getElementsByName("firstName")[0].value = "Guru";
            document.getElementsByName("email")[0].value = "agent3@gmail.com";
            document.getElementsByName("phone")[0].value = "3333333333";
          };
        };
      }
      list.appendChild(innerList);
      list.onclick = function(event) {
        innerDiv.innerText = event.target.innerText;
        outerDiv.style.display = "none";
        sym.classList.remove("active");
        innerDiv.classList.remove("selected");
        element.value = event.target.dataset.value;
      }
    };
    selectDiv.appendChild(innerDiv);
    selectDiv.appendChild(outerDiv);
    div.appendChild(label);
    div.appendChild(selectDiv);
    if(innerDiv.innerHTML != "") {
      label.classList.add("selected");
    };
    innerDiv.onclick = function() {
      outerDiv.style.display = "block";
      sym.classList.add("active");
      if(!label.classList.contains("selected")) {
        label.classList.add("selected");
      }
      innerDiv.classList.add("selected");
    }
  }

  Materialize.prototype.handleSelectMultiple = function(element) {

  }

  Materialize.prototype.handleRadioButton = function(element) {
    var groupName = "material-form-radiobuttons-" + element.name;
    var tempName = '[data-group="' + "material-form-radiobuttons-" + element.name + '"]';
    var div;
    if(document.querySelector(tempName)) {
      div = document.querySelector(tempName);
    } else {
      div = document.createElement("DIV");
      div.classList.add("elementHolder");
      element.parentNode.insertBefore(div, element.nextSibling);
      div.dataset.group = "material-form-radiobuttons-" + element.name;
    };

    var label = document.createElement("LABEL");
    label.classList.add("radio-label");
    div.appendChild(label);
    var innerSpan = document.createElement("SPAN");
    innerSpan.classList.add("material-form-radio-inner");
    var outerSpan = document.createElement("SPAN");
    outerSpan.classList.add("material-form-radio-outer");
    outerSpan.appendChild(innerSpan);
    element.classList.add("transformed");
    label.appendChild(element);
    label.appendChild(outerSpan);
    div.appendChild(label);
    label.innerHTML = label.innerHTML + element.dataset.label;

    if(element.dataset.grouplabel) {
      if(!element.dataset.grouplabelobtained) {
        var groupLabelDiv = document.createElement("div");
        groupLabelDiv.classList.add("material-form-radio-group-label");
        groupLabelDiv.innerText = element.dataset.grouplabel;
        div.insertBefore(groupLabelDiv, div.children[0]);
        element.dataset.grouplabelobtained = "obtained";
      }
    };

    label.classList.add("vertical");
  }

  Materialize.prototype.handleCheckBox = function(element) {
    var groupName = "material-form-checkbox-" + element.name;
    var tempName = '[data-group="' + "material-form-checkbox-" + element.name + '"]';
    var div;
    if(document.querySelector(tempName)) {
      div = document.querySelector(tempName);
    } else {
      div = document.createElement("DIV");
      div.classList.add("elementHolder");
      element.parentNode.insertBefore(div, element.nextSibling);
      div.dataset.group = "material-form-checkbox-" + element.name;
    };

    var label = document.createElement("LABEL");
    label.classList.add("material-form-checkbox-label");
    element.classList.add("transformed");
    element.classList.add("material-checkbox");
    label.appendChild(element);
    div.appendChild(label);

    if(element.dataset.grouplabel) {
      if(!element.dataset.grouplabelobtained) {
        var groupLabelDiv = document.createElement("div");
        groupLabelDiv.classList.add("material-form-radio-group-label");
        groupLabelDiv.innerText = element.dataset.grouplabel;
        div.insertBefore(groupLabelDiv, div.children[0]);
        element.dataset.grouplabelobtained = "obtained";
      }
    };

    label.innerHTML = label.innerHTML + element.dataset.label;
    label.classList.add("vertical");
  }

  Materialize.prototype.makeDialog = function(params) {
    var _this = this;
    var tempObj = {};
    var dialogDiv = document.createElement("DIV");
    if (typeof params === 'undefined') {
      tempObj.textMessage = "";
    } else if (typeof params === 'string') {
      tempObj.textMessage = params;
    } else {
      tempObj = params;
    }

    var tempParams = {};
    var defaultCallbackObject = {
      dismiss: _this.removeElement
    };
    tempParams.persistent = (typeof tempObj.persistent === 'undefined') ? false : tempObj.persistent;
    tempParams.theme = (typeof tempObj.theme === 'undefined') ? "light" : tempObj.theme;
    tempParams.holderId = (typeof tempObj.holderId === 'undefined') ? "" : tempObj.holderId;
    tempParams.callbackObject = (typeof tempObj.callbackObject === 'undefined') ? defaultCallbackObject : tempObj.callbackObject;

    if(dialogActive == null) {
      var transformDiv = document.getElementById(tempParams.holderId);
      transformDiv.style.display = "none";
      if(transformDiv) {
        dialogDiv.classList.add("material-dialog");
        dialogDiv.classList.add(tempParams.theme);
        var div = document.createElement("DIV");
        div.classList.add("material-dialog-holder");
        dialogDiv.appendChild(div);
        if(transformDiv.dataset.heading) {
          headingDiv = document.createElement("DIV");
          headingDiv.classList.add("material-dialog-heading");
          headingDiv.innerText = transformDiv.dataset.heading;
          div.appendChild(headingDiv);
        };

        var dialogInnerDiv = document.createElement("DIV");
        dialogInnerDiv.classList.add("material-dialog-content");
        dialogInnerDiv.innerHTML = transformDiv.innerHTML;
        div.appendChild(dialogInnerDiv);

        if(tempParams.persistent != true) {
          if(tempParams.callbackObject) {
            var actionCenter = document.createElement("DIV");
            actionCenter.classList.add("material-dialog-action-center");
            for(key in tempParams.callbackObject) {
              console.log(key);
              var action = document.createElement("DIV");
              action.classList.add("material-dialog-action");
              action.innerText = key;
              action.onclick = (function(element) {
                document.body.removeChild(element);
                dialogActive = null;
              }).bind(this, dialogDiv);
              actionCenter.appendChild(action);
            }
            div.appendChild(actionCenter);
          }
        }

        dialogActive = dialogDiv;
        document.body.appendChild(dialogDiv);

      } else {
        document.body.removeChild(dialogDiv);
        console.log("Holder does not exist.");
      }
    } else {
      console.log("There is already one dialog open. You cant open multiple dialogs at once");
    }

  }

  Materialize.prototype.closeDialog = function (element) {
    if(dialogActive != null) {
      document.body.removeChild(dialogActive);
      dialogActive = null;
    } else {
      console.log("No dialogs open!");
    }
  };

  Materialize.prototype.makeToast = function(params) {
    var _this = this;
    var tempObj = {};
    if(typeof params === 'undefined') {
      tempObj.textMessage = "";
    } else if (typeof params === 'string') {
      tempObj.textMessage = params;
    } else {
      tempObj = params;
    }
    var tempParams = {};
    tempParams.textMessage = (typeof tempObj.textMessage === 'undefined') ? "" : tempObj.textMessage;
    tempParams.position = (typeof tempObj.position === 'undefined') ? "bottom-right" : tempObj.position;
    tempParams.actionText = (typeof tempObj.actionText === 'undefined') ? "" : tempObj.actionText;
    tempParams.persistent = (typeof tempObj.persistent === 'undefined') ? false : tempObj.persistent;
    // Handlers initiation
    tempParams.actionCallback = (typeof tempObj.actionCallback === 'undefined') ? _this.emptyFunction : tempObj.actionCallback;

    if(typeof tempParams.actionCallback === "function") {

    } else {
      console.log("Handlers should always be functions.");
    }

    if((tempParams.position == "top-left") || (tempParams.position == "top-right")) {
      for (key in activeToasts) {
        if(activeToasts[key].classList.contains("show")) {
          activeToasts[key].style.top = (parseInt(window.getComputedStyle(activeToasts[key]).getPropertyValue("top"), 10) + 74) + "px";
        } else
        {
          activeToasts[key].classList.add("show");
          activeToasts[key].style.top = (parseInt(window.getComputedStyle(activeToasts[key]).getPropertyValue("top"), 10) + 104) + "px";
        }
      }
    } else {
      for (key in activeToasts) {
        if(activeToasts[key].classList.contains("show")) {
          activeToasts[key].style.bottom = (parseInt(window.getComputedStyle(activeToasts[key]).getPropertyValue("bottom"), 10) + 74) + "px";
        } else
        {
          activeToasts[key].classList.add("show");
          activeToasts[key].style.top = (parseInt(window.getComputedStyle(activeToasts[key]).getPropertyValue("top"), 10) + 104) + "px";
        }
      }
    };

    var div = document.createElement("DIV");
    var span = document.createElement("SPAN");
    var spanLinks = document.createElement("SPAN");

    div.classList.add("material-toasts");
    div.classList.add(tempParams.position);
    span.classList.add("text");
    spanLinks.classList.add("action");

    span.innerText = tempParams.textMessage;
    spanLinks.innerText = "UNDO";
    spanLinks.onclick = tempParams.actionCallback;
    div.appendChild(span);
    activeToasts.push(div);
    document.body.appendChild(div);
    if (tempParams.actionText != "") {
      div.appendChild(spanLinks);
    };
    window.setTimeout(function () {
      div.classList.add("show");

      if(tempParams.persistent == false) {
        setTimeout(function () {
          div.classList.add("hide");
          setTimeout(function () {
            document.body.removeChild(div);
            var arrPos = activeToasts.indexOf(div);
            delete activeToasts[arrPos];
          }, 3000);
        }, 3000);
      } else {
        spanLinks.innerText = "CLOSE";
        spanLinks.onclick = function() {
          div.classList.add("hide");
          setTimeout(function () {
            document.body.removeChild(div);
            var arrPos = activeToasts.indexOf(div);
            delete activeToasts[arrPos];
          }, 3000);
        }
      }

    }, 1000);

  }

  Materialize.prototype.closeModal = function() {
    document.body.removeChild(dialogActive);
  }

  if(!window.mze) {
    window.mze = mze;
  } else {
    console.log("There seems to be another mze object globally. Rename it.");
  };

})();
