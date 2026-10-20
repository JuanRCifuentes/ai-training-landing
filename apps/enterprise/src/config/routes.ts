/** Every internal URL is built here, so a route change touches one file. */
export const routes = {
	home: '/',
	module: (slug: string) => `/modules/${slug}/`,
	legal: (slug: string) => `/legal/${slug}/`,
	/** Share image of a page; `key` is the page path without slashes at the ends, or "home". */
	shareImage: (key: string) => `/og/${key}.png`,
};
