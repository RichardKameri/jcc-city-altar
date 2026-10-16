import type { Config } from "tailwindcss";
import sharedConfig from "../frontend/tailwind.config";

export default {
  ...sharedConfig,
  content: [
    "./index.html",
    "./**/*.{ts,tsx}",
    "../frontend/src/components/ui/**/*.{ts,tsx}",
    "../frontend/src/lib/**/*.{ts,tsx}",
  ],
} satisfies Config;