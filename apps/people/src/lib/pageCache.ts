// Pages linked from the current page are fetched once, while the browser is
// idle, as their links scroll into view. The client router then swaps in that
// copy, so following a link needs no network at all. Copies last for the tab's
// session; anything not cached, or any failure, goes through Astro's loader.
// Cached copies can outlive a deploy. That is safe while every page shares the
// one /_astro script the tab already loaded and inlines its CSS (astro.config);
// a page with its own /_astro script or stylesheet could reference a file the
// new deploy deleted.
// Internal links all end in a slash (see config/routes), so a path is its key.
const idle = window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 0));
const pages = new Map<string, Promise<string>>();

const load = (path: string) => {
	let page = pages.get(path);
	if (!page) {
		page = fetch(path).then((response) => {
			if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error(`Prefetch failed: ${path}`);
			return response.text();
		});
		page.catch(() => pages.delete(path));
		pages.set(path, page);
	}
	return page;
};

const cacheable = (link: HTMLAnchorElement) =>
	link.origin === location.origin && !link.target && !link.hasAttribute('download') && !('astroReload' in link.dataset) && link.pathname !== location.pathname;

let observer: IntersectionObserver | undefined;
document.addEventListener('astro:page-load', () => {
	observer?.disconnect();
	const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
	if (connection?.saveData || connection?.effectiveType?.includes('2g')) return;
	observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue;
			observer!.unobserve(entry.target);
			const { pathname } = entry.target as HTMLAnchorElement;
			idle(() => void load(pathname).catch(() => {}), { timeout: 1000 });
		}
	});
	document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => cacheable(link) && observer!.observe(link));
});

document.addEventListener('astro:before-preparation', (event) => {
	const page = !event.formData && !event.to.search && pages.get(event.to.pathname);
	if (!page) return;
	const defaultLoader = event.loader;
	event.loader = async () => {
		try {
			const html = await page;
			if (event.signal.aborted) return;
			const next = new DOMParser().parseFromString(html, 'text/html');
			// Like Astro's own loader: DOMParser runs no scripts, so it would apply <noscript> content.
			next.querySelectorAll('noscript').forEach((element) => element.remove());
			event.newDocument = next;
		} catch {
			if (!event.signal.aborted) await defaultLoader();
		}
	};
});
