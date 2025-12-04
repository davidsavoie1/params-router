/**
 * @module util
 * @description Utility functions for common operations.
 * Helper functions for null checking and object property manipulation.
 */

/**
 * Checks if a value is null or undefined.
 * @param {*} x - Value to check
 * @returns {boolean} True if x is null or undefined
 * @private
 */
export const isNil = (x) => [undefined, null].includes(x);

/**
 * Creates a new object containing only properties whose keys are NOT in the provided array.
 * @param {Array<string>} keys - Keys to exclude from the result
 * @param {Object} obj - Source object
 * @returns {Object} New object with excluded properties removed
 * @private
 *
 * @example
 * omit(["id", "name"], { id: 1, name: "John", age: 30 });
 * // Returns: { age: 30 }
 */
export function omit(keys, obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k))
  );
}

/**
 * Creates a new object containing only properties whose keys are in the provided array.
 * @param {Array<string>} keys - Keys to include in the result
 * @param {Object} obj - Source object
 * @returns {Object} New object with only specified properties
 * @private
 *
 * @example
 * pick(["id", "name"], { id: 1, name: "John", age: 30 });
 * // Returns: { id: 1, name: "John" }
 */
export function pick(keys, obj) {
  return Object.fromEntries(keys.map((k) => [k, obj[k]]));
}
