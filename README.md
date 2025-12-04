# params-router

_Client-side SPA router that converts URL to and from params_

A lightweight, framework-agnostic JavaScript library for managing URL-based routing in single-page applications. Convert between URL strings and parameter objects, handle navigation events, and synchronize your application state with browser history.

## Why params-router?

**Stop wrestling with URL strings.** Forget string concatenation and manual parsing—params-router automatically converts your entire URL (pathname, query, hash, and state) into a single, clean parameters object based on your URL pattern.

**Change patterns without changing code.** Update your route structure? Just change your pattern definition in one place. No need to update parsing logic scattered throughout your codebase.

**Navigate using objects, not strings.** Pass parameters as JavaScript objects instead of manipulating URL strings. Your navigation code is cleaner, more maintainable, and less error-prone.

**Synchronize effortlessly.** Automatically extract and track parameter changes from the browser URL. Keep your component state synchronized with the URL—the library handles the complexity.

## Features

- **Bidirectional URL Conversion**: Seamlessly convert between URL strings and parameter objects
- **URL Pattern Matching**: Define URL patterns (e.g., `/users/:id`) to extract and format parameters
- **Parameter Merging**: Automatically merge parameters from pathname, query string, hash, and state
- **History Tracking**: Subscribe to location and parameter changes with listener functions
- **Client-side Navigation**: Handle anchor clicks with proper SPA routing
- **Framework Agnostic**: Works with any JavaScript framework or vanilla JS
- **Lightweight**: Minimal dependencies and small bundle size
- **Optional Svelte Store**: Hierarchical routing with automatic parent-child pattern composition (Svelte 3-5)

## Installation

```bash
npm install params-router
```

## Quick Start

```javascript
import { navigate, trackParams, goTo } from "params-router";

// Define your URL pattern
import { setPattern } from "params-router";
setPattern("/users/:id");

// Navigate programmatically
navigate({ id: 123, tab: "profile" });
// Results in: /users/123?tab=profile

// Track parameter changes
const unsubscribe = trackParams((params) => {
  console.log("Current params:", params);
  // { id: "123", tab: "profile" }
});

// Handle anchor clicks
<a href="/users/456?tab=settings" onClick={goTo}>
  View User
</a>;

// Stop listening
unsubscribe();
```

## API Documentation

### `setPattern(pattern)`

Sets the default URL pattern for parameter extraction throughout the application.

**Parameters:**

- `pattern` (string) - URL pattern with named parameters (e.g., `/api/:version/users/:id`)

**Example:**

```javascript
setPattern("/users/:id/posts/:postId");
```

### `toParams(location?, pattern?)`

Extracts all parameters from a URL including pathname, query string, hash, and state.

**Parameters:**

- `location` (string|Object|null) - URL string, Location object, or null for current location
- `pattern` (string) - URL pattern for pathname parameter extraction

**Returns:** Object containing merged parameters from all sources

**Example:**

```javascript
// URL: /users/123?tab=profile#comment=42
// Pattern: /users/:id
toParams(null, "/users/:id");
// Returns: { id: "123", tab: "profile", comment: "42" }
```

### `toOwnParams(location?, pattern?)`

Extracts only the pathname parameters matching the URL pattern.

**Parameters:**

- `location` (string|Object|null) - URL string, Location object, or null for current location
- `pattern` (string) - URL pattern for pathname parameter extraction

**Returns:** Object containing only pathname parameters

**Example:**

```javascript
// URL: /users/123?tab=profile
// Pattern: /users/:id
toOwnParams(null, "/users/:id");
// Returns: { id: "123" }
```

### `toUrl(destination, pattern?)`

Converts a destination specification to a URL string.

**Parameters:**

- `destination` (string|Object|Function) - Destination specification:
  - String: returned as-is
  - Object: converted to URL with parameters
  - Function: receives current params, returns updated params
- `pattern` (string) - URL pattern for formatting pathname parameters

**Returns:** URL string

**Examples:**

```javascript
// String pass-through
toUrl("/users/123?tab=profile"); // '/users/123?tab=profile'

// Object conversion
toUrl({ id: 123, tab: "profile" }, "/users/:id");
// '/users/123?tab=profile'

// Function updater
toUrl((params) => ({ ...params, sort: "asc" }), "/users/:id");
// Updates current params and returns new URL
```

### `navigate(destination, patternOrOptions?, replace?)`

Navigates to a destination URL or parameter object using browser history.

**Parameters:**

- `destination` (string|Object|Function) - Where to navigate
- `patternOrOptions` (string|Object) - URL pattern or options object with `pattern` and `replace` properties
- `replace` (boolean) - If true, replaces history entry instead of pushing

**Examples:**

```javascript
// Simple navigation
navigate("/users/123");

// With parameters and pattern
navigate({ id: 123, tab: "profile" }, "/users/:id");

// With options
navigate((params) => ({ ...params, sort: "asc" }), {
  pattern: "/users/:id",
  replace: true,
});
```

### `goTo(event)`

Event handler for anchor tag clicks to enable client-side routing. Respects modifier keys, target attributes, and non-primary button clicks.

**Parameters:**

- `event` (MouseEvent) - Click event from an anchor element

**Example:**

```javascript
// HTML
<a href="/users/456" onClick={goTo}>View User</a>
<a href="/admin" onClick={goTo} replace>Admin Panel</a>

// React
<a href="/users/456" onClick={goTo}>View User</a>
```

### `trackLocation(callback)`

Subscribes to location changes in browser history.

**Parameters:**

- `callback` (Function) - Receives Location object with `{ pathname, search, hash, state, key }`

**Returns:** Unsubscribe function

**Example:**

```javascript
const unsubscribe = trackLocation((location) => {
  console.log("Navigated to:", location.pathname);
});

// Later: stop listening
unsubscribe();
```

### `trackParams(callback, pattern?)`

Subscribes to parameter changes in browser history.

**Parameters:**

- `callback` (Function) - Receives merged parameters object
- `pattern` (string) - URL pattern for pathname parameter extraction

**Returns:** Unsubscribe function

**Example:**

```javascript
const unsubscribe = trackParams((params) => {
  console.log("Current params:", params);
  // { id: "123", tab: "profile", comment: "42" }
}, "/users/:id");

// Later: stop listening
unsubscribe();
```

## URL Pattern Syntax

URL patterns use the [url-pattern](https://github.com/snd/url-pattern) library syntax:

- `:paramName` - Named parameter that captures path segments
- `*` - Catch-all that matches any path

**Examples:**

```javascript
setPattern("/users/:id"); // Matches: /users/123
setPattern("/posts/:id/comments/:cid"); // Matches: /posts/1/comments/5
setPattern("*"); // Matches any path (default)
```

## Svelte Integration (Optional)

params-router provides an optional Svelte store factory that enables **hierarchical routing** with true separation of concerns. Each Svelte component manages its own routing without knowing its place in the component tree.

### The `routable` Store

The `routable` function creates a reactive store that automatically combines parent and child route patterns, enabling nested routing structures.

**Parameters:**

- `pattern` (string|Object) - Route pattern or configuration

**Returns:** Readable Svelte store containing router state

**Example: Parent-Child Routing**

```svelte
<script>
  // Parent component (admin layout)

  import { routable } from "params-router";

  const adminRouter = routable("/admin");
  // `adminId` will be passed as a query string parameter (?adminId=123)
  $: ({ adminId } = $adminRouter);
</script>

{#if $adminRouter.params.adminId}
  <AdminHeader {adminId} />
  <User {adminId} />
{/if}
```

```svelte
<script>
  // <User /> child component (user management - no knowledge of parent context)

  import { routable } from "params-router";

  // `adminId` could have been extracted from `userRouter`,
  // but this component shouldn't necessarily know about it.
  export let adminId;

  // Pattern is just "/users/:userId", but automatically combines with parent
  // Final pattern becomes: /admin/users/:userId
  // URL: /admin/users/123?adminId=456
  const userRouter = routable("/users/:userId");
  $: ({ userId } = $userRouter);
</script>

{#if $userRouter.params.userId}
  <UserCard {adminId} {userId} />

  <!-- Generate real browser links with href() - supports right-click, open in new tab, etc. -->
  <a href={$userRouter.href({ userId: 789, view: 'details' })}>
    User 789 Details
  </a>

  <a href={$userRouter.href(params => ({ ...params, tab: 'profile' }))}>
    View Profile
  </a>

  <!-- Or navigate programmatically when needed -->
  <button on:click={() => $userRouter.goTo({ userId: 456, tab: 'settings' })}>
    Quick Jump to Settings
  </button>
{/if}
```

### Store Properties

The `routable` store exposes:

- **`params`** - Parameters extracted at this component's routing level
- **`rootParams`** - Parameters from parent routing levels
- **`goTo(destination, options?)`** - Navigate while preserving parent parameters
- **`href(spec)`** - Generate links with full path context
- **`pattern`** - Full combined pattern (parent + own)
- **`rest`** - Unmatched path remainder for further nested routing

### Why Hierarchical Routing?

✨ **Perfect Separation of Concerns** - Components define their own routes without parent knowledge

✨ **DRY Routing** - Update parent routes without changing child components

✨ **Reusable Components** - Use the same component at different path levels—it adapts automatically

**Example: Reusable Component at Different Levels**

```javascript
// This component works the same at /products/:id or /categories/:catId/products/:id
<script>
  import { routable } from "params-router";
  const router = routable("/products/:id");
</script>

<a href={$router.href({ id: 42, tab: "details" })}>Product Details</a>
<button on:click={() => $router.goTo({ id: 42, tab: "reviews" })}>See Reviews</button>
```

### Svelte Versions

Compatible with **Svelte 3, 4, and 5**. Svelte is an optional peer dependency—only install it if you use the `routable` store.

## License

ISC
