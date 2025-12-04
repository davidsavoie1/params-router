/**
 * @module history
 * @description Browser history instance for managing navigation state.
 * Uses the 'history' library to create a BrowserHistory instance that tracks
 * location changes in the browser.
 */

import { createBrowserHistory } from "history";

/**
 * Browser history instance for managing client-side navigation.
 * @type {BrowserHistory}
 */
export const history = createBrowserHistory();
