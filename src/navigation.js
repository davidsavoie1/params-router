import history from "./history";
import { toUrl } from "./parsing";

/* Convert a `to` destination to URL, then navigate to it,
 * either pushing the new location or replacing the existing one. */
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

/* Anchor click handler that uses client-side navigation.
 * `<a>` tag must have a string `href` attribute
 * and can specify a `replace` boolean attribute.
 * Handles only non-modified primary button click in own navigation target. */
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
