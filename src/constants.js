/**
 * Human‑readable application name used in the UI and metadata.
 * @type {string}
 */
export const APP_NAME = "OPEN NOTES";

/**
 * Publication mode flag.
 * true  → only include markdown files with frontmatter `publish: true`.
 * false → include all files regardless of the `publish` flag.
 * @type {boolean}
 */
export const PUBLISH_MODE = true;

/**
 * Folder names under `src/vault` that are ignored during content scanning.
 * @type {string[]}
 */
export const EXCLUDE_FOLDER = ["Templates", "Clippings", "Bases"];
