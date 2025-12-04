/**
 * @module listening
 * @description Location and parameter change tracking utilities.
 * Provides subscription mechanisms to listen for navigation changes.
 */

import { history } from "./history";
import { toParams } from "./parsing";

/**
 * Subscribes to location changes in the browser history.
 * The callback function is invoked immediately with the current location,
 * then again each time the location changes.
 *
 * @param {Function} fn - Callback function that receives a Location object.
 *   The Location object contains: { pathname, search, hash, state, key }
 * @returns {Function} Unsubscribe function that stops listening to changes
 *
 * @example
 * const unsubscribe = trackLocation((location) => {
 *   console.log("Navigated to:", location.pathname);
 * });
 *
 * // Later, stop listening
 * unsubscribe();
 */
export function trackLocation(fn) {
  /* Run the function once */
  fn(history.location);

  const unlisten = history.listen(fn);
  return unlisten;
}

/**
 * Subscribes to parameter changes in the browser history.
 * The callback function is invoked immediately with the current parameters,
 * then again each time any parameters change (pathname, query, hash, or state).
 *
 * Parameters are extracted from all sources (pathname, search, hash, state)
 * and merged into a single object according to the specified pattern.
 *
 * @param {Function} fn - Callback function that receives a parameters object
 * @param {string} [pattern] - URL pattern for extracting pathname parameters (e.g., "/users/:id")
 * @returns {Function} Unsubscribe function that stops listening to changes
 *
 * @example
 * const unsubscribe = trackParams((params) => {
 *   console.log("Current params:", params);
 * }, "/users/:id");
 * // Later, stop listening
 * unsubscribe();
 *
 * @example
 * // URL: /users/123?tab=profile#comment=42 *
 * // Pattern: /users/:id *
 * // Callback receives: { id: "123", tab: "profile", comment: "42" }
 */

export function trackParams(fn, pattern) {
  /* Run the function once */
  fn(toParams(null, pattern));
  const unlisten = history.listen((location) => {
    const params = toParams(location, pattern);
    fn(params);
  });
  return unlisten;
}
