import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Upload, Save, ShoppingBag, Tag, Layout,
  LogOut, Check, Loader, ChevronRight, Image,
} from 'lucide-react'
import { adminGetBanners, adminUpdateBanner, adminUploadBannerImage } from '../../api/admin'

const BADGE_COLOR_OPTIONS = [
  { label: 'Red',     value: 'red',     color: '#dc2626' },
  { label: 'Amber',   value: 'amber',   color: '#d97706' },
  { label: 'Emerald', value: 'emerald', color: '#059669' },
  { label: 'Blue',    value: 'blue',    color: '#2563eb' },
  { label: 'Violet',  value: 'violet',  color: '#7c3aed' },
  { label: 'Pink',    value: 'pink',    color: '#db2777' },
]

const BANNER_GROUPS = [
  {
    group: 'Home – Hero Carousel',
    slots: [
      { key: 'home_hero_slide_1', label: 'Slide 1', type: 'hero_slide' },
      { key: 'home_hero_slide_2', label: 'Slide 2', type: 'hero_slide' },
      { key: 'home_hero_slide_3', label: 'Slide 3', type: 'hero_slide' },
    ],
  },
  {
    group: 'Home – Sale Banners',
    slots: [
      { key: 'home_sale_poster_1', label: 'Left Banner', type: 'sale_poster' },
      { key: 'home_sale_poster_2', label: 'Right Banner', type: 'sale_poster' },
    ],
  },
  {
    group: 'Home – Delivery Banner',
    slots: [
      { key: 'home_delivery_banner', label: 'Free Delivery', type: 'delivery_banner' },
    ],
  },
  {
    group: 'Home – Exclusive Collection',
    slots: [
      { key: 'home_exclusive_banner', label: 'Exclusive Collection', type: 'full_banner' },
    ],
  },
  {
    group: 'Home – Flash Sale',
    slots: [
      { key: 'home_flash_sale_banner', label: 'Flash Sale', type: 'full_banner' },
    ],
  },
  {
    group: 'Perfumes Category',
    slots: [
      { key: 'category_hero_perfumes', label: 'Hero Banner', type: 'category_hero' },
      { key: 'category_promo_perfumes_1', label: 'Promo 1', type: 'category_promo' },
      { key: 'category_promo_perfumes_2', label: 'Promo 2', type: 'category_promo' },
    ],
  },
  {
    group: 'Makeup Category',
    slots: [
      { key: 'category_hero_makeup', label: 'Hero Banner', type: 'category_hero' },
      { key: 'category_promo_makeup_1', label: 'Promo 1', type: 'category_promo' },
      { key: 'category_promo_makeup_2', label: 'Promo 2', type: 'category_promo' },
    ],
  },
  {
    group: 'Hair Care Category',
    slots: [
      { key: 'category_hero_hair_care', label: 'Hero Banner', type: 'category_hero' },
      { key: 'category_promo_hair_care_1', label: 'Promo 1', type: 'category_promo' },
      { key: 'category_promo_hair_care_2', label: 'Promo 2', type: 'category_promo' },
    ],
  },
  {
    group: 'Body Care Category',
    slots: [
      { key: 'category_hero_body_care', label: 'Hero Banner', type: 'category_hero' },
      { key: 'category_promo_body_care_1', label: 'Promo 1', type: 'category_promo' },
      { key: 'category_promo_body_care_2', label: 'Promo 2', type: 'category_promo' },
    ],
  },
  {
    group: 'Personal Care Category',
    slots: [
      { key: 'category_hero_personal_care', label: 'Hero Banner', type: 'category_hero' },
      { key: 'category_promo_personal_care_1', label: 'Promo 1', type: 'category_promo' },
      { key: 'category_promo_personal_care_2', label: 'Promo 2', type: 'category_promo' },
    ],
  },
]

const SLOT_DEFAULTS = {
  home_hero_slide_1: { img: '/images/luxury-perfumes.webp', title: 'Luxury Perfumes', subtitle: 'Over 1,000 authentic fragrances from top global brands', badge: 'Exclusively on Zosouq', discount: '26', cta: 'Shop Now', link: '/category/perfumes' },
  home_hero_slide_2: { img: '/images/premium-makeup.webp', title: 'Premium Makeup', subtitle: 'Beauty essentials for every skin tone and occasion', badge: 'New Collection', discount: '40', cta: 'Shop Now', link: '/category/makeup' },
  home_hero_slide_3: { img: '/images/body-care-essentials.webp', title: 'Body Care Essentials', subtitle: 'Nourish, restore, and glow with premium treatments', badge: 'Best Sellers', discount: '35', cta: 'Shop Now', link: '/category/body-care' },
  home_sale_poster_1: { img: '/images/luxury-perfumes.webp', link: '/category/perfumes', badgeText: 'UP TO 70% OFF', badgeIcon: 'percent', badgeColor: 'red', eyebrow: 'Exclusive Deals', title: 'Luxury Perfumes at Unbeatable Prices', cta: 'Shop the Sale' },
  home_sale_poster_2: { img: '/images/hair-care-category.webp', link: '/category/hair-care', badgeText: 'NEW SEASON', badgeIcon: 'sparkles', badgeColor: 'amber', eyebrow: 'Fresh Arrivals', title: 'Hair Care Essentials', cta: 'Browse Collection' },
  home_delivery_banner: { img: '/images/free-delivery.webp', title: 'Same-Day Delivery Anywhere in Kuwait', description: 'Order today, receive today. Free delivery on orders over KD 10. Cash on delivery available.', tags: 'All Kuwait Areas,Same-Day Delivery,Cash on Delivery' },
  home_exclusive_banner: { img: '/images/exclusive-collection.webp', title: 'Luxury Perfumes\nUnder One Roof', description: 'Authentic fragrances from Arabian and international brands.', cta: 'Explore Collection', link: '/category/perfumes' },
  home_flash_sale_banner: { img: '/images/makeup-collection.webp', title: 'Up to 50% Off\nPremium Makeup', description: 'Limited time only. Foundation, lipstick, eyeshadow and more.', cta: 'Shop Now', link: '/category/makeup' },
  category_hero_perfumes: { img: '/images/poster-perfumes.webp', tagline: 'Your Signature Awaits', description: 'Discover authentic Arabian ouds & international designer fragrances, all under one roof.' },
  category_hero_makeup: { img: '/images/poster-makeup.webp', tagline: 'Glow Like Never Before', description: 'Premium foundations, lipsticks, eyeshadows & more from top international brands.' },
  category_hero_hair_care: { img: '/images/poster-haircare.webp', tagline: 'Healthy Hair, Happy You', description: 'Professional shampoos, conditioners, masks & styling products for every hair type.' },
  category_hero_body_care: { img: '/images/poster-bodycare.webp', tagline: 'Pamper Your Body', description: 'Luxury body scrubs, lotions, washes & spa essentials for radiant, silky-smooth skin.' },
  category_hero_personal_care: { img: '/images/poster-personalcare.webp', tagline: 'Self Care is the Best Care', description: 'Cleansers, moisturizers, serums, sunscreens & everyday essentials you can trust.' },
  category_promo_perfumes_1: { img: '/images/arabian-oud.webp', title: 'Arabian Oud Collection', sub: 'Exclusive fragrances from the finest oud' },
  category_promo_perfumes_2: { img: '/images/designer-perfumes.webp', title: 'Designer Perfumes', sub: 'Up to 60% less than retail' },
  category_promo_makeup_1: { img: '/images/makeup-collection.webp', title: 'Foundation Edit', sub: 'Find your perfect shade match' },
  category_promo_makeup_2: { img: '/images/lip-collection.webp', title: 'Lip Collection', sub: 'Trending shades this season' },
  category_promo_hair_care_1: { img: '/images/repair-restore.webp', title: 'Repair & Restore', sub: 'Deep conditioning treatments' },
  category_promo_hair_care_2: { img: '/images/styling-essentials.webp', title: 'Styling Essentials', sub: 'Professional results at home' },
  category_promo_body_care_1: { img: '/images/spa-at-home.webp', title: 'Spa at Home', sub: 'Luxury body scrubs & masks' },
  category_promo_body_care_2: { img: '/images/summer-ready.webp', title: 'Summer Ready', sub: 'Moisturize & glow all day' },
  category_promo_personal_care_1: { img: '/images/daily-essentials.webp', title: 'Daily Essentials', sub: 'Everything for your routine' },
  category_promo_personal_care_2: { img: '/images/skincare-picks.webp', title: 'Skincare Picks', sub: 'Serums, cleansers & more' },
}

const SLOT_TYPE_LABELS = {
  hero_slide: 'Hero Slide',
  sale_poster: 'Sale Banner',
  delivery_banner: 'Delivery Banner',
  full_banner: 'Full Banner',
  category_hero: 'Category Hero',
  category_promo: 'Category Promo',
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
        {hint && <span className="ml-2 text-gray-600 normal-case font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
    />
  )
}

function TextareaInput({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      rows={rows}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors resize-none"
    />
  )
}

function ImageField({ location, value, onChange }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await adminUploadBannerImage(location, file)
      onChange(res.url)
      setImgError(false)
    } catch {
      // silently fail — user can retry
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const imgSrc = value
    ? value.startsWith('http') ? value : `${apiBase}${value}`
    : null

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value ?? ''}
          onChange={e => { onChange(e.target.value); setImgError(false) }}
          placeholder="/images/example.webp  or  https://..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-sm text-white font-medium transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
      {imgSrc && !imgError ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
          <img
            src={imgSrc}
            alt="Banner preview"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-black/20" />
          <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-medium">Preview</span>
        </div>
      ) : (
        <div className="w-full h-24 rounded-xl bg-gray-800/50 border border-dashed border-gray-700 flex items-center justify-center gap-2 text-gray-600">
          <Image className="w-4 h-4" />
          <span className="text-xs">No image preview</span>
        </div>
      )}
    </div>
  )
}

function BannerForm({ slot, formData, setFormData, onSave, onCancel, saving, saved }) {
  const set = (key) => (val) => setFormData(prev => ({ ...prev, [key]: val }))

  return (
    <div className="space-y-6">
      <Field label="Banner Image" hint="(Upload a file or paste a URL)">
        <ImageField location={slot.key} value={formData.img} onChange={set('img')} />
      </Field>

      {slot.type === 'hero_slide' && (
        <>
          <Field label="Title">
            <TextInput value={formData.title} onChange={set('title')} placeholder="e.g. Luxury Perfumes" />
          </Field>
          <Field label="Subtitle">
            <TextInput value={formData.subtitle} onChange={set('subtitle')} placeholder="e.g. Over 1,000 authentic fragrances from top global brands" />
          </Field>
          <Field label="Badge Text">
            <TextInput value={formData.badge} onChange={set('badge')} placeholder="e.g. Exclusively on Zosouq" />
          </Field>
          <Field label="Discount %" hint="(shown as the big number)">
            <TextInput value={formData.discount} onChange={set('discount')} placeholder="e.g. 40" type="number" />
          </Field>
          <Field label="Button Text">
            <TextInput value={formData.cta} onChange={set('cta')} placeholder="e.g. Shop Now" />
          </Field>
          <Field label="Destination Link">
            <TextInput value={formData.link} onChange={set('link')} placeholder="e.g. /category/perfumes" />
          </Field>
        </>
      )}

      {slot.type === 'sale_poster' && (
        <>
          <Field label="Destination Link">
            <TextInput value={formData.link} onChange={set('link')} placeholder="e.g. /category/perfumes" />
          </Field>
          <Field label="Eyebrow" hint="(small text above the title)">
            <TextInput value={formData.eyebrow} onChange={set('eyebrow')} placeholder="e.g. Exclusive Deals" />
          </Field>
          <Field label="Title">
            <TextInput value={formData.title} onChange={set('title')} placeholder="e.g. Luxury Perfumes at Unbeatable Prices" />
          </Field>
          <Field label="Badge Text">
            <TextInput value={formData.badgeText} onChange={set('badgeText')} placeholder="e.g. UP TO 70% OFF" />
          </Field>
          <Field label="Badge Icon">
            <div className="flex gap-2">
              {[
                { value: 'percent', label: '% Percent' },
                { value: 'sparkles', label: '✨ Sparkles' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => set('badgeIcon')(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    formData.badgeIcon === opt.value
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Badge Color">
            <div className="flex flex-wrap gap-2">
              {BADGE_COLOR_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => set('badgeColor')(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                    formData.badgeColor === opt.value
                      ? 'border-white/40 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                  style={formData.badgeColor === opt.value ? { backgroundColor: opt.color + '28' } : {}}
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Button Text">
            <TextInput value={formData.cta} onChange={set('cta')} placeholder="e.g. Shop the Sale" />
          </Field>
        </>
      )}

      {slot.type === 'delivery_banner' && (
        <>
          <Field label="Headline">
            <TextInput value={formData.title} onChange={set('title')} placeholder="e.g. Same-Day Delivery Anywhere in Kuwait" />
          </Field>
          <Field label="Description">
            <TextareaInput value={formData.description} onChange={set('description')} placeholder="e.g. Order today, receive today. Free delivery on orders over KD 10." />
          </Field>
          <Field label="Tags" hint="(comma-separated)">
            <TextInput value={formData.tags} onChange={set('tags')} placeholder="e.g. All Kuwait Areas,Same-Day Delivery,Cash on Delivery" />
          </Field>
        </>
      )}

      {slot.type === 'full_banner' && (
        <>
          <Field label="Title" hint="(use \n for line break)">
            <TextInput value={formData.title} onChange={set('title')} placeholder="e.g. Luxury Perfumes\nUnder One Roof" />
          </Field>
          <Field label="Description">
            <TextareaInput value={formData.description} onChange={set('description')} placeholder="e.g. Authentic fragrances from Arabian and international brands." rows={2} />
          </Field>
          <Field label="Button Text">
            <TextInput value={formData.cta} onChange={set('cta')} placeholder="e.g. Explore Collection" />
          </Field>
          <Field label="Destination Link">
            <TextInput value={formData.link} onChange={set('link')} placeholder="e.g. /category/perfumes" />
          </Field>
        </>
      )}

      {slot.type === 'category_hero' && (
        <>
          <Field label="Tagline" hint="(small badge above the title)">
            <TextInput value={formData.tagline} onChange={set('tagline')} placeholder="e.g. Your Signature Awaits" />
          </Field>
          <Field label="Description">
            <TextareaInput value={formData.description} onChange={set('description')} placeholder="e.g. Discover authentic fragrances from top global brands." rows={2} />
          </Field>
        </>
      )}

      {slot.type === 'category_promo' && (
        <>
          <Field label="Title">
            <TextInput value={formData.title} onChange={set('title')} placeholder="e.g. Arabian Oud Collection" />
          </Field>
          <Field label="Subtitle">
            <TextInput value={formData.sub} onChange={set('sub')} placeholder="e.g. Exclusive fragrances from the finest oud" />
          </Field>
        </>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? (
            <><Loader className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="w-4 h-4 text-emerald-600" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Banner</>
          )}
        </button>
      </div>
    </div>
  )
}

const BADGE_COLORS_MAP = { red: '#dc2626', amber: '#d97706', emerald: '#059669', blue: '#2563eb', violet: '#7c3aed', pink: '#db2777' }

function BannerPreview({ slot, formData }) {
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')
  const imgSrc = formData.img
    ? formData.img.startsWith('http') ? formData.img : `${apiBase}${formData.img}`
    : null

  const previewStyle = { position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '12px', background: '#1f2937' }

  if (slot.type === 'hero_slide') {
    return (
      <div style={{ ...previewStyle, height: '200px' }}>
        {imgSrc && <img src={imgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,7,18,0.85) 0%, rgba(3,7,18,0.5) 60%, rgba(3,7,18,0.1) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {formData.badge && <span style={{ display: 'inline-block', background: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', marginBottom: '8px', width: 'fit-content' }}>{formData.badge}</span>}
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 800, lineHeight: 1.2, marginBottom: '6px' }}>{formData.title || 'Title'}</div>
          {formData.discount && <div style={{ color: '#fbbf24', fontSize: '36px', fontWeight: 900, lineHeight: 1, marginBottom: '8px' }}>{formData.discount}<span style={{ fontSize: '18px' }}>%</span> <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>OFF</span></div>}
          {formData.cta && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff', color: '#111', fontSize: '11px', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', width: 'fit-content' }}>{formData.cta} →</span>}
        </div>
      </div>
    )
  }

  if (slot.type === 'sale_poster') {
    return (
      <div style={{ ...previewStyle, height: '160px' }}>
        {imgSrc && <img src={imgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,7,18,0.9) 0%, rgba(3,7,18,0.4) 100%)' }} />
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: BADGE_COLORS_MAP[formData.badgeColor] || '#dc2626', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{formData.badgeText}</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '12px 16px' }}>
          {formData.eyebrow && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '3px' }}>{formData.eyebrow}</div>}
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, lineHeight: 1.3 }}>{formData.title || 'Title'}</div>
          {formData.cta && <span style={{ color: '#fff', fontSize: '10px', marginTop: '4px', display: 'block' }}>{formData.cta} →</span>}
        </div>
      </div>
    )
  }

  if (slot.type === 'delivery_banner' || slot.type === 'full_banner') {
    return (
      <div style={{ ...previewStyle, height: '160px' }}>
        {imgSrc && <img src={imgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,78,59,0.9) 0%, rgba(6,78,59,0.5) 60%, rgba(6,78,59,0.1) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 800, lineHeight: 1.3, marginBottom: '6px', whiteSpace: 'pre-line' }}>{formData.title || 'Title'}</div>
          {formData.description && <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', marginBottom: '8px', maxWidth: '280px' }}>{formData.description}</div>}
          {formData.cta && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff', color: '#111', fontSize: '10px', fontWeight: 700, padding: '5px 12px', borderRadius: '7px', width: 'fit-content' }}>{formData.cta} →</span>}
          {formData.tags && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
              {formData.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '9px', padding: '2px 7px', borderRadius: '5px' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (slot.type === 'category_hero') {
    return (
      <div style={{ ...previewStyle, height: '200px' }}>
        {imgSrc && <img src={imgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,7,18,0.9) 0%, rgba(3,7,18,0.6) 60%, rgba(3,7,18,0.2) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '20px 28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '360px' }}>
          {formData.tagline && (
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '9px', fontWeight: 700, padding: '3px 10px', borderRadius: '7px', marginBottom: '10px', width: 'fit-content', backdropFilter: 'blur(4px)' }}>{formData.tagline}</span>
          )}
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 800, lineHeight: 1.2, marginBottom: '8px', fontFamily: 'Georgia, serif' }}>Category Name</div>
          {formData.description && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', lineHeight: 1.5 }}>{formData.description}</div>}
        </div>
      </div>
    )
  }

  if (slot.type === 'category_promo') {
    return (
      <div style={{ ...previewStyle, height: '140px' }}>
        {imgSrc && <img src={imgSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(3,7,18,0.8) 0%, rgba(3,7,18,0.3) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '12px 16px' }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '3px' }}>{formData.title || 'Title'}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px' }}>{formData.sub || 'Subtitle'}</div>
        </div>
      </div>
    )
  }

  return null
}

export default function AdminBannersPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem('admin_username') || 'admin'

  const [banners, setBanners] = useState({})
  const [selectedKey, setSelectedKey] = useState(BANNER_GROUPS[0].slots[0].key)
  const [formData, setFormData] = useState(SLOT_DEFAULTS[BANNER_GROUPS[0].slots[0].key] ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [originalData, setOriginalData] = useState(SLOT_DEFAULTS[BANNER_GROUPS[0].slots[0].key] ?? {})

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { navigate('/admin/login', { replace: true }); return }

    adminGetBanners()
      .then(list => {
        const map = {}
        list.forEach(b => { map[b.location] = b.data })
        setBanners(map)
        const firstKey = BANNER_GROUPS[0].slots[0].key
        const d = map[firstKey] ?? SLOT_DEFAULTS[firstKey] ?? {}
        setFormData(d)
        setOriginalData(d)
      })
      .catch(() => {})
      .finally(() => setLoadingBanners(false))
  }, [])

  const handleSelectSlot = (key) => {
    const d = banners[key] ?? SLOT_DEFAULTS[key] ?? {}
    setSelectedKey(key)
    setFormData(d)
    setOriginalData(d)
    setSaved(false)
  }

  const handleCancel = () => {
    setFormData(originalData)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminUpdateBanner(selectedKey, formData)
      setBanners(prev => ({ ...prev, [selectedKey]: formData }))
      setOriginalData(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // silently handle — user can retry
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    navigate('/admin/login', { replace: true })
  }

  const selectedSlot = BANNER_GROUPS.flatMap(g => g.slots).find(s => s.key === selectedKey)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M3.5 4H16.5L3.5 16H16.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-300">Zosouq</span>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-gray-400">Banner Manager</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1 ml-2">
            <Link to="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <ShoppingBag className="w-3.5 h-3.5" /> Orders
            </Link>
            <Link to="/admin/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Tag className="w-3.5 h-3.5" /> Products
            </Link>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white">
              <Layout className="w-3.5 h-3.5" /> Banners
            </span>
          </nav>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-500 hidden sm:block">{username}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left sidebar – slot list */}
        <aside className="w-64 border-r border-gray-800 overflow-y-auto flex-shrink-0 bg-gray-950">
          <div className="p-4 pt-5">
            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest mb-4 px-2">All Banner Slots</p>
            {BANNER_GROUPS.map(group => (
              <div key={group.group} className="mb-5">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1.5 px-2 truncate">{group.group}</p>
                {group.slots.map(slot => {
                  const isCustomized = !!banners[slot.key]
                  const isSelected = selectedKey === slot.key
                  return (
                    <button
                      key={slot.key}
                      onClick={() => handleSelectSlot(slot.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-0.5 transition-all text-left group ${
                        isSelected
                          ? 'bg-white/10 text-white'
                          : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-sm font-medium truncate">{slot.label}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isCustomized && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" title="Customized" />
                        )}
                        <ChevronRight className={`w-3 h-3 transition-opacity ${isSelected ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'}`} />
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="px-5 pb-4">
            <p className="text-[10px] text-gray-700 leading-relaxed">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle" />
              Green dot = customized
            </p>
          </div>
        </aside>

        {/* Right – edit panel */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="max-w-xl mx-auto px-6 py-8">
            {selectedSlot ? (
              <>
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600 font-medium">{SLOT_TYPE_LABELS[selectedSlot.type]}</span>
                    {banners[selectedKey] ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Customized
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-500 border border-gray-700">
                        Using Default
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-white">{selectedSlot.label}</h1>
                  <p className="text-xs text-gray-600 mt-1">
                    {banners[selectedKey]
                      ? 'This banner is using your custom content.'
                      : 'No changes saved yet — showing default content. Edit fields below and save.'}
                  </p>
                </div>

                {loadingBanners ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader className="w-6 h-6 animate-spin text-gray-700" />
                  </div>
                ) : (
                  <BannerForm
                    slot={selectedSlot}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    saving={saving}
                    saved={saved}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-700">
                Select a banner slot on the left to edit it.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
