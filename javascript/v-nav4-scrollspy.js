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
  var spyTargets;
  var spyTargetsObj;
  var spyRefContainerRect;
  var spyContentContainerRect;

  var spyNavScrollTimer = null;
  var spyNavScrollFlag;

  function _init() {
    spyNav = document.querySelector('.spy-nav');
    spyNavList = document.querySelector('.spy-nav__list');
    spyNavListItems = document.querySelectorAll('.spy-nav__list li');
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
    // if (event) event.stopPropagation();
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
    }
  }

  function _checkSpyTargets(event) {
    var currentSpyNavListItem;
    var currentSpyNavAnchor;
    /* look through all the spyTargetsObj objects to see which is in view */
    for (var key in spyTargetsObj) {
      currentSpyNavAnchor = spyNavList.querySelector('li a[href="#' + key + '"]');
      currentSpyNavListItem = currentSpyNavAnchor.parentElement;
      /* in case parent of currentSpyNavAnchor is not <li>, we want to find
          the <li> that currentSpyNavAnchor anchor is in; */
      for (var loops = 1; loops<=10 && currentSpyNavListItem.nodeName.toLowerCase() != 'li'; loops ++) {
        // console.log('currentSpyNavListItem.nodeName:', currentSpyNavListItem.nodeName);
        currentSpyNavListItem = currentSpyNavListItem.parentElement;
      }
      if (spyRefContainerRect == document.body) {
        //console.info('spyRefContainer == document.body');
      }
      if (spyTargetsObj[key].bottom >= 1
        && ( spyTargetsObj[key].top <= 1 || Math.abs(spyTargetsObj[key].top - spyRefContainerRect.top) <= 1) ) {

        if (activeSpyNavAnchor) {
          activeSpyNavAnchor.classList.remove('spy-nav__a--active');
        }
        currentSpyNavAnchor.classList.add('spy-nav__a--active');
        activeSpyNavAnchor = currentSpyNavAnchor;
        /* check visibility of active li a */
        /*
          below is to have spy nav follow spy target scrolling to always keep
            the active spy list item in view;
        */
          console.log('spyNavList.scrollTop:', spyNavList.scrollTop);
          if (spyNavScrollFlag) return;
        // if (spyNavList.scrollTop > 0 && spyNavList.scrollTop < spyNavList.getBoundingClientRect().height - window.innerHeight) {
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
    if (spyNavScrollTimer !== null) {
        spyNavScrollFlag = true;
        clearTimeout(spyNavScrollTimer);
    }
    spyNavScrollTimer = setTimeout(function() {
          // if haven't scrolled in 1200ms, then set spyNavScrollFlag to false
          spyNavScrollFlag = false;
    }, 1200);
  }

  function _disableBodyScroll(event) {
    document.body.style.overflow='hidden';
    console.error("mouseover");
  }

  function _enableBodyScroll(event) {
    document.body.style.overflow='auto';
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
    // http://stackoverflow.com/questions/4620906/how-do-i-know-when-ive-stopped-scrolling-javascript

    // spyNavList.addEventListener('mouseover', _disableBodyScroll);
    // spyNavList.addEventListener('mouseout', _enableBodyScroll);

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