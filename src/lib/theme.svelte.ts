import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

const initialTheme: Theme = browser
	? localStorage.getItem('theme') === 'light'
		? 'light'
		: 'dark'
	: 'dark';

let theme = $state<Theme>(initialTheme);

export function getTheme(): Theme {
	return theme;
}

export function toggleTheme() {
	theme = theme === 'dark' ? 'light' : 'dark';
}
