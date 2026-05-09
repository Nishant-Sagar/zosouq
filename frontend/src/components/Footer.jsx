import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#0D0400', color: '#A08050', borderTop: '1px solid rgba(200,164,58,0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <p className="text-3xl font-bold tracking-widest uppercase" style={{ color: '#C8A43A', fontFamily: 'Georgia, serif' }}>
                Zosouq
              </p>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#C8A43A', opacity: 0.6 }}>
                Luxury · Beauty · Fashion
              </p>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Your premium destination for authentic luxury perfumes, beauty, skincare and fashion accessories in Kuwait.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(200,164,58,0.1)', border: '1px solid rgba(200,164,58,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,164,58,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,164,58,0.1)'}
                >
                  <Icon className="w-4 h-4" style={{ color: '#C8A43A' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest" style={{ color: '#C8A43A' }}>Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'My Cart', to: '/cart' },
                { label: 'Track Order', to: '#' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm transition-colors hover:text-amber-400" style={{ color: '#A08050' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest" style={{ color: '#C8A43A' }}>Categories</h3>
            <ul className="space-y-2.5">
              {[
                ['Body Care',     'body-care'],
                ['Hair Care',     'hair-care'],
                ['Makeup',        'makeup'],
                ['Personal Care', 'personal-care'],
                ['Perfumes',      'perfumes'],
              ].map(([name, slug]) => (
                <li key={slug}>
                  <Link to={`/category/${slug}`} className="text-sm transition-colors hover:text-amber-400" style={{ color: '#A08050' }}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest" style={{ color: '#C8A43A' }}>Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#C8A43A' }} />
                <span className="text-sm">Kuwait City, Kuwait</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#C8A43A' }} />
                <span className="text-sm">+965 XXXX XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#C8A43A' }} />
                <span className="text-sm">support@zosouq.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(200,164,58,0.15)' }}>
          <p className="text-xs" style={{ color: '#60402A' }}>© 2025 Zosouq. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#60402A' }}>Payment:</span>
            <span className="px-3 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(200,164,58,0.1)', color: '#C8A43A', border: '1px solid rgba(200,164,58,0.2)' }}>
              💵 Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
