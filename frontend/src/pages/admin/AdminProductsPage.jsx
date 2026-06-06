import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Plus, Search, X, Edit2, Trash2, Upload, Image, Download,
  ChevronLeft, ChevronRight, ChevronDown, LogOut, Package, Layout,
  ShoppingBag, Tag, AlertCircle, Check, SendToBack, Rocket, Loader,
} from 'lucide-react'
import {
  adminGetProducts, adminCreateProduct,
  adminUpdateProduct, adminDeleteProduct,
  adminPublishProduct, adminStageProduct,
  adminExportProducts,
} from '../../api/admin'

const CATEGORIES = [
  { id: 1, name: 'Body Care' },
  { id: 2, name: 'Hair Care' },
  { id: 3, name: 'Makeup' },
  { id: 4, name: 'Personal Care' },
  { id: 5, name: 'Perfumes' },
]

const EMPTY_FORM = {
  name: '', category_id: 1, price: '', original_price: '',
  stock: '', description: '', brand: '', is_featured: false,
}

// ── Image preview item ────────────────────────────────────
function ImageThumb({ src, onRemove }) {
  return (
    <div className="relative group w-20 h-20 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
      <img src={src} alt="" className="w-full h-full object-cover" />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  )
}

// ── Product form slide-over ───────────────────────────────
function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(
    product ? {
      name: product.name,
      category_id: product.category_id,
      price: product.price,
      original_price: product.original_price || '',
      stock: product.stock,
      description: product.description || '',
      brand: product.brand || '',
      is_featured: product.is_featured || false,
    } : EMPTY_FORM
  )
  const [existingImgs, setExistingImgs] = useState(() => {
    if (!product) return []
    try { return JSON.parse(product.images || '[]') } catch { return product.image_url ? [product.image_url] : [] }
  })
  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const isEdit = !!product

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    setNewFiles(p => [...p, ...valid])
    valid.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setNewPreviews(p => [...p, e.target.result])
      reader.readAsDataURL(f)
    })
  }

  const removeExisting = (idx) => setExistingImgs(p => p.filter((_, i) => i !== idx))
  const removeNew = (idx) => {
    setNewFiles(p => p.filter((_, i) => i !== idx))
    setNewPreviews(p => p.filter((_, i) => i !== idx))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Product name is required')
    if (!form.price || isNaN(form.price)) return setError('Valid price is required')
    if (existingImgs.length === 0 && newFiles.length === 0)
      return setError('At least one image is required')

    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('category_id', form.category_id)
      fd.append('price', form.price)
      if (form.original_price) fd.append('original_price', form.original_price)
      fd.append('stock', form.stock || 0)
      fd.append('description', form.description)
      fd.append('brand', form.brand)
      fd.append('is_featured', form.is_featured)
      if (isEdit) fd.append('existing_images', JSON.stringify(existingImgs))
      newFiles.forEach(f => fd.append('images', f))

      if (isEdit) {
        await adminUpdateProduct(product.id, fd)
      } else {
        await adminCreateProduct(fd)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-xl h-full bg-gray-900 border-l border-gray-800 overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-gray-500">{isEdit ? 'Edit Product' : 'New Product'}</p>
            <p className="text-base font-bold text-white">{isEdit ? form.name || 'Product' : 'Add Product'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Name *</label>
            <input
              value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Chanel No. 5 EDP 100ml"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/40"
            />
          </div>

          {/* Category + Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
              <select
                value={form.category_id} onChange={e => set('category_id', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500/40 [color-scheme:dark]"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Brand</label>
              <input
                value={form.brand} onChange={e => set('brand', e.target.value)}
                placeholder="e.g. Chanel"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/40"
              />
            </div>
          </div>

          {/* Price + Original Price + Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Price (KD) *</label>
              <input
                type="number" step="0.001" min="0" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="0.000"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Original (KD)</label>
              <input
                type="number" step="0.001" min="0" value={form.original_price} onChange={e => set('original_price', e.target.value)}
                placeholder="0.000"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Stock</label>
              <input
                type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/40"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Short product description..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 focus:border-rose-500/40 resize-none"
            />
          </div>

          {/* Featured */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set('is_featured', !form.is_featured)}
              className={`w-10 h-5 rounded-full transition-colors flex items-center ${form.is_featured ? 'bg-rose-500' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow ml-0.5 transition-transform ${form.is_featured ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-gray-300">Mark as Featured</span>
          </label>

          {/* Images */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Images * <span className="text-gray-600 font-normal">(first image = main photo)</span>
            </label>

            {/* Existing + new previews */}
            {(existingImgs.length > 0 || newPreviews.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingImgs.map((src, i) => (
                  <ImageThumb key={`ex-${i}`} src={src} onRemove={() => removeExisting(i)} />
                ))}
                {newPreviews.map((src, i) => (
                  <ImageThumb key={`new-${i}`} src={src} onRemove={() => removeNew(i)} />
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 text-gray-500" />
              <p className="text-sm text-gray-400">Drop images here or <span className="text-rose-400">browse</span></p>
              <p className="text-xs text-gray-600">JPG, PNG, WebP — multiple files supported</p>
              <input
                ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><Check className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Add Product'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete confirm modal ──────────────────────────────────
function DeleteConfirm({ product, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-base font-bold text-white text-center mb-1">Delete Product?</p>
        <p className="text-sm text-gray-400 text-center mb-6 line-clamp-2">{product.name}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white">Cancel</button>
          <button
            disabled={deleting}
            onClick={async () => { setDeleting(true); await onConfirm(); }}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Export Modal ──────────────────────────────────────────
const EXPORT_FILTERS = [
  { value: '',              label: 'All products'         },
  { value: 'missing_desc',  label: 'Missing Description'  },
  { value: 'missing_price', label: 'Missing Price'        },
  { value: 'out_of_stock',  label: 'Out of Stock'         },
  { value: 'low_stock',     label: 'Low Stock (≤5)'       },
  { value: 'no_image',      label: 'No Image'             },
  { value: 'featured',      label: 'Featured Only'        },
]

function ExportModal({ onClose }) {
  const [category, setCategory] = useState(0)
  const [filter, setFilter]     = useState('')
  const [staged, setStaged]     = useState(false)
  const [count, setCount]       = useState(null)
  const [counting, setCounting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const buildParams = () => {
    const p = { staged }
    if (category) p.category_id = category
    if (filter === 'missing_desc')  p.missing_desc  = true
    if (filter === 'missing_price') p.missing_price = true
    if (filter === 'out_of_stock')  p.out_of_stock  = true
    if (filter === 'low_stock')     p.low_stock     = true
    if (filter === 'no_image')      p.no_image      = true
    if (filter === 'featured')      p.featured_only = true
    return p
  }

  useEffect(() => {
    setCounting(true)
    setCount(null)
    adminGetProducts({ ...buildParams(), page: 1, per_page: 1 })
      .then(d => setCount(d.total))
      .catch(() => setCount(null))
      .finally(() => setCounting(false))
  }, [category, filter, staged])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await adminExportProducts(buildParams())
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'zosouq_catalog.tsv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onClose()
    } catch {
      // silent — user will notice no download
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Facebook Catalog Format</p>
            <h2 className="text-lg font-bold text-white">Export Products</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Product type */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Product Type</label>
            <div className="flex gap-2">
              {[{ label: 'Live', value: false }, { label: 'Staging', value: true }].map(opt => (
                <button key={String(opt.value)} type="button"
                  onClick={() => setStaged(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    staged === opt.value ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCategory(0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === 0 ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>
                All
              </button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c.id ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Filter</label>
            <div className="grid grid-cols-2 gap-1.5">
              {EXPORT_FILTERS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                    filter === opt.value
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count badge */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Products to export</span>
            {counting
              ? <Loader className="w-4 h-4 animate-spin text-gray-500" />
              : <span className="text-lg font-bold text-white">{count?.toLocaleString() ?? '—'}</span>
            }
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading || counting || count === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 shadow-lg"
          >
            {downloading
              ? <><Loader className="w-4 h-4 animate-spin" /> Generating…</>
              : <><Download className="w-4 h-4" /> Download TSV ({count?.toLocaleString() ?? '…'} rows)</>
            }
          </button>

          <p className="text-center text-[11px] text-gray-600">
            Tab-separated · Facebook Catalog format · Includes sale prices
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function AdminProductsPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem('admin_username') || 'admin'

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(0)
  const [quickFilter, setQuickFilter] = useState('') // '' | 'missing_desc' | 'missing_price' | 'out_of_stock' | 'low_stock' | 'no_image' | 'featured'
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('active') // 'active' | 'staged'
  const [publishError, setPublishError] = useState(null) // { product, errors[] }
  const [showExport, setShowExport] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [toast, setToast] = useState('')

  const PER_PAGE = 20

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) navigate('/admin/login', { replace: true })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: PER_PAGE, staged: activeTab === 'staged' }
      if (search) params.search = search
      if (categoryFilter) params.category_id = categoryFilter
      if (quickFilter === 'missing_desc')  params.missing_desc  = true
      if (quickFilter === 'missing_price') params.missing_price = true
      if (quickFilter === 'out_of_stock')  params.out_of_stock  = true
      if (quickFilter === 'low_stock')     params.low_stock     = true
      if (quickFilter === 'no_image')      params.no_image      = true
      if (quickFilter === 'featured')      params.featured_only = true
      const data = await adminGetProducts(params)
      setProducts(data.products)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch {}
    finally { setLoading(false) }
  }, [page, search, categoryFilter, quickFilter, activeTab])

  useEffect(() => { load() }, [load])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditProduct(null)
    if (!editProduct) {
      // New product → switch to staging tab so user can see it
      setActiveTab('staged')
    }
    load()
    showToast(editProduct ? 'Product updated!' : 'Product added to Staging!')
  }

  const handleDelete = async () => {
    await adminDeleteProduct(deleteProduct.id)
    setDeleteProduct(null)
    load()
    showToast('Product deleted')
  }

  const handlePublish = async (product) => {
    try {
      await adminPublishProduct(product.id)
      load()
      showToast(`"${product.name.slice(0, 30)}..." published to store!`)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail?.errors) {
        setPublishError({ product, errors: detail.errors })
      } else {
        showToast(detail || 'Failed to publish', 'error')
      }
    }
  }

  const handleStage = async (product) => {
    await adminStageProduct(product.id)
    load()
    showToast(`"${product.name.slice(0, 30)}..." moved to staging`)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const catName = (id) => CATEGORIES.find(c => c.id === id)?.name || '—'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Top nav */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M3.5 4H16.5L3.5 16H16.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-300">Zosouq</span>
            <span className="text-gray-700">/</span>
            <Link to="/admin/dashboard" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Dashboard</Link>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-gray-300">Products</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center text-xs font-bold">
                {username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-400 hidden sm:inline">{username}</span>
            </div>
            <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin/login') }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Sub-nav tabs */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-gray-800/60">
          <Link to="/admin/dashboard"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors">
            <ShoppingBag className="w-3.5 h-3.5" /> Orders
          </Link>
          <div className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white border-b-2 border-rose-500">
            <Tag className="w-3.5 h-3.5" /> Products
          </div>
          <Link to="/admin/banners"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors">
            <Layout className="w-3.5 h-3.5" /> Banners
          </Link>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Header bar */}
          <div className="p-5 border-b border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Tabs */}
                <button
                  onClick={() => { setActiveTab('active'); setPage(1) }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'active'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  Live
                  {activeTab === 'active' && <span className="ml-1 text-xs font-normal text-gray-500">{total.toLocaleString()}</span>}
                </button>
                <button
                  onClick={() => { setActiveTab('staged'); setPage(1) }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'staged'
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 border border-gray-700 hover:border-amber-500/30'
                  }`}
                >
                  <SendToBack className="w-3.5 h-3.5" />
                  Staging
                  {activeTab === 'staged' && <span className="ml-1 text-xs font-normal text-amber-200">{total.toLocaleString()}</span>}
                </button>
              </div>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                <Download className="w-4 h-4" /> Export
              </button>
              <button
                onClick={() => { setEditProduct(null); setShowForm(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-rose-500/20"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search products…"
                    className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 hover:text-white hover:border-gray-600 transition-all">
                  Search
                </button>
              </form>

              {/* Category filter */}
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => { setCategoryFilter(0); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryFilter === 0 ? 'bg-white text-gray-900 font-semibold' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'}`}>
                  All
                </button>
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => { setCategoryFilter(c.id); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryFilter === c.id ? 'bg-white text-gray-900 font-semibold' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'}`}>
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Quick-filter dropdown */}
              {(() => {
                const FILTER_OPTIONS = [
                  { value: '',              label: 'No filter',           dot: 'bg-gray-500' },
                  { value: 'missing_desc',  label: 'Missing Description', dot: 'bg-amber-400' },
                  { value: 'missing_price', label: 'Missing Price',       dot: 'bg-red-400'   },
                  { value: 'out_of_stock',  label: 'Out of Stock',        dot: 'bg-rose-500'  },
                  { value: 'low_stock',     label: 'Low Stock (≤5)',      dot: 'bg-orange-400'},
                  { value: 'no_image',      label: 'No Image',            dot: 'bg-violet-400'},
                  { value: 'featured',      label: 'Featured Only',       dot: 'bg-emerald-400'},
                ]
                const active = FILTER_OPTIONS.find(o => o.value === quickFilter)
                return (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setFilterOpen(v => !v)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                        quickFilter
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {quickFilter ? active?.label : 'Filter'}
                      {quickFilter && (
                        <span className="ml-1 text-gray-400">({total})</span>
                      )}
                      {quickFilter ? (
                        <span
                          className="ml-1 hover:text-white"
                          onClick={e => { e.stopPropagation(); setQuickFilter(''); setPage(1); setFilterOpen(false) }}
                        >✕</span>
                      ) : (
                        <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {filterOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                        <div className="absolute right-0 top-full mt-1.5 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1.5 min-w-[200px]">
                          {FILTER_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => { setQuickFilter(opt.value); setPage(1); setFilterOpen(false) }}
                              className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 transition-colors ${
                                quickFilter === opt.value
                                  ? 'text-white font-semibold bg-gray-700/50'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt.dot}`} />
                              {opt.label}
                              {quickFilter === opt.value && <Check className="w-3 h-3 ml-auto text-rose-400" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Table */}
          {/* Staging info banner */}
          {activeTab === 'staged' && (
            <div className="mx-5 mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <SendToBack className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">
                These products are <strong>hidden from the store</strong>. To publish, a product must have: name, price &gt; 0, description, and at least one image. Click <strong>Edit</strong> to fill in missing fields, then <strong>Publish</strong>.
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800/50 animate-pulse">
                      {Array(5).fill(0).map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-gray-500">
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No products found</p>
                    </td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group">
                    {/* Product */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                            : <div className="w-full h-full flex items-center justify-center"><Image className="w-4 h-4 text-gray-600" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white line-clamp-2 leading-tight">{p.name}</p>
                          {p.brand && <p className="text-xs text-gray-500 mt-0.5">{p.brand}</p>}
                          {!p.description && <span className="text-[10px] text-amber-400 font-medium">No description</span>}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-3">
                      <span className="text-xs text-gray-400">{catName(p.category_id)}</span>
                    </td>
                    {/* Price */}
                    <td className="px-5 py-3">
                      {(!p.price || p.price === 0)
                        ? <span className="text-xs font-medium text-red-400">No price</span>
                        : <p className="text-xs font-semibold text-white">KD {Number(p.price).toFixed(3)}</p>
                      }
                      {p.original_price && (
                        <p className="text-xs text-gray-600 line-through">KD {Number(p.original_price).toFixed(3)}</p>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${p.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.stock > 0 ? p.stock : 'Out'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditProduct(p); setShowForm(true) }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        {activeTab === 'staged' ? (
                          <button
                            onClick={() => handlePublish(p)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all font-semibold"
                          >
                            <Rocket className="w-3 h-3" /> Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStage(p)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                          >
                            <SendToBack className="w-3 h-3" /> Stage
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteProduct(p)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} of {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 px-2">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export modal */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}

      {/* Form slide-over */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null) }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm */}
      {deleteProduct && (
        <DeleteConfirm
          product={deleteProduct}
          onConfirm={handleDelete}
          onCancel={() => setDeleteProduct(null)}
        />
      )}

      {/* Publish validation error modal */}
      {publishError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setPublishError(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-base font-bold text-white text-center mb-1">Cannot Publish</p>
            <p className="text-xs text-gray-400 text-center mb-4 line-clamp-1">{publishError.product.name}</p>
            <div className="space-y-2 mb-5">
              {publishError.errors.map((e, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  <X className="w-3.5 h-3.5 flex-shrink-0" /> {e}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">Edit the product to fill in the missing fields, then try publishing again.</p>
            <div className="flex gap-3">
              <button onClick={() => setPublishError(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white">
                Close
              </button>
              <button onClick={() => { setEditProduct(publishError.product); setShowForm(true); setPublishError(null) }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-fuchsia-600 rounded-xl text-sm font-semibold text-white">
                <Edit2 className="w-3.5 h-3.5 inline mr-1.5" />Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
