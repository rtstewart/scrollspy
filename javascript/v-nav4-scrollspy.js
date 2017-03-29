var list = (function _vNavScrollspy() {

  /*

    https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript

    https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule

    https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/deleteRule

    To locate the last style sheet associated with the current document:
      document.styleSheets[document.styleSheets.length - 1];

    To find the number of rule sets in the last style sheet:

      document.styleSheets[document.styleSheets.length - 1].cssRules.length;

      NOTE: document.styleSheets[document.styleSheets.length - 1].cssRules
      returns an array of CSSStyleRule objects which have the following
      properties:
      - selectorText (this can help you find the selector so you can perhaps
        delete the old one, and create and apply a new one with the same
        name, but different specs)
      - style
      - type
      - cssText (this is the one that will have the actual rule as typed)
      - parentRule;

    Inserting a rule into the last document style sheet:
      document.styleSheets[document.styleSheets.length - 1].insertRule(rule, index);

    To append a rule at the end of the last style sheet:
      - the last index is one smaller than the number of rule sets given above;
      - so, to append a rule at the end, for 'index', use the ...cssRules.length,
        which would be one greater than the current last index;

    To delete the last rule in the last style sheet:

      document.styleSheets[document.styleSheets.length - 1].deleteRule(last index);
      where the last index will be ...cssRules.length - 1

    To create a style sheet named "dynamicStyles" dynamically:

      var dynamicStyles = document.createElement('style');

      document.body.appendChild(dynamicStyles);

      Now you can use this style sheet exclusively for dynamic styles without
      messing with the author-defined ones using the methods listed above.
      Added in this way, it would be the last style sheet, given by the method
      described above.

  */

  //https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop

  // var spyNavContainer = document.querySelector('.spy-nav-container');
  /* create and append style sheet dynamically for dynamic styling */
  var dynStyles = document.createElement('style');
  document.body.appendChild(dynStyles);

  var spyNav;
  var spyNavList;
  var spyNavListItems;
  var activeSpyNavAnchor;
  var spyNavListItemHeight;
  var spyTargets;
  var spyTargetsObj;
  var spyRefContainerRect;
  var spyContentContainerRect;

  function _init() {
    spyNav = document.querySelector('.spy-nav');
    spyNavList = document.querySelector('.spy-nav__list');
    spyNavListItems = document.querySelectorAll('.spy-nav__list li');
    for (var i=0; i<spyNavListItems.length; i++) {
      //console.log('spyNavListItems[',i,'].offsetTop:', spyNavListItems[i].offsetTop);
    }
    spyNavListItemHeight = document.querySelector('.spy-nav__list li').getBoundingClientRect().height;
    //console.log('spyNavListItemHeight:', spyNavListItemHeight);
    /* grab the array of spyTargets with class .spy-section, which must have
        ids corresponding to the href of the spy nav list anchors */
    spyTargets = document.querySelectorAll('.spy-section');
    spyTargetsObj = {};
    spyRefContainerRect = document.querySelector('.spy-reference-container').getBoundingClientRect();
    spyContentContainerRect = document.querySelector('.spy-content-container').getBoundingClientRect();
    _getSpyTargetsSizesAndPositions();
    _initSpyNavAnchorState();
    _addListeners();
    // _checkDOMLoaded();

    console.log('Initialized.');
  }

  // var _checkDOMLoaded = setInterval(function() {
  //   if (document.readyState == 'complete') {
  //     console.log('executing _checkDOMLoaded from scrollspy.js;\ndocument.readyState =', document.readyState);
  //     _addListeners();
  //     /* call _getSpyTargetsSizesAndPositions before _initSpyNavAnchorState */
  //     _getSpyTargetsSizesAndPositions();
  //     _initSpyNavAnchorState();
  //     clearInterval(_checkDOMLoaded);
  //   }
  // }, 100);

  /* When you need to know how far an element is from the top of the DOM,
      not the top of its parent, use this helper function.
      Loops through all parent nodes of an element to get it's distance
      from the top of the document */
  function _getDistanceFromTop(element) {
      var yPos = 0;
      while(element) {
          yPos += (element.offsetTop);
          element = element.offsetParent;
      }
      return yPos;
  } // end _getDistanceFromTop

  /* this function should be called whenever something occurs that would
      change positioning properties of any elements associated with spy
      functionality; */
  function _getSpyTargetsSizesAndPositions(event) {
    if (event && event.type == 'scroll' && event.target == spyNavList) {
      console.log(event,'\n', event.type, '\n', event.target);
      return;
    }
    console.log('event:', event);
    for (var i=0; i<spyTargets.length; i++) {
      spyTargetsObj[spyTargets[i].id] = spyTargets[i].getBoundingClientRect();
    }
    /* update reference container */
    spyRefContainerRect = document.querySelector('.spy-reference-container').getBoundingClientRect();
    /* update spy-content-container */
    spyContentContainerRect = document.querySelector('.spy-content-container').getBoundingClientRect();
    //console.log('spyTargetsObj:', spyTargetsObj);
    _checkSpyTargets(event);
  }

  function _initSpyNavAnchorState() {
    //console.log('spyRefContainerRect:', spyRefContainerRect);
    for (var key in spyTargetsObj) {
      /* below gives initial inactive styling */
      spyNavList.querySelector('li a[href="#' + key + '"]').classList.add('spy-nav__a--inactive');
      //console.log('from _initSpyNavAnchorState:\nspyTargetsObj[',key,']:', spyTargetsObj[key]);
      // if (spyTargetsObj[key].bottom > 0 && Math.abs(spyTargetsObj[key].top) < window.innerHeight) {
      //   spyNavList.querySelector('li a[href="#' + key + '"]').classList.add('spy-nav__a--active');
      // }
    }
  }

  function _checkSpyTargets(event) {
    if (event) {
      console.log('in _checkSpyTargets; event.type, event.target;',event.type, event.target);
    } else {
      console.log(' in _checkSpyTargets with no event;');
    }
    var currentSpyNavListItem;
    var currentSpyNavAnchor;
    /* look through all the spyTargetsObj objects to see which is in view */
    for (var key in spyTargetsObj) {
      currentSpyNavAnchor = spyNavList.querySelector('li a[href="#' + key + '"]');
      //console.log('currentSpyNavAnchor:', currentSpyNavAnchor);
      currentSpyNavListItem = currentSpyNavAnchor.parentElement;
      /* in case parent of currentSpyNavAnchor is not <li>, we want to find
          the <li> that currentSpyNavAnchor anchor is in; */
      // console.log('currentSpyNavListItem.nodeName:', currentSpyNavListItem.nodeName);
      for (var loops = 1; loops<=10 && currentSpyNavListItem.nodeName.toLowerCase() != 'li'; loops ++) {
        // console.log('currentSpyNavListItem.nodeName:', currentSpyNavListItem.nodeName);
        currentSpyNavListItem = currentSpyNavListItem.parentElement;
      }
      //console.log('currentSpyNavListItem.nodeName:', currentSpyNavListItem.nodeName);
      // currentSpyNavListItem = currentSpyNavAnchor.parentElement;
      //console.log('currentSpyNavAnchor.parentNode:', currentSpyNavAnchor.parentNode);
      // spyNavList.querySelector('li a[href="#' + key + '"]').classList.remove('spy-nav__a--active');
      // currentSpyNavAnchor.classList.remove('spy-nav__a--active');
      if (spyRefContainerRect == document.body) {
        //console.info('spyRefContainer == document.body');
      }
      // if (spyTargetsObj[key].top - spyContentYOffset <= 1 && scrollspyTargetsObj[key].bottom - scrollspyContentYOffset >= 0) {
      // if (spyTargetsObj[key].bottom >= 1 && spyTargetsObj[key].top <= 1) {
      // console.log('spyTargetsObj[',key,'].top:', spyTargetsObj[key].top);
      // console.log('spyTargetsObj[',key,'].bottom;', spyTargetsObj[key].bottom);
      // console.log('spyRefContainerRect.top:', spyRefContainerRect.top);
      // console.log();
      if (spyTargetsObj[key].bottom >= 1
        && ( spyTargetsObj[key].top <= 1 || Math.abs(spyTargetsObj[key].top - spyRefContainerRect.top) <= 1) ) {

        if (activeSpyNavAnchor) {
          activeSpyNavAnchor.classList.remove('spy-nav__a--active');
        }
        currentSpyNavAnchor.classList.add('spy-nav__a--active');
        activeSpyNavAnchor = currentSpyNavAnchor;
        //spyNavList.querySelector('li a[href="#' + key + '"]').classList.add('spy-nav__a--active');
        /* check visibility of active li a */
        // console.log('event:', event);
        /*
          below is to have spy nav follow spy target scrolling to always keep
            the active spy list item in view;
        */
        //if ( event && event.type == 'scroll' && event.currentTarget == window ) {
          //console.log('event:', event);
        // console.log('spyNavList.scrollTop:', spyNavList.scrollTop);
        // if (spyNavList.scrollTop >= 1) {
          console.log('spyNavList.scrollTop:', spyNavList.scrollTop);
          if (activeSpyNavAnchor.getBoundingClientRect().top < 0) {
            /* top of active spy nav list item is above viewport, 'top' value
                is negative; move the active list item down; */
            spyNavList.scrollTop += activeSpyNavAnchor.getBoundingClientRect().top;
          } else if (activeSpyNavAnchor.getBoundingClientRect().bottom > window.innerHeight) {
            /* bottom of active spy nav list item is below viewport, 'bottom'
                value is positive; move the active list item up */
            spyNavList.scrollTop += activeSpyNavAnchor.getBoundingClientRect().bottom - window.innerHeight;
          }
        // }
        //} // end if ( event && event.type ...

      }

    } // end for (var key in spyTargetsObj)

    /* if last spy section is active, make sure spy nav is fully visible to
        its bottom, where that active link is; */
    if (activeSpyNavAnchor.getAttribute('href') == '#' + spyTargets[spyTargets.length - 1].id) {
      //console.warn("got the last section as active; spyNavList.scrollTop =", spyNavList.scrollTop);
      spyNavList.scrollTop += spyNavList.getBoundingClientRect().height;
    }

  } // end _checkSpyTargets

  function _checkNavScroll(event) {
    _getSpyTargetsSizesAndPositions(event);
  }

  function _disableBodyScroll(event) {
    document.body.style.overflow='hidden';
    console.error("mouseover");
  }

  function _enableBodyScroll(event) {
    document.body.style.overflow='auto';
  }

  function _preventWindowScroll (e) {
    // var e0 = e.originalEvent;
    // var delta = e0.wheelDelta || -e0.detail;

    var delta = e.wheelDelta || -e.detail;

    this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
    e.preventDefault();
  }

  function _checkNavListScroll(e) {
    //http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
    console.log('spyNavList.scrollTop:', spyNavList.scrollTop);
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    function preventDefault(e) {
      e = e || window.event;
      if (e.preventDefault)
          e.preventDefault();
      e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function disableScroll() {
      if (window.addEventListener) // older FF
          window.addEventListener('DOMMouseScroll', preventDefault, false);
      window.onwheel = preventDefault; // modern standard
      window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
      window.ontouchmove  = preventDefault; // mobile
      document.onkeydown  = preventDefaultForScrollKeys;
    }

    function enableScroll() {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }
  }

  function _addListeners() {

    // spyNavList.addEventListener('scroll', _checkNavListScroll);

    // http://stackoverflow.com/questions/10211203/scrolling-child-div-scrolls-the-window-how-do-i-stop-that
    // https://developer.mozilla.org/en-US/docs/Web/Events
    // http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
    // https://developer.mozilla.org/en-US/docs/Web/Events/mousemove
    // https://developer.mozilla.org/en-US/docs/Web/Events/touchmove
    // http://stackoverflow.com/questions/28411499/html-css-disable-scrolling-on-body
    // http://stackoverflow.com/questions/7600454/how-to-prevent-page-scrolling-when-scrolling-a-div-element
    // http://qnimate.com/detecting-end-of-scrolling-in-html-element/

    spyNavList.addEventListener('mouseover', _disableBodyScroll);
    spyNavList.addEventListener('mouseout', _enableBodyScroll);

    spyNavList.addEventListener('scroll', _checkNavScroll);

    document.addEventListener('scroll', _getSpyTargetsSizesAndPositions);

    // spyNavList.addEventListener('mousewheel', _preventWindowScroll);
    // spyNavList.addEventListener('DOMMouseScroll', _preventWindowScroll);

    /* on resize, element heights likely change and so this affects
        where spyTargets upper and lower boundaries are; */
    document.addEventListener('resize', _getSpyTargetsSizesAndPositions);

  }

  _init();

  return spyNavList;

})();