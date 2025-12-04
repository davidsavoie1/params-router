/**
 * @module parsing
 * @description URL and parameter parsing utilities.
 * Converts between URL strings and parameter objects, handling pathname patterns,
 * query strings, hash fragments, and state.
 */

import qs from "query-string";
import { history } from "./history";
import { getParser } from "./router";
import { isNil, omit, pick } from "./util";

/** @constant {RegExp} LEAD_TRAIL_SLASHES_REGEX - Matches leading and trailing slashes */
const LEAD_TRAIL_SLASHES_REGEX = /^(\/+)\/|\/+$/;

/**
 * Removes all leading/trailing slashes but preserves the first slash if present.
 * @param {string} str - String to trim
 * @returns {string} Trimmed string
 * @private
 */
const trimSlashes = (str) => str.replace(LEAD_TRAIL_SLASHES_REGEX, "");

/**
 * Parses a query string or hash string into an object with typed values.
 * Numbers and booleans are automatically parsed.
 * @param {string} str - Query or hash string (without leading ? or #)
 * @returns {Object} Parsed parameters object
 * @private
 */
const parseQueryOrHash = (str) =>
  qs.parse(str, { parseNumbers: true, parseBooleans: true });

/**
 * Converts various location representations to a Location object.
 * @param {string|Object|null} arg - URL string, Location object, or null
 * @returns {Object} Location object with URL components
 * @private
 */
const toLocation = (arg) => {
  if (typeof arg === "object") return arg;
  if (typeof arg !== "string") return {};
  return new URL(arg);
};

/**
 * Gets the current parameters from the browser's current location.
 * @param {string} [pattern] - URL pattern for pathname parameter extraction
 * @returns {Object} Current parameters
 * @private
 */
const getCurrParams = (pattern) => toParams(history.location, pattern);

/**
 * Converts a destination specification to a parameters object.
 * Handles string URLs, parameter objects, and updater functions.
 * @param {string|Function|Object} to - Destination specification
 * @param {string} [pattern] - URL pattern for pathname parameter extraction
 * @returns {Object} Parameters object
 * @private
 */
const parameterize = (to, pattern) => {
  if (typeof to === "object") return to;

  const currParams = getCurrParams(pattern);
  if (typeof to === "function") return to(currParams);
  return currParams;
};

/**
 * Converts a parameters object to a URL string.
 * Pathname parameters are formatted according to the pattern,
 * while remaining parameters are added as query string.
 * @param {Object} params - Parameters to stringify
 * @param {string} [pattern] - URL pattern for pathname parameter formatting
 * @returns {string} URL string
 * @private
 */
function stringify(params, pattern) {
  const parser = getParser(pattern);
  const pathnameKeys = parser.names;
  const pathnameParams = { _: "", ...pick(pathnameKeys, params) };

  const pathname = parser.stringify(pathnameParams) || "/";
  return qs.stringifyUrl({ url: pathname, query: omit(pathnameKeys, params) });
}

/**
 * Extracts parameters from the pathname portion of a URL.
 * Only parameters matching the pattern are returned.
 *
 * @param {string|Object|null} [arg] - URL string, Location object, or null (defaults to current location)
 * @param {string} [pattern] - URL pattern for extracting pathname parameters (e.g., "/users/:id")
 * @returns {Object} Object containing only pathname parameters
 *
 * @example
 * // URL: http://example.com/users/123?tab=profile#section=info
 * // Pattern: "/users/:id"
 * toOwnParams(null, "/users/:id"); // Returns { id: "123" }
 */
export function toOwnParams(arg, pattern) {
  const location = isNil(arg) ? history.location : toLocation(arg);
  const { pathname } = location;
  if (!pattern) return {};
  const parser = getParser(pattern);

  return parser.match(trimSlashes(pathname)) || {};
}

/**
 * Extracts all parameters from a URL including pathname, query string, hash, and state.
 * Parameters are merged with query and hash parameters taking precedence over pathname parameters.
 *
 * @param {string|Object|null} [arg] - URL string, Location object, or null (defaults to current location)
 * @param {string} [pattern] - URL pattern for extracting pathname parameters (e.g., "/users/:id")
 * @returns {Object} Merged object containing all parameters from all sources
 *
 * @example
 * // URL: http://example.com/users/123?tab=profile#section=info
 * // Pattern: "/users/:id"
 * toParams(null, "/users/:id"); // Returns { id: "123", tab: "profile", section: "info" }
 */
export function toParams(arg, pattern) {
  const location = isNil(arg) ? history.location : toLocation(arg);
  const { search, hash, state = {} } = location;

  const pathParams = toOwnParams(arg, pattern);
  const searchParams = parseQueryOrHash(search);
  const hashParams = parseQueryOrHash(hash);

  return { ...state, ...hashParams, ...searchParams, ...pathParams };
}

/**
 * Converts a destination specification to a URL string.
 * Accepts strings (returned as-is), parameter objects, or updater functions.
 *
 * @param {string|Function|Object} to - Destination specification:
 *   - String: returned as-is
 *   - Object: converted to URL with parameters
 *   - Function: receives current params, returns updated params object
 * @param {string} [pattern] - URL pattern for formatting pathname parameters (e.g., "/users/:id")
 * @returns {string} URL string
 *
 * @example
 * // With string
 * toUrl("/users/123?tab=profile"); // Returns "/users/123?tab=profile"
 *
 * @example
 * // With object
 * toUrl({ id: 123, tab: "profile" }, "/users/:id"); // Returns "/users/123?tab=profile"
 *
 * @example
 * // With updater function
 * toUrl(params => ({ ...params, tab: "settings" }), "/users/:id");
 */
export const toUrl = (to, pattern) => {
  if (typeof to === "string") return to;

  const params = parameterize(to, pattern);
  return stringify(params, pattern);
};
