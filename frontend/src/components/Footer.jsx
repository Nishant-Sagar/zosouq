import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const CATEGORIES = [
  ['perfumes', 'perfumes'],
  ['makeup', 'makeup'],
  ['hair_care', 'hair-care'],
  ['body_care', 'body-care'],
  ['personal_care', 'personal-care'],
]

const LINKS = [
  { labelKey: 'home', to: '/' },
  { labelKey: 'cart', to: '/cart' },
  { labelKey: 'my_orders', to: '/my-orders' },
  { labelKey: 'wishlist', to: '/wishlist' },
]

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-gray-900 text-gray-300 pb-16 sm:pb-0">
      <div className="h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

      {/* ── Mobile footer — compact single column ── */}
      <div className="sm:hidden px-4 py-5">
        {/* Logo + tagline */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="text-xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Zosouq
          </Link>
          <div className="flex gap-2">
            {[
              { abbr: 'F', color: 'hover:bg-blue-600' },
              { abbr: 'I', color: 'hover:bg-pink-600' },
              { abbr: 'X', color: 'hover:bg-sky-500' },
            ].map(s => (
              <a key={s.abbr} href="#"
                className={`w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-[11px] font-bold text-gray-400 hover:text-white transition-all ${s.color}`}>
                {s.abbr}
              </a>
            ))}
          </div>
        </div>

        {/* Links in two compact columns */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
          {[...LINKS, ...CATEGORIES.map(([labelKey, slug]) => ({ labelKey, to: `/category/${slug}` }))].map(l => (
            <Link key={l.labelKey} to={l.to}
              className="text-xs text-gray-400 hover:text-pink-400 transition-colors truncate">
              {t(l.labelKey)}
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
          <p className="text-[11px] text-gray-600 flex items-center gap-1">
            © 2025 Zosouq <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500" /> Kuwait
          </p>
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-500 border border-gray-700">{t('cash_on_delivery')}</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-500 border border-gray-700">{t('same_day')}</span>
          </div>
        </div>
      </div>

      {/* ── Desktop footer — full layout ── */}
      <div className="hidden sm:block max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>Zosouq</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              {t('footer_description')}
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 {t('kuwait_city')}</li>
              <li>✉️ support@zosouq.com</li>
              <li>📞 +965 XXXX XXXX</li>
            </ul>
            <div className="flex gap-3 mt-5">
              {[
                { abbr: 'F', color: 'hover:bg-blue-600' },
                { abbr: 'I', color: 'hover:bg-pink-600' },
                { abbr: 'X', color: 'hover:bg-sky-500' },
              ].map(s => (
                <a key={s.abbr} href="#"
                  className={`w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition-all ${s.color}`}>
                  {s.abbr}
                </a>
              ))}
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{t('links')}</h4>
            <ul className="space-y-2.5">
              {LINKS.map(l => (
                <li key={l.labelKey}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-pink-400 transition-colors">{t(l.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{t('categories')}</h4>
            <ul className="space-y-2.5">
              {CATEGORIES.map(([nameKey, slug]) => (
                <li key={slug}>
                  <Link to={`/category/${slug}`} className="text-sm text-gray-400 hover:text-pink-400 transition-colors">{t(nameKey)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            © 2025 Zosouq. Made with <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> in Kuwait
          </p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 border border-gray-700">{t('cash_on_delivery')}</span>
            <span className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 border border-gray-700">{t('same_day')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
