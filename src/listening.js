import history from "./history";
import { toParams } from "./parsing";

/* Setup a listener that will pass the current location
 * to a function each time it changes.
 * Returns a function that will stop the listener. */
export function trackLocation(fn) {
  /* Run the function once */
  fn(history.location);

  const unlisten = history.listen(fn);
  return unlisten;
}

/* Setup a listener that will pass the current params
 * to a function each time it changes.
 * Returns a function that will stop the listener. */
export function trackParams(fn, pattern) {
  /* Run the function once */
  fn(toParams(null, pattern));

  const unlisten = history.listen((location) => {
    const params = toParams(location, pattern);
    fn(params);
  });

  return unlisten;
}
