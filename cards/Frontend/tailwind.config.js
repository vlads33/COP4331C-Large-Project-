/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                gold: "#FFC904",
                knightBlack: "#000000",
                knightGray: "#F5F5F5",
            },
        },
    },
    plugins: [],
};
