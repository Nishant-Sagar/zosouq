import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pb-16 sm:pb-0">
      {/* Gradient accent stripe */}
      <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand + Contact */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Zosouq
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Kuwait's trusted destination for authentic beauty, skincare & fragrances.
            </p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-pink-400" /> Kuwait City</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-pink-400" /> support@zosouq.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-pink-400" /> +965 XXXX XXXX</li>
            </ul>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              {[
                { name: 'Facebook', abbr: 'F', color: 'hover:bg-blue-600' },
                { name: 'Instagram', abbr: 'I', color: 'hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-600' },
                { name: 'Twitter', abbr: 'X', color: 'hover:bg-sky-500' },
              ].map(s => (
                <a key={s.name} href="#"
                  className={`w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 hover:text-white transition-all duration-300 ${s.color}`}>
                  {s.abbr}
                </a>
              ))}
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Useful Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'My Cart', to: '/cart' },
                { label: 'Track Order', to: '#' },
                { label: 'Contact', to: '#' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-pink-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2.5">
              {[
                ['Perfumes', 'perfumes'],
                ['Makeup', 'makeup'],
                ['Hair Care', 'hair-care'],
                ['Body Care', 'body-care'],
                ['Personal Care', 'personal-care'],
              ].map(([name, slug]) => (
                <li key={slug}>
                  <Link to={`/category/${slug}`} className="text-sm text-gray-400 hover:text-pink-400 transition-colors">{name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            © 2025 Zosouq. Made with <Heart className="w-3 h-3 text-pink-500 fill-pink-500" /> in Kuwait
          </p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1">
              Cash on Delivery
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1">
              Same-Day Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
