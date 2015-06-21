import DOMHistory from './DOMHistory';
import { getWindowPath, supportsHistory } from './DOMUtils';

/**
 * A history implementation for DOM environments that support the
 * HTML5 history API (pushState, replaceState, and the popstate event).
 * Provides the cleanest URLs and should always be used in browser
 * environments if possible.
 *
 * Note: BrowserHistory automatically falls back to using full page
 * refreshes if HTML5 history is not available, so URLs are always
 * the same across browsers.
 */
class BrowserHistory extends DOMHistory {

  constructor(options) {
    super(options);
    this.handlePopState = this.handlePopState.bind(this);
    this.isSupported = supportsHistory();
  }

  setup() {
    if (this.location != null)
      return;

    var path = getWindowPath();
    var key = null;
    if (this.isSupported && window.history.state)
      key = window.history.state.key;

    super.setup(path, { key });

    if (window.addEventListener) {
      window.addEventListener('popstate', this.handlePopState, false);
    } else {
      window.attachEvent('onpopstate', this.handlePopState);
    }
  }

  teardown() {
    if (window.removeEventListener) {
      window.removeEventListener('popstate', this.handlePopState, false);
    } else {
      window.detachEvent('onpopstate', this.handlePopState);
    }

    super.teardown();
  }

  handlePopState(event) {
    if (event.state === undefined)
      return; // Ignore extraneous popstate events in WebKit.

    var path = getWindowPath();
    var key = event.state && event.state.key;
    this.handlePop(path, { key });
  }

  // http://www.w3.org/TR/2011/WD-html5-20110113/history.html#dom-history-pushstate
  push(path, key) {
    if (this.isSupported) {
      var state = { key };
      window.history.pushState(state, '', path);
      return state;
    }

    window.location = path;
  }

  // http://www.w3.org/TR/2011/WD-html5-20110113/history.html#dom-history-replacestate
  replace(path, key) {
    if (this.isSupported) {
      var state = { key };
      window.history.replaceState(state, '', path);
      return state;
    }
    window.location.replace(path);
  }

}

export default BrowserHistory;