/**
 * @module navigation
 * @description Client-side navigation utilities.
 * Provides functions to navigate within a single-page application and handle
 * anchor click events for client-side routing.
 */

import { history } from "./history";
import { toUrl } from "./parsing";

/**
 * Navigates to a destination URL or parameter object.
 * Converts the destination to a URL string and updates the browser history
 * using either push (default) or replace mode.
 *
 * @param {string|Function|Object} [to=""] - Destination specification:
 *   - String: URL to navigate to
 *   - Object: parameters to convert to URL
 *   - Function: receives current params, returns updated params
 * @param {string|Object} [patternOrOptions] - Either:
 *   - String: URL pattern for parameter extraction (e.g., "/users/:id")
 *   - Object: options object with optional `pattern` and `replace` properties
 * @param {boolean} [replace=false] - If true, replaces current history entry instead of pushing
 *
 * @example
 * navigate("/users/123");
 * navigate({ id: 123, tab: "profile" }, "/users/:id");
 * navigate(params => ({ ...params, sort: "asc" }), { pattern: "/users/:id", replace: true });
 */
export function navigate(to = "", patternOrOptions, replace = false) {
  let pattern = patternOrOptions;
  let _replace = replace;

  /* Second argument might be the `pattern` (for consistency with `toUrl` and `toParams`),
   * or an options object containing `{ pattern, replace }`. */
  if (typeof patternOrOptions === "object") {
    pattern = patternOrOptions.pattern;
    _replace = patternOrOptions.replace;
  }

  const url = toUrl(to, pattern);
  const method = _replace ? history.replace : history.push;
  method(url);
}

/**
 * Event handler for anchor tag clicks that enables client-side navigation.
 * Intercepts clicks on links and performs client-side navigation instead of
 * standard page navigation. Handles edge cases like modifier keys, non-primary
 * button clicks, and target attributes.
 *
 * Respects the following conditions:
 * - Only primary (left) button clicks are handled
 * - Clicks with modifier keys (Cmd, Alt, Ctrl, Shift) are ignored
 * - Links with target attribute other than "_self" are ignored
 * - Clicks on elements without href attribute are ignored
 *
 * @param {MouseEvent} e - Click event from an anchor element
 *
 * @example
 * // In JSX/HTML:
 * <a href="/users/123" onClick={goTo}>View User</a>
 * <a href="/admin" onClick={goTo} replace>Admin Panel</a>
 *
 * @note
 * The anchor element must have:
 * - A string `href` attribute
 * - Optionally a `replace` attribute to use replace mode instead of push
 */
export function goTo(e) {
  const { button, defaultPrevented, currentTarget: el } = e || {};
  if (!el) return;

  const href = el.getAttribute("href");
  const { target } = el;
  const replace = ![false, "false", null, undefined].includes(
    el.getAttribute("replace")
  );
  const isModified = !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);

  if (
    !defaultPrevented &&
    button === 0 && // Only main button clicks
    (!target || target === "_self") && // Let browser handle "target=_blank" etc.
    !isModified // Ignore clicks with modifier keys
  ) {
    e.preventDefault();
    if (typeof href === "string") navigate(href, { replace });
  }
}
