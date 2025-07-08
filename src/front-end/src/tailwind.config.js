/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                unbounded: ['Unbounded', 'sans-serif'],
                libre_franklin: ['Libre Franklin', 'sans-serif'],
            },
            color:{
                "gray-custom" : "#d9d9d9b2",
            },
        },
    },
    plugins: [],
};
