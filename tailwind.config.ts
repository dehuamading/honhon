import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 好感度颜色
        affection: {
          danger: "#ef4444",   // <0 红色
          warning: "#f97316",  // 0-39 橙色
          caution: "#eab308", // 40-79 黄色
          safe: "#22c55e",     // 80+ 绿色
        },
        // 对话气泡颜色
        bubble: {
          ai: "#ffffff",
          user: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
