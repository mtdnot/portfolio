export const identityLinks = [
  { label: 'ANAG', href: '/anag/' },
  { label: 'Refixa', href: '/refixa/' },
  { label: 'mtdnot', href: '/mtdnot/' },
] as const;

export const externalLinks = [
  { label: 'Wiki', href: 'https://wiki.cycletree.org' },
  { label: 'Scrapbox', href: 'https://scrapbox.io/cycletree/' },
  { label: 'Existree (mtdnot.dev)', href: 'https://mtdnot.dev' },
] as const;

export const moeCounter = {
  alt: 'cycletree visitor counter',
  src: 'https://counter.mtdnot.dev/get/@cycletree?theme=nixietube-1',
} as const;
