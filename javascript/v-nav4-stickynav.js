(function _stickyNav() {

  var stickyItem = document.querySelector('[data-is-sticky="true"]');
  var stickAtTopOfEl = document.querySelector('[data-sticky-fix-at-top]');
  var stickyBottomBoundaryEl = document.querySelector('[data-sticky-bottom-boundary]');

  function _init() {
    _addListeners();
    _checkSticky();
  }

  // var _checkDOMLoaded = setInterval(function() {
  //     if (document.readyState == 'complete') {
  //         _addListeners();
  //         _checkSticky();
  //         clearInterval(_checkDOMLoaded);
  //         console.log('executing _checkDOMLoaded from stickynav.js;\ndocument.readyState =', document.readyState);
  //       }
  // }, 100);

  function _checkSticky(event) {
    //console.log('window.innerHeight:', window.innerHeight);
    //console.log('stickAtTopOfEl.getBoundingClientRect().bottom', stickAtTopOfEl.getBoundingClientRect().bottom);
    //console.log('stickyBottomBoundaryEl.getBoundingClientRect().top:', stickyBottomBoundaryEl.getBoundingClientRect().top);
    //console.log('stickyBottomBoundaryEl.getBoundingClientRect().top:', stickyBottomBoundaryEl.getBoundingClientRect().top);
    if (stickAtTopOfEl.getBoundingClientRect().top <= 0) {
      /* top of stickAtTopOfEl is above top of viewport */
      stickyItem.classList.add('affix');
      if (stickyBottomBoundaryEl.getBoundingClientRect().top > window.innerHeight) {
        /* top of stickyBottomBoundaryEl is below viewport */
        stickyItem.style.bottom = '0';
        stickyItem.style.height = window.innerHeight + 'px';
      } else {
        /* top of stickyBottomBoundaryEl is above bottom of viewport */
        stickyItem.style.bottom = '0';
        stickyItem.classList.remove('affix');
        stickyItem.style.height = stickyBottomBoundaryEl.getBoundingClientRect().top + 'px';
      }
    } else {
      /* top of stickAtTopOfEl is below top of viewport */
      stickyItem.classList.remove('affix');
      // stickyItem.style.bottom = '0';
      stickyItem.style.bottom = 'auto';
      stickyItem.style.height = (window.innerHeight - stickAtTopOfEl.getBoundingClientRect().top) + 'px';
    }
  }

  function _checkAfterResize(event) {
    _checkSticky();
  }

  function _addListeners() {
    window.addEventListener('scroll', _checkSticky);
    window.addEventListener('resize', _checkAfterResize);
  }

  _init();

})();