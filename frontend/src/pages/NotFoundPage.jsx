import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import SEO from '../components/SEO'
import { useLanguage } from '../context/LanguageContext'

export default function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SEO title="Page Not Found" noIndex={true} />
      <div className="text-center max-w-lg">
        <div className="text-8xl font-black text-gray-100 mb-4 select-none">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>{t('page_not_found')}</h1>
        <p className="text-gray-500 mb-10">
          {t('page_not_found_sub')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-gray-800 transition-all active:scale-95">
            <Home className="w-5 h-5" /> {t('go_home')}
          </Link>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-gray-200 text-base font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all">
            <ArrowLeft className="w-5 h-5" /> {t('go_back')}
          </button>
        </div>
      </div>
    </div>
  )
}
