/**
 * Zosouq web server — static SPA server with OG tag injection for social bots
 */
const http = require('http')
const fs   = require('fs')
const path = require('path')

const PORT = 4589
const ROOT = __dirname

const MIME = {
  '.html' : 'text/html; charset=utf-8',
  '.js'   : 'application/javascript',
  '.css'  : 'text/css',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.jpeg' : 'image/jpeg',
  '.webp' : 'image/webp',
  '.svg'  : 'image/svg+xml',
  '.ico'  : 'image/x-icon',
  '.json' : 'application/json',
  '.txt'  : 'text/plain',
  '.xml'  : 'application/xml',
  '.tsv'  : 'text/tab-separated-values',
  '.gif'  : 'image/gif',
  '.woff' : 'font/woff',
  '.woff2': 'font/woff2',
}

const BOT_UA = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|Googlebot|bingbot|Slackbot|Discordbot|Pinterest|SkypeUriPreview|Applebot|MetaInspector/i
const SITE   = 'https://www.zosouq.com'
const API    = 'http://127.0.0.1:8000'

function sendFile(res, filePath) {
  try {
    const data = fs.readFileSync(filePath)
    const ext  = path.extname(filePath).toLowerCase()
    const ct   = MIME[ext] || 'application/octet-stream'
    const cc   = ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': cc })
    res.end(data)
  } catch {
    sendIndex(res)
  }
}

function sendIndex(res) {
  try {
    const data = fs.readFileSync(path.join(ROOT, 'index.html'))
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
    res.end(data)
  } catch (e) {
    res.writeHead(500)
    res.end('Error loading app: ' + e.message)
  }
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function sendOG(res, product) {
  const img   = (product.image_url || '').startsWith('http') ? product.image_url : SITE + (product.image_url || '')
  const title = product.brand ? `${product.name} by ${product.brand}` : product.name
  const desc  = (product.description || `Buy ${product.name} in Kuwait. Same-day delivery. Free on orders over KD 10.`).slice(0, 300)
  const price = Number(product.price || 0).toFixed(3)
  const link  = `${SITE}/product/${product.slug}`
  const html  = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Zosouq</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Zosouq">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="800">
<meta property="og:url" content="${esc(link)}">
<meta property="product:price:amount" content="${price}">
<meta property="product:price:currency" content="KWD">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
</head><body><h1>${esc(title)}</h1><p>KD ${price}</p><a href="${esc(link)}">View on Zosouq</a></body></html>`
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
}

function proxyToApi(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: '127.0.0.1:8000' },
  }
  const proxy = http.request(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers)
    apiRes.pipe(res)
  })
  proxy.on('error', () => { res.writeHead(502); res.end('API unavailable') })
  req.pipe(proxy)
}

const server = http.createServer((req, res) => {
  let pathname = (req.url || '/').split('?')[0]
  try { pathname = decodeURIComponent(pathname) } catch {}
  const ua = req.headers['user-agent'] || ''

  // 0. Proxy /api, /static, and /sitemap.xml to FastAPI backend
  if (pathname.startsWith('/api/') || pathname.startsWith('/static/') || pathname === '/sitemap.xml') {
    return proxyToApi(req, res)
  }

  // 1. Try to serve a real file
  const fp = path.join(ROOT, pathname)
  try {
    if (fs.statSync(fp).isFile()) return sendFile(res, fp)
  } catch {}

  // 2. Product page + social bot → inject OG tags
  const m = pathname.match(/^\/product\/([^/?#]+)$/)
  if (m && BOT_UA.test(ua)) {
    fetch(`${API}/api/products/${m[1]}`)
      .then(r => r.ok ? r.json() : null)
      .then(p => p ? sendOG(res, p) : sendIndex(res))
      .catch(() => sendIndex(res))
    return
  }

  // 3. SPA fallback
  sendIndex(res)
})

server.listen(PORT, '127.0.0.1', () => console.log(`Zosouq server running on port ${PORT}`))
