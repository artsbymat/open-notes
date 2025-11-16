import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

export const rehypeExpressiveCodeOptions = {
  themes: ["gruvbox-light-soft"],
  plugins: [pluginLineNumbers()],
  defaultProps: {
    showLineNumbers: false
  },

  frames: false
};
