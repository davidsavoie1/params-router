import UrlPattern from "url-pattern";

const DEFAULT_PATTERN = "(*)";

/* Allow changing the default pattern */
let defaultPattern = DEFAULT_PATTERN;

export function setPattern(pattern = DEFAULT_PATTERN) {
  defaultPattern = pattern;
}

/* Parsers (UrlPattern instances) are stored in a map upon usage
 * to avoid recreating new ones each time. */
const parsers = {
  [DEFAULT_PATTERN]: new UrlPattern(DEFAULT_PATTERN),
};

export const getParser = (pattern = defaultPattern) => {
  const parser = parsers[pattern];
  if (parser) return parser;

  const newParser = new UrlPattern(pattern);
  parsers[pattern] = newParser;
  return newParser;
};
