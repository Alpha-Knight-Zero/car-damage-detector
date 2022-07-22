/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	darkMode: 'media', // or 'media' or 'class'
	theme: {
		extend: { screens: { '3xl': '2000px' } },
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
