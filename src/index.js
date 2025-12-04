/**
 * @module params-router
 * @description Client-side SPA router that converts URL to and from params.
 * This module provides utilities for managing URL patterns, parsing parameters,
 * and navigating within single-page applications with URL state synchronization.
 */

export { trackLocation, trackParams } from "./listening";
export { goTo, navigate } from "./navigation";
export { toOwnParams, toParams, toUrl } from "./parsing";
export { setPattern } from "./router";
export { history } from "./history";
export { routable } from "./routable";
