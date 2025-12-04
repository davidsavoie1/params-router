/**
 * @module router
 * @description URL pattern matching and parser management.
 * Handles URL pattern configuration and maintains a cache of compiled
 * UrlPattern instances to optimize pattern matching performance.
 */

import UrlPattern from "url-pattern";

/** @constant {string} DEFAULT_PATTERN - Default catch-all URL pattern */
const DEFAULT_PATTERN = "(*)";

/** @type {string} Current default pattern used for URL parsing */
let defaultPattern = DEFAULT_PATTERN;

/**
 * Sets the default URL pattern for parameter extraction.
 * This pattern will be used for all parsing operations that don't specify
 * a custom pattern.
 *
 * @param {string} [pattern=DEFAULT_PATTERN] - The URL pattern to use (e.g., "/users/:id")
 * @example
 * setPattern("/api/:version/users/:id");
 */
export function setPattern(pattern = DEFAULT_PATTERN) {
  defaultPattern = pattern;
}

/**
 * Cache of compiled UrlPattern instances keyed by pattern string.
 * Parsers are created once and reused to avoid the overhead of
 * recreating them on each parse operation.
 * @type {Object<string, UrlPattern>}
 * @private
 */
const parsers = {
  [DEFAULT_PATTERN]: new UrlPattern(DEFAULT_PATTERN),
};

/**
 * Retrieves or creates a UrlPattern parser for the specified pattern.
 * Parsers are cached to improve performance on repeated usage.
 *
 * @param {string} [pattern=defaultPattern] - The URL pattern to parse with
 * @returns {UrlPattern} Compiled URL pattern parser instance
 * @private
 */
export const getParser = (pattern = defaultPattern) => {
  const parser = parsers[pattern];
  if (parser) return parser;

  const newParser = new UrlPattern(pattern);
  parsers[pattern] = newParser;
  return newParser;
};
