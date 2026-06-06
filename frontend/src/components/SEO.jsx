import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Zosouq'
const SITE_URL = 'https://www.zosouq.com'
const DEFAULT_IMAGE = `${SITE_URL}/images/luxury-perfumes.webp`
const DEFAULT_DESC = 'Shop 4,400+ authentic perfumes, makeup, skincare & hair care products. Same-day delivery across all Kuwait. Free delivery on orders over KD 10. Cash on delivery.'

// Organization schema
const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Zosouq',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/images/luxury-perfumes.webp`,
    width: 512,
    height: 512,
  },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', areaServed: 'KW', availableLanguage: ['English', 'Arabic'] },
  sameAs: [
    'https://www.instagram.com/zosouq',
    'https://www.facebook.com/zosouq',
  ],
}

// WebSite schema — enables Google Sitelinks Searchbox
const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Zosouq',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// SiteNavigationElement — tells Google about the main nav links for sitelinks
const NAV_LD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Main Navigation',
  itemListElement: [
    { '@type': 'SiteLinksSearchBox', target: `${SITE_URL}/search?q=` },
    { '@type': 'ListItem', position: 1, name: 'Perfumes', url: `${SITE_URL}/category/perfumes`, description: 'Shop authentic Arabian ouds and designer perfumes in Kuwait' },
    { '@type': 'ListItem', position: 2, name: 'Makeup', url: `${SITE_URL}/category/makeup`, description: 'Premium foundations, lipsticks, eyeshadows and more' },
    { '@type': 'ListItem', position: 3, name: 'Hair Care', url: `${SITE_URL}/category/hair-care`, description: 'Professional shampoos, conditioners and treatments' },
    { '@type': 'ListItem', position: 4, name: 'Body Care', url: `${SITE_URL}/category/body-care`, description: 'Luxury body scrubs, lotions and spa essentials' },
    { '@type': 'ListItem', position: 5, name: 'Personal Care', url: `${SITE_URL}/category/personal-care`, description: 'Skincare serums, cleansers and daily essentials' },
  ],
}

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  path = '',
  type = 'website',
  noIndex = false,
  jsonLd = null,
  keywords = '',
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Same-Day Beauty & Perfume Delivery in Kuwait`
  const normalizedPath = path === '/' ? '/' : `/${String(path || '').replace(/^\/+/, '')}`
  const canonicalUrl = `${SITE_URL}${normalizedPath}`
  const absImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absImage} />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_KW" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />
      <meta name="twitter:image:alt" content={title || SITE_NAME} />

      {/* Geo tags for Kuwait */}
      <meta name="geo.region" content="KW" />
      <meta name="geo.placename" content="Kuwait" />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(ORG_LD)}</script>
      <script type="application/ld+json">{JSON.stringify(WEBSITE_LD)}</script>
      {path === '/' && <script type="application/ld+json">{JSON.stringify(NAV_LD)}</script>}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
