/**
 * @module routable
 * @description Svelte store factory for hierarchical URL-based routing.
 *
 * Creates a reactive store that manages URL parameters in a hierarchical component tree.
 * Each routable instance automatically inherits its parent's URL pattern and parameters,
 * enabling true separation of concerns—child components manage their own routing without
 * knowing where they're used in the component hierarchy.
 *
 * @example
 * // Parent component: /admin/:adminId
 * <script>
 *   import { routable } from 'params-router';
 *   const adminRouter = routable('/admin/:adminId');
 * </script>
 * <AdminPanel router={$adminRouter} />
 *
 * @example
 * // Child component: automatically inherits parent pattern
 * <script>
 *   import { routable } from 'params-router';
 *   // Even though pattern is just '/users/:userId', it combines with parent
 *   // Final pattern becomes: /admin/:adminId/users/:userId
 *   const userRouter = routable('/users/:userId');
 * </script>
 * <UserDetail router={$userRouter} />
 *
 * The store provides:
 * - **params**: Current parameters at this level
 * - **goTo()**: Navigate while preserving parent parameters
 * - **href()**: Generate href while preserving full path
 * - **pattern**: Combined pattern (parent + own)
 * - **rootParams**: Parameters from parent level
 */

import { getContext, setContext } from "svelte";
import { derived, readable } from "svelte/store";
import { history } from "./history";
import { toOwnParams, toParams, toUrl } from "./parsing";
import { navigate } from "./navigation";

const CONTEXT_NAME = "routable";

/**
 * Creates a hierarchical router store for Svelte components.
 *
 * Automatically detects parent router context and combines patterns, enabling
 * nested routing where child components are unaware of their position in the
 * component tree.
 *
 * Compatible with Svelte 3, 4, and 5.
 *
 * @param {string|Object} [stringOrOptions=""] - Route pattern or configuration:
 *   - string: URL pattern (e.g., "/users/:id/posts/:postId")
 *   - object: {params: ["id", "postId"]} - generates pattern from param names
 * @returns {import('svelte/store').Readable} Reactive store containing router state
 *
 * @example
 * // Simple pattern
 * const router = routable('/products/:productId');
 *
 * @example
 * // Using params array
 * const router = routable({ params: ['id', 'tab'] });
 * // Generates pattern: (/:id)(/:tab)
 *
 * @throws {Error} If Svelte context is not available (must be called in component init)
 */
export function routable(stringOrOptions = "") {
  const ownPattern = toPattern(stringOrOptions);

  // Get parent router context, or create root context with browser history
  const { location: loc_, router: parent_ } = getContext(CONTEXT_NAME) || {
    location: readable(history.location, history.listen),
    router: readable({
      ownPattern: "",
      rootPattern: "",
    }),
  };

  /**
   * Derived store that combines parent and own patterns to create the full routing context.
   * Reactively updates whenever location or parent router changes.
   */
  const router = derived([loc_, parent_], ([loc, parent]) => {
    // Combine parent's root pattern with this router's own pattern
    const rootPattern = [parent.rootPattern, ownPattern].join("");
    const pattern = `${rootPattern}(*)`;

    // Extract parameters: own params (excluding catch-all) and parent's root params
    const { _: rest = "", ...params } = toParams(loc, pattern);
    const { _, ...rootParams } = toOwnParams(loc, `${rootPattern}(*)`);

    return {
      /**
       * Navigate to a destination, automatically preserving parent parameters.
       *
       * @param {string|Object|Function} to - Destination:
       *   - string: URL to navigate to
       *   - object: parameters to navigate to (merged with parent params)
       *   - function: receives current params, returns updated params
       * @param {Object} [options] - Navigation options
       * @param {boolean} [options.replace] - Replace history instead of push
       *
       * @example
       * $router.goTo({ userId: 123, tab: 'profile' });
       *
       * @example
       * $router.goTo(params => ({ ...params, page: 2 }));
       */
      goTo: (to, options) => {
        // Merge parent's root parameters with navigation argument
        const navArg =
          typeof to === "object" ? { ...parent.rootParams, ...to } : to;
        navigate(navArg, { pattern, ...options });
      },

      /**
       * Generate an href for a link, automatically including all parent and own parameters.
       *
       * @param {string|Object|Function} arg - Href specification:
       *   - string: returned as-is (for absolute URLs)
       *   - object: parameters to generate href from
       *   - function: receives merged params, returns updated params
       * @returns {string} Complete href with all parameters
       *
       * @example
       * <a href={$router.href({userId: 456})}>Go to user</a>
       *
       * @example
       * <a href={$router.href(params => ({...params, sort: 'asc'}))}>Sort ascending</a>
       */
      href: (arg) => {
        const toHref = {
          function: (fn) => {
            const allParams = { ...parent.rootParams, ...params };
            return toUrl(fn(allParams), pattern);
          },

          object: (newParams) => {
            return toUrl({ ...parent.rootParams, ...newParams }, pattern);
          },
        }[typeof arg];

        return toHref ? toHref(arg) : arg;
      },

      /**
       * The URL pattern for this router level (without parent patterns).
       * @type {string}
       */
      ownPattern,

      /**
       * Parameters extracted at this router level (excludes parent parameters).
       * @type {Object}
       */
      params,

      /**
       * Parent router state. Access parent's params via rootParams or parent.params.
       * Enables multi-level routing inspection.
       * @type {Object}
       */
      parent,

      /**
       * Complete combined pattern including all parent patterns.
       * @type {string}
       */
      pattern,

      /**
       * Parameters extracted at the parent level of this router.
       * Useful when you need to reference parent route parameters.
       * @type {Object}
       */
      rootParams,

      /**
       * Complete root pattern combining all ancestor patterns up to this level.
       * @type {string}
       */
      rootPattern,

      /**
       * Catch-all remainder of the URL not matched by the pattern.
       * Useful for further nested routing or detecting unmatched path segments.
       * @type {string}
       */
      rest,
    };
  });

  // Store this router's context for child components to access
  setContext(CONTEXT_NAME, { location: loc_, router });

  return router;
}

/**
 * Converts a string or configuration object into a URL pattern.
 *
 * @param {string|Object} stringOrOptions - Pattern or config
 * @returns {string} Formatted URL pattern
 * @private
 *
 * @example
 * toPattern("/users/:id"); // Returns "/users/:id"
 * toPattern({params: ["id", "tab"]}); // Returns "(/:id)(/:tab)"
 */
function toPattern(stringOrOptions) {
  if (typeof stringOrOptions === "string") return stringOrOptions;
  const { params = [] } = stringOrOptions;
  if (params.length < 1) return "";
  return params.map((param) => `(/:${param})`).join("");
}
