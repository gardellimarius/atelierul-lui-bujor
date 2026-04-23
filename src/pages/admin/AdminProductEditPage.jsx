import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/AdminSidebar'

const empty = { name: '', description: '', year_created: '', subject: '', medium: '', dimensions: '', details: '', category: '', type: 'painting', bestseller: false }

export default function AdminProductEditPage() {
  const { id: urlId } = useParams()
  const navigate = useNavigate()

  const [productId, setProductId] = useState(urlId || null)
  const isNew = !productId
  const [form, setForm] = useState(empty)
  const [productImages, setProductImages] = useState([])
  const [mainImageUrl, setMainImageUrl] = useState('')
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])
  const [fetchLoading, setFetchLoading] = useState(!!urlId)
  const [toast, setToast] = useState(null)

  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchCategories()
    if (urlId) {
      fetchProduct()
      fetchImages()
    }
  }, [urlId])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  async function fetchProduct() {
    setFetchLoading(true)
    const { data } = await supabase.from('products').select('*').eq('id', urlId).single()
    if (data) {
      setForm({
        name: data.name,
        description: data.description || '',
        year_created: data.year_created || '',
        subject: data.subject || '',
        medium: data.medium || '',
        dimensions: data.dimensions || '',
        details: data.details || '',
        category: data.category || '',
        type: data.type || 'painting',
        bestseller: data.bestseller || false,
      })
      setMainImageUrl(data.image_url || '')
    }
    setFetchLoading(false)
  }

  async function fetchImages(pid) {
    const { data } = await supabase.from('product_images').select('*').eq('product_id', pid || productId).order('sort_order')
    setProductImages(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    if (productId) {
      await supabase.from('products').update(form).eq('id', productId)
      showToast('Lucrare salvată')
    } else {
      const { data } = await supabase.from('products').insert(form).select().single()
      if (data) {
        setProductId(data.id)
        navigate(`/admin/products/${data.id}`, { replace: true })
        showToast('Lucrare creată!')
      }
    }
    setLoading(false)
  }

  async function handleUploadImages() {
    if (!imageFiles.length) return

    let pid = productId
    if (!pid) {
      if (!form.name.trim()) {
        showToast('Completează titlul lucrării înainte de a adăuga imagini.', 'error')
        return
      }
      setUploading(true)
      const { data, error } = await supabase.from('products').insert(form).select().single()
      if (error || !data) {
        showToast('Eroare la crearea lucrării.', 'error')
        setUploading(false)
        return
      }
      pid = data.id
      setProductId(pid)
      navigate(`/admin/products/${pid}`, { replace: true })
    } else {
      setUploading(true)
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const ext = file.name.split('.').pop()
      const fileName = `${pid}-${Date.now()}-${i}.${ext}`
      const { error } = await supabase.storage.from('products').upload(fileName, file, { upsert: false })
      if (error) { showToast('Eroare: ' + error.message, 'error'); continue }
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
      await supabase.from('product_images').insert({ product_id: pid, image_url: publicUrl, sort_order: productImages.length + i })
    }
    setImageFiles([])
    setImagePreview([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    await fetchImages(pid)
    const { data: prod } = await supabase.from('products').select('image_url').eq('id', pid).single()
    if (!prod?.image_url) {
      const { data: imgs } = await supabase.from('product_images').select('image_url').eq('product_id', pid).order('sort_order').limit(1)
      if (imgs?.length) {
        await supabase.from('products').update({ image_url: imgs[0].image_url }).eq('id', pid)
        setMainImageUrl(imgs[0].image_url)
      }
    }
    setUploading(false)
    showToast('Imagini încărcate')
  }

  async function handleSetMainImage(imageUrl) {
    await supabase.from('products').update({ image_url: imageUrl }).eq('id', productId)
    setMainImageUrl(imageUrl)
  }

  async function deleteImage(img) {
    await supabase.from('product_images').delete().eq('id', img.id)
    const remaining = productImages.filter(i => i.id !== img.id)
    setProductImages(remaining)
    if (img.image_url === mainImageUrl) {
      const newMain = remaining[0]?.image_url || null
      await supabase.from('products').update({ image_url: newMain }).eq('id', productId)
      setMainImageUrl(newMain || '')
    }
  }

  async function handleDelete() {
    if (!confirm('Ștergi această lucrare?')) return
    await supabase.from('products').delete().eq('id', productId)
    navigate('/admin')
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || [])
    setImageFiles(files)
    setImagePreview(files.map(f => URL.createObjectURL(f)))
  }

  const filteredCategories = categories.filter(c => c.type === 'all' || c.type === form.type)

  const inp = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
  const lbl = "block text-xs font-medium text-gray-500 mb-1.5"

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar activeView="products" onNavigate={viewId => navigate('/admin', { state: { view: viewId } })} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-sm font-semibold text-gray-900">
              {isNew ? 'Lucrare nouă' : 'Editează lucrarea'}
            </h1>
          </div>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="text-xs text-gray-300 hover:text-red-500 transition-colors"
            >
              Șterge lucrarea
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {fetchLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-gray-400">Se încarcă...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start max-w-5xl">

              <div className="xl:col-span-3">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
                      {[['painting', 'Pictură'], ['frame', 'Ramă']].map(([t, l]) => (
                        <button key={t} type="button" onClick={() => setForm({ ...form, type: t, category: '' })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            form.type === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                          }`}>
                          {l}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className={lbl}>Titlu *</label>
                      <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className={inp} placeholder="Titlul lucrării" />
                    </div>

                    <div>
                      <label className={lbl}>Categorie</label>
                      {filteredCategories.length > 0 ? (
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}>
                          <option value="">Fără categorie</option>
                          {filteredCategories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          Nicio categorie definită
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={lbl}>Descriere</label>
                      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${inp} resize-none`} placeholder="Povestea lucrării, inspirația..." />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={lbl}>An creație</label>
                        <input type="text" value={form.year_created} onChange={e => setForm({ ...form, year_created: e.target.value })} className={inp} placeholder="2024" />
                      </div>
                      <div>
                        <label className={lbl}>Subiect</label>
                        <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={inp} placeholder="Peisaj" />
                      </div>
                    </div>

                    <div>
                      <label className={lbl}>Mediu</label>
                      <input type="text" value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} className={inp} placeholder="Ulei pe pânză" />
                    </div>

                    <div>
                      <label className={lbl}>Dimensiuni</label>
                      <input type="text" value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} className={inp} placeholder="60 × 80 cm" />
                    </div>

                    <div>
                      <label className={lbl}>Alte detalii</label>
                      <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} rows={2} className={`${inp} resize-none`} placeholder="Ramă inclusă, pânză de in..." />
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer py-1">
                      <input type="checkbox" checked={form.bestseller} onChange={e => setForm({ ...form, bestseller: e.target.checked })} className="w-4 h-4 rounded accent-zinc-900" />
                      <span className="text-sm text-gray-600">Lucrare recomandată</span>
                    </label>

                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={loading}
                        className="flex-1 bg-zinc-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50">
                        {loading ? 'Se salvează...' : isNew ? 'Creează lucrarea' : 'Salvează modificările'}
                      </button>
                      <button type="button" onClick={() => navigate('/admin')}
                        className="px-4 text-sm border border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors">
                        Anulează
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Imagini {productImages.length > 0 && <span className="text-gray-400 font-normal">({productImages.length})</span>}
                  </h3>

                  <>
                      {productImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {productImages.map(img => {
                            const isMain = img.image_url === mainImageUrl
                            return (
                              <div key={img.id} className="relative group rounded-lg overflow-hidden bg-gray-50">
                                <img src={img.image_url} alt="" className={`w-full aspect-square object-cover ${isMain ? 'ring-2 ring-zinc-900 ring-offset-1' : ''}`} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                  {!isMain && (
                                    <button onClick={() => handleSetMainImage(img.image_url)}
                                      className="bg-white text-zinc-900 text-xs px-2 py-1 rounded-md hover:bg-amber-50 hover:text-amber-600 transition-colors">★</button>
                                  )}
                                  <button onClick={() => deleteImage(img)}
                                    className="bg-white text-red-400 text-xs px-2 py-1 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors">✕</button>
                                </div>
                                {isMain && (
                                  <div className="absolute top-1.5 left-1.5 bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded leading-none">★</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="space-y-3">
                        {imagePreview.length > 0 && (
                          <div className="grid grid-cols-4 gap-1.5">
                            {imagePreview.map((src, i) => (
                              <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-md opacity-60" />
                            ))}
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file" accept="image/*" multiple onChange={handleFileChange}
                          className="w-full text-xs text-gray-500 file:mr-3 file:text-xs file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:rounded-md file:text-gray-700 file:cursor-pointer hover:file:bg-gray-200 file:transition-colors"
                        />
                        {imageFiles.length > 0 && (
                          <button type="button" onClick={handleUploadImages} disabled={uploading}
                            className="w-full bg-gray-100 text-gray-800 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                            {uploading ? 'Se încarcă...' : `Încarcă ${imageFiles.length} imagine${imageFiles.length > 1 ? 'i' : ''}`}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-3">★ = imagine principală</p>
                  </>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium z-50 max-w-sm ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-zinc-900 text-white'
        }`}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
