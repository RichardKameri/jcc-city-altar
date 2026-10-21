import type { Config } from "tailwindcss";
import sharedConfig from "../tailwind.shared";

export default {
  ...sharedConfig,
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./Contacts.tsx",
    "./Feedbacks.tsx",
    "../frontend/src/components/ui/**/*.{ts,tsx}",
    "../frontend/src/lib/**/*.{ts,tsx}",
  ],
  plugins: [require("tailwindcss-animate")],
} satisfies Config;