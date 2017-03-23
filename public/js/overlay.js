/**
  * Object for creating overlay by instantiating the below constructor
  * Dependency jinigram.view {object}
  ****************************************************************************************************************************************
  * @param1 {object} => customProperties
  * anchor {string} => Object which can be customized in order to anchor the overlay to a particular position with reference to vertical direction
  * classToAdd {string} => It add the requred class according the requirment classes should be passes with a space seperated between them
  * classToRemove {string} => It will remove the following classes from the overlay
  * isFixedBody {boolean} => To make the body fixed and restrict scroll when overlay is visible and vise verse for false
  * contentToAppend {string} => It holds the template which has to be appended inside the overlay
  * isShowModal {boolean} => It will add black background i.e modalBg to the overlay.(at set condition -> true)
  * slidingDirection {string} => It can hold only two possible values for now
    from-top => slide from top of the screen
    from-bottom => slide from the bottom of the screen
*/

modalOverlay = function (customProperties) {

  // Custom Properties to be set for the constructor
  var _self = this;

  // Essential constants for the overlay
  _self.constants = {
    FROM_TOP: "from-top",
    FROM_BOTTOM: "from-bottom",
    FROM_RIGHT: "from-right",
    TOP: "top",
    RIGHT: "right",
    POSITIVE_CENT_PERCENT: "-100%",
    NEGATIVE_CENT_PERCENT: "100%"
  };

  _self.selector = {
    OVERLAY : "#page__overlay",
    MODAL_BACKGROUND : "#page__modal-background",
    OVERLAY_ELEMENTS_SELECTOR : "#page__overlay, #page__modal-background",
    CLICK_EVENTS: "click touchstart",
    CAPTURE_CLICK: ".capture",
    BODY: "body"
  }

  _self.VIEW_TYPE = {
  };

  _self.customProperties = customProperties;
	_self.anchor = isset( _self.customProperties.anchor )
                          ? _self.customProperties.anchor : null;
  _self.classToAdd = isset( _self.customProperties.classToAdd )
                          ? _self.customProperties.classToAdd : '';
  _self.classToRemove = isset( _self.customProperties.classToRemove )
                          ? _self.customProperties.classToRemove : '';
  _self.isFixedBody = isset( _self.customProperties.isFixedBody )
                          ? _self.customProperties.isFixedBody : true;
  _self.contentToAppend = isset( _self.customProperties.contentToAppend )
                          ? _self.customProperties.contentToAppend : '';
  _self.isShowModal = isset( _self.customProperties.isShowModal )
                          ? _self.customProperties.isShowModal : true;
  _self.slidingDirection = isset( _self.customProperties.slidingDirection ) ? _self.customProperties.slidingDirection : _self.constants.FROM_TOP;
  _self.view = isset( _self.customProperties.view )
                          ? _self.customProperties.view : '';
  _self.createViewEvents = isset( _self.customProperties.createViewEvents )
                          ? _self.customProperties.createViewEvents : null;
  _self.destroyViewEvents = isset( _self.customProperties.destroyViewEvents )
                          ? _self.customProperties.destroyViewEvents : function(){};
  // Custom Variable which is required all over the overlay
  _self.overlay = $( _self.selector.OVERLAY );

  // Styles which has to be removed from the overlay in order to reset and preset the overlay
  // init method triggers the complete process of the creating overlay
  _self.init( _self.overlay, _self.contentToAppend, _self.classToAdd, _self.classToRemove, _self, _self.view );
}

modalOverlay.prototype = {

  /**
  * Add or remove multiple classes into the dom element
  * @param1 {boolean} => isAdd (This boolean will set the mode i.e to add classes to the element or to remvoe classes from the element)
  * @param2 {object} => element (DOM object to which the class has to be added or removed)
  * @param3 {string} => classes (Class to be added or removed from the DOM object)
  */

  addOrRemoveClasses : function( isAdd, element, classes ) {
    if(isAdd){
        element.addClass( classes );
    } else {
        element.removeClass( classes );
    }
  },

  /**
  * Appends the required content into the DOM element
  * @param1 {object} => element (DOM object to which content has to be appended)
  * @param2 {string} => template (content which has to be appended to the DOM Object)
  */

  appendContent : function( element, template ) {
		  element.html( template );
  },

  /**
  * @param1 {object} => _self (current instatiated overlay object)
  */

  destroyEvents : function( _self ) {
    _self.resetOverlay( $( _self.selector.OVERLAY ) );
    _self.fixBody( false );
    $(_self.selector.MODAL_BACKGROUND).attr("data-type","");
    if(isset( _self.createViewEvents )) {
      _self.destroyViewEvents();
    }
    $( _self.selector.CLICK_EVENTS ).off( _self.selector.CLICK_EVENTS,  _self.CLICK );
    _self = null;
  },

  /**
  * Makes the body fixed
  */

  fixBody: function( isStopScroll ) {
    var _this = this;
    if( isStopScroll ){
      if( !$( _this.selector.BODY ).hasClass( "stop-scroll" ) ) {
        $( _this.selector.BODY ).addClass( "stop-scroll" );
      }
    } else {
      $( _this.selector.BODY ).removeClass( "stop-scroll" );
    }
  },

  /**
  * This function starts the complete process of overlay creation
  * @param1 {object} => overlay
  * @param2 {string} => content
  * @param3 {string} => classToAdd
  * @param4 {string} => classToRemove
  * @param5 {object} => _self
  */

  init : function( overlay, content, classToAdd, classToRemove, _self, view ) {
    var transitionObject = {}; // Top value was hard coded for now it should be updated by getting the proper use case
    transitionObject.fromPosition =( _self.slidingDirection == _self.constants.FROM_TOP || _self.slidingDirection == _self.constants.FROM_RIGHT ) ? _self.constants.POSITIVE_CENT_PERCENT : _self.constants.NEGATIVE_CENT_PERCENT;
    transitionObject.property = (_self.slidingDirection ==  _self.constants.FROM_TOP || _self.slidingDirection ==  _self.constants.FROM_BOTTOM ) ? _self.constants.TOP : _self.constants.RIGHT;
    _self.resetOverlay(overlay);
    _self.appendContent(overlay, content);
    if (_self.isShowModal) {
      _self.showModal();
    }
    if (_self.isFixedBody) {
      _self.fixBody(_self.isFixedBody);
    }
    if (classToRemove) {
      _self.addOrRemoveClasses(false, overlay, classToRemove);
    }
    if (classToAdd) {
      _self.addOrRemoveClasses(true, overlay, classToAdd);
    }
    if (view) {
      _self.setView(overlay, view);
    }
    _self.presetSlideIn(overlay, transitionObject).done(function(){
      _self.slideInOverlay(overlay, transitionObject);
      _self.createEventForOverlay();
    }
    );
  },
  createEventForOverlay: function(){
    var _this = this;
    $(document).on("click touchstart", ".capture",function(){
      _this.hideOverlay();
    });
  },
  hideOverlay: function() {
		var $modalBackground = $("#page__modal-background"),
		$overlay = $("#page__overlay"),
		top = "calc(-50% - "+$overlay.height()+"px)";
		$overlay.css({"top": top}).on("transitionend", function(event){
				event.preventDefault();
				$overlay.off("transitionend");
				$overlay.empty();
				OverlayObject.destroyEvents(OverlayObject);
				$modalBackground.removeClass("appear").addClass("vanish").on("transitionend", function(event){
					event.preventDefault();
					$modalBackground.off("transitionend");
					$modalBackground.addClass("hide");
          OverlayObject = null;
			});
		});
	},
  presetSlideIn: function presetSlideIn( overlay, options ) {
    var _overlay$css;

    var deferred = $.Deferred();
    // overlay.attr('data-page', 'modal-overlay');
    // overlay.css((_overlay$css = {}, _defineProperty(_overlay$css, options.property, options.fromPosition), _defineProperty(_overlay$css, "display", "block"), _overlay$css));
    overlay.css({"top": "-50%","display": "block"})
    return deferred.resolve();
  },

  /**
  * Resets the properties which are all there with overlay
  * @param1 {object} => overlay
  */
  resetOverlay: function resetOverlay(overlay) {
    overlay.hide();
    overlay.empty();
    this.addOrRemoveClasses(false, overlay, this.styles);
    overlay.attr("style", "");
    overlay.attr("data-view", "");
  },

  /**
  * Sets the data-view attribute of overlay element according to which style will change
  * @param1 {object} => overlay
  * @param2 {string} => currentView
  */

  setView: function setView(overlay, currentView) {
    overlay.attr("data-view", currentView);
  },

  /**
  * Shows the modal window behind the overlay
  */
  showModal: function showModal() {
    var _this = this,
        $modalBackground = $(_this.selector.MODAL_BACKGROUND);
    if ( $modalBackground.is(":visible") ) {

      // There are cases where overlay might be visible so based on the return {boolean} value
      // true => Not visble and Modal window has been shown
      // flase => It is already visible in the screen

      $modalBackground.addClass("zero-opacity");

    } else {

      // In order to counter the above false case calling the same function after 200ms of delay
      // As the displayModalWin method which has been called previously would have closed the modal window by that time which does the job
      $modalBackground.removeClass("hide vanish").addClass( "appear capture" );
      $modalBackground.attr("data-type","hide-overlay");
    }
  },

  /**
  * As the theme to overlay is to show the modal window first followed by sliding transition for the overlay
  * The slide process will be done over here
  * @param1 {object} => overlay
  * @param2 {object} => options(can have to values from position and to position)
                      * fromPosition => slide from position
                      * toPosition => slide to position
  */

  slideInOverlay: function(overlay, options) {
    var _this = this;

    // setTimeout(function() {
    $(overlay).show();

    if (isset(_this.anchor)) {
      overlay.removeClass("vanish");
      overlay.css(_defineProperty({ "opacity": "1" }, options.property, _this.anchor));
    } else {

      if(overlay[0].getBoundingClientRect().height < window.innerHeight){

        var center = "calc(50% - (" + overlay[0].getBoundingClientRect().height + "px)/2)";

      } else {

        var center = "0px";

      }
      overlay.css(_defineProperty({ "opacity": "1" }, options.property, center));
    }

    if( isset(_this.createViewEvents )) {
      _this.createViewEvents();
    }

    // }, 200);
  }
}
// Support function to create the new object for the css property in the jquery
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
}

function isset(data) {
  return !(typeof data==="undefined" || data==null);
}
