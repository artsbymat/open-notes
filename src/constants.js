/**
 * Human‑readable application name used in the UI and metadata.
 * @type {string}
 */
export const APP_NAME = "Open Notes";

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

export const FULLNAME = "Rahmat Ardiansyah";

export const METADATA = {
  title: {
    default: `${FULLNAME} - ${APP_NAME}`,
    template: `%s - ${APP_NAME}`
  },
  description: `${APP_NAME} adalah tempat berbagi catatan, mind mapping, dan proyek. Di sinilah ide-ide ditanam, dihubungkan, dan tumbuh perlahan menjadi sesuatu yang bermakna.`,
  keywords: [
    "Rahmat Ardiansyah",
    "Rahmat",
    "Personal Knowladge Management",
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Developer"
  ]
};
