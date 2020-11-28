import qs from "query-string";
import history from "./history";
import { getParser } from "./router";
import { isNil, omit, pick } from "./util";

const LEAD_TRAIL_SLASHES_REGEX = /^(\/+)\/|\/+$/;
/* Remove all leading/trailing slashes but the one at the first character position */
const trimSlashes = (str) => str.replace(LEAD_TRAIL_SLASHES_REGEX, "");

const parseQueryOrHash = (str) =>
  qs.parse(str, { parseNumbers: true, parseBooleans: true });

const toLocation = (arg) => {
  if (typeof arg === "object") return arg;
  if (typeof arg !== "string") return {};
  return new URL(arg);
};

const getCurrParams = (pattern) => toParams(history.location, pattern);

const parameterize = (to, pattern) => {
  if (typeof to === "object") return to;

  const currParams = getCurrParams(pattern);
  if (typeof to === "function") return to(currParams);
  return currParams;
};

function stringify(params, pattern) {
  const parser = getParser(pattern);
  const pathnameKeys = parser.names;
  const pathnameParams = { _: "", ...pick(pathnameKeys, params) };

  const pathname = parser.stringify(pathnameParams) || "/";
  const search = qs.stringify(omit(pathnameKeys, params));

  return pathname + (search ? `?${search}` : "");
}

/* Convert a URL string into a map of parameters,
 * taking into account pathname, search, hash and state. */
export function toParams(arg, pattern) {
  const location = isNil(arg) ? history.location : toLocation(arg);
  const { pathname, search, hash, state = {} } = location;
  const parser = getParser(pattern);

  const pathParams = parser.match(trimSlashes(pathname)) || {};
  const searchParams = parseQueryOrHash(search);
  const hashParams = parseQueryOrHash(hash);

  return { ...state, ...hashParams, ...searchParams, ...pathParams };
}

/* Convert a string, function or object to a URL string
 * according to specified pattern (or default one). */
export const toUrl = (to, pattern) => {
  if (typeof to === "string") return to;

  const params = parameterize(to, pattern);
  return stringify(params, pattern);
};
