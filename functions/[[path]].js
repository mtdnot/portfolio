const cycletreeHosts = new Set(['cycletree.org', 'www.cycletree.org']);

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!cycletreeHosts.has(url.hostname)) {
    return context.next();
  }

  if (url.pathname === '/found' || url.pathname === '/found/') {
    return new Response('Not Found', { status: 404 });
  }

  if (url.pathname.startsWith('/found/')) {
    return new Response('Not Found', { status: 404 });
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    url.pathname = '/cycletree/';
    return context.next(new Request(url, context.request));
  }

  if (url.pathname === '/cycletree' || url.pathname === '/cycletree/') {
    return context.next();
  }

  if (url.pathname === '/cycletree_portfolio' || url.pathname === '/cycletree_portfolio/') {
    return Response.redirect(`${url.origin}/`, 301);
  }

  if (url.pathname.startsWith('/cycletree_portfolio/')) {
    url.pathname = url.pathname.replace('/cycletree_portfolio/', '/cycletree/');
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
