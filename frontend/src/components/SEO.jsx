import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Zosouq'
const SITE_URL = 'https://www.zosouq.com'
const DEFAULT_IMAGE = `${SITE_URL}/images/luxury-perfumes.webp`
const DEFAULT_DESC = 'Shop 4,400+ authentic perfumes, makeup, skincare & hair care products. Same-day delivery across all Kuwait. Free delivery on orders over KD 10. Cash on delivery.'

const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Zosouq',
  url: SITE_URL,
  logo: `${SITE_URL}/images/luxury-perfumes.webp`,
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', areaServed: 'KW' },
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
  const canonicalUrl = `${SITE_URL}${path}`
  const absImage = image.startsWith('http') ? image : `${SITE_URL}${image}`

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
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

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(ORG_LD)}</script>
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
