const cycletreeHosts = new Set(['cycletree.org', 'www.cycletree.org']);

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (cycletreeHosts.has(url.hostname) && (url.pathname === '/' || url.pathname === '/index.html')) {
    url.pathname = '/cycletree_portfolio/';
    return context.next(new Request(url, context.request));
  }

  return context.next();
}
