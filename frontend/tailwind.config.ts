import type { Config } from "tailwindcss";
import sharedConfig from "../tailwind.shared";

export default {
  ...sharedConfig,
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
