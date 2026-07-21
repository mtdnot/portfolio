const BOT_UA_PATTERN =
  /bot|crawler|spider|preview|slurp|curl|wget|headless|facebookexternalhit|discordbot|slackbot|telegrambot/i;
const COUNTER_COOKIE_TTL_SECONDS = 60 * 60 * 6;

function buildSvg(counterName, value) {
  const escapedName = counterName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const digits = String(value).padStart(6, '0');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="64" viewBox="0 0 320 64" role="img" aria-labelledby="title desc">
  <title id="title">Moe Counter for ${escapedName}</title>
  <desc id="desc">Visitor count ${digits}</desc>
  <defs>
    <linearGradient id="panel" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#f6ecf7"/>
      <stop offset="100%" stop-color="#ead8eb"/>
    </linearGradient>
    <linearGradient id="digit" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#fffafc"/>
      <stop offset="100%" stop-color="#f2d5e6"/>
    </linearGradient>
  </defs>
  <rect width="320" height="64" rx="12" fill="url(#panel)" stroke="#c28bb0" stroke-width="2"/>
  <text x="18" y="23" fill="#7f4d73" font-family="'Courier New', monospace" font-size="12" letter-spacing="1.2">Moe Counter!</text>
  <text x="18" y="44" fill="#9b6b8f" font-family="'Courier New', monospace" font-size="11">${escapedName}</text>
  ${digits
    .split('')
    .map(
      (digit, index) => `
  <g transform="translate(${172 + index * 22} 12)">
    <rect width="18" height="40" rx="4" fill="url(#digit)" stroke="#c28bb0" stroke-width="1.5"/>
    <text x="9" y="27" text-anchor="middle" fill="#5f3656" font-family="'Courier New', monospace" font-size="22">${digit}</text>
  </g>`,
    )
    .join('')}
</svg>`.trim();
}

async function ensureSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS counters (
      name TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);
}

function getCookieValue(cookieHeader, name) {
  if (!cookieHeader) {
    return null;
  }

  const prefix = `${name}=`;
  for (const part of cookieHeader.split(/;\s*/)) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }

  return null;
}

function makeCookieName(counterName) {
  const safe = counterName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `mc_${safe}`;
}

async function readCounter(db, counterName) {
  const result = await db
    .prepare('SELECT value FROM counters WHERE name = ?')
    .bind(counterName)
    .first();

  return Number(result?.value ?? 0);
}

async function incrementCounter(db, counterName, nowIso) {
  await db
    .prepare(
      `
      INSERT INTO counters (name, value, updated_at)
      VALUES (?, 1, ?)
      ON CONFLICT(name) DO UPDATE SET
        value = value + 1,
        updated_at = excluded.updated_at
      `,
    )
    .bind(counterName, nowIso)
    .run();

  return readCounter(db, counterName);
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const rawCounter = typeof params.counter === 'string' ? params.counter : '';
  const counterName = rawCounter.trim();

  if (!counterName.startsWith('@') || counterName.length < 2) {
    return new Response('Not Found', { status: 404 });
  }

  await ensureSchema(env.portfolio_counter);

  const cookieName = makeCookieName(counterName);
  const cookieValue = getCookieValue(request.headers.get('cookie'), cookieName);
  const userAgent = request.headers.get('user-agent') ?? '';
  const now = Math.floor(Date.now() / 1000);
  const nowIso = new Date().toISOString();
  const hasFreshCookie = cookieValue && Number(cookieValue) + COUNTER_COOKIE_TTL_SECONDS > now;
  const shouldSkipCount = BOT_UA_PATTERN.test(userAgent) || hasFreshCookie;

  const value = shouldSkipCount
    ? await readCounter(env.portfolio_counter, counterName)
    : await incrementCounter(env.portfolio_counter, counterName, nowIso);

  const headers = new Headers({
    'content-type': 'image/svg+xml; charset=utf-8',
    'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
    'x-robots-tag': 'noindex',
  });

  if (!shouldSkipCount) {
    headers.append(
      'set-cookie',
      `${cookieName}=${now}; Max-Age=${COUNTER_COOKIE_TTL_SECONDS}; Path=/; SameSite=Lax; Secure`,
    );
  }

  return new Response(buildSvg(counterName, value), { headers });
}
