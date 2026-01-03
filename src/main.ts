import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {}
});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/sw.js')
			.then((registration) => {
				console.log(
					'ServiceWorker registration successful with scope: ',
					registration.scope
				);
			})
			.catch((err) => {
				console.log('ServiceWorker registration failed: ', err);
			});
	});
}

export default app;
