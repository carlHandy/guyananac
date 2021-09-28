require("dotenv").config();
const enablePurge = process.env.ENABLE_PURGE === "true";
module.exports = {
  purge: {
    enabled: true,
    content: ["./src/**/*.html", "./src/**/*.scss"],
  },
  darkMode: false,
  theme: {
    extend: {},
    colors: {
      primary: "var(--color-primary)",
      accent: "var(--color-accent)",
      secondary: "var(--color-secondary)",

      grey: "var(--color-grey)",
      "light-grey": "var(--color-light-grey)",
      "light-yellow": "var(--color-light-yellow)",
      "light-blue": "var(--color-light-blue)",
      "light-blue-2": "var(--color-light-blue-2)",
      "light-blue-3": "var(--color-light-blue-3)",

      warn: "var(--color-warn)",
      success: "var(--color-success)",
      alert: "var(--color-alert)",
      info: "var(--color-info)",

      white: "var(--color-white)",
      black: "var(--color-black)",

      "auction-upcoming": "var(--color-auction-upcoming)",
      "auction-live": "var(--color-auction-live)",
      "auction-completed": "var(--color-auction-completed)",
      "auction-closed": "var(--color-auction-closed)",
      "auction-pending": "var(--color-auction-pending)",
      "auction-past": "var(--color-auction-past)",
      "auction-future": "var(--color-auction-future)",
      "auction-pickup-completed": "var(--color-auction-pickup-completed)",
      "auction-cancelled": "var(--color-auction-cancelled)",

      "report-bids": "var(--color-report-bids)",
      "report-views": "var(--color-report-views)",
      "report-count": "var(--color-report-count)",
      "report-sells": "var(--color-report-sells)",
    },
    boxShadow: {
      sm: "0 1px 2px 0 #ADB6D92C",
      DEFAULT: "0 0 15px 0 rgba(0, 0, 0, 0.15)",
      md: "0 4px 6px -1px #ADB6D92C, 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px #ADB6D92C, 0 4px 6px -2px #ADB6D92C",
      xl: "0 20px 25px -5px #ADB6D92C, 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px -12px #ADB6D92C",
      "3xl": "0 35px 60px -15px #ADB6D92C",
      inner: "inset 0 2px 4px 0 #ADB6D92C",
      none: "none",
    },
  },
  variants: {
    extend: {
      display: ["group-hover"],
      fontWeight: ["hover"],
      inset: ["group-hover"],
    },
  },
  plugins: [],
};
