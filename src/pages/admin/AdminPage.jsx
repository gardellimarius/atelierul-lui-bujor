import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/AdminSidebar'

const defaultSettings = { hero_title: '', hero_title_italic: '', hero_subtitle: '', contact_email: '', phone: '', location_name: '', location_address: '', schedule_luni: '', schedule_marti: '', schedule_miercuri: '', schedule_joi: '', schedule_vineri: '', schedule_sambata: '', schedule_duminica: '', location_coords: '' }

const scheduleDays = [
  { key: 'schedule_luni', label: 'Luni' },
  { key: 'schedule_marti', label: 'Marți' },
  { key: 'schedule_miercuri', label: 'Miercuri' },
  { key: 'schedule_joi', label: 'Joi' },
  { key: 'schedule_vineri', label: 'Vineri' },
  { key: 'schedule_sambata', label: 'Sâmbătă' },
  { key: 'schedule_duminica', label: 'Duminică' },
]

const PAGE_SIZE = 10

function IconSearch() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function AdminPage() {
  const location = useLocation()
  const [view, setView] = useState(location.state?.view || 'products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('all')
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [settings, setSettings] = useState(defaultSettings)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)

  const navigate = useNavigate()

  useEffect(() => { fetchProducts(); fetchSettings(); fetchCategories() }, [])
  useEffect(() => { setPage(1) }, [search, typeFilter])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('key, value')
    if (data) {
      const map = {}
      data.forEach(s => { map[s.key] = s.value })
      setSettings(prev => ({ ...prev, ...map }))
    }
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  async function addCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    setCategoryLoading(true)
    const { error } = await supabase.from('categories').insert({ name, type: newCategoryType })
    if (error) {
      showToast(error.message, 'error')
    } else {
      setNewCategoryName('')
      setNewCategoryType('all')
      await fetchCategories()
      showToast(`Categorie „${name}" creată`)
    }
    setCategoryLoading(false)
  }

  async function deleteCategory(id, name) {
    if (!confirm(`Ștergi categoria „${name}"? Produsele rămân, dar pierd categoria.`)) return
    await supabase.from('categories').delete().eq('id', id)
    await fetchCategories()
    showToast('Categorie ștearsă', 'error')
  }

  async function toggleCategoryNavbar(cat) {
    const newVal = cat.show_in_navbar === false ? true : false
    await supabase.from('categories').update({ show_in_navbar: newVal }).eq('id', cat.id)
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, show_in_navbar: newVal } : c))
  }

  async function saveSettings() {
    setSettingsSaving(true)
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
    }
    setSettingsSaving(false)
    showToast('Setările au fost salvate')
  }

  async function handleDelete(id) {
    if (!confirm('Ștergi această lucrare?')) return
    await supabase.from('products').delete().eq('id', id)
    await fetchProducts()
    showToast('Lucrare ștearsă', 'error')
  }

  const filtered = products
    .filter(p => typeFilter === 'all' || p.type === typeFilter || (!p.type && typeFilter === 'painting'))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const stats = [
    { label: 'Total lucrări', value: products.length, color: 'text-gray-900' },
    { label: 'Picturi', value: products.filter(p => p.type === 'painting' || !p.type).length, color: 'text-violet-600' },
    { label: 'Rame', value: products.filter(p => p.type === 'frame').length, color: 'text-blue-600' },
    { label: 'Recomandate', value: products.filter(p => p.bestseller).length, color: 'text-amber-600' },
  ]

  const inp = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
  const lbl = "block text-xs font-medium text-gray-500 mb-1.5"

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar activeView={view} onNavigate={setView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between flex-shrink-0">
          <h1 className="text-sm font-semibold text-gray-900">
            {view === 'products' ? 'Lucrări' : 'Conținut'}
          </h1>
          {view === 'products' && (
            <button
              onClick={() => navigate('/admin/products/new')}
              className="bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              + Lucrare nouă
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {view === 'products' && (
            <div className="space-y-5">

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm">
                    <p className="text-xs text-gray-400 mb-2">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <IconSearch />
                    </span>
                    <input
                      type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Caută după titlu sau categorie..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent transition"
                    />
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5 flex-shrink-0">
                    {[['all', 'Toate'], ['painting', 'Picturi'], ['frame', 'Rame']].map(([t, l]) => (
                      <button key={t} onClick={() => setTypeFilter(t)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          typeFilter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                        }`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {paged.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-sm text-gray-400">
                        {search ? `Niciun rezultat pentru „${search}"` : 'Nicio lucrare încă.'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                          <th className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Lucrare</th>
                          <th className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tip</th>
                          <th className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 text-right">Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {paged.map(product => (
                          <tr
                            key={product.id}
                            className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/products/${product.id}`)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                  {product.image_url
                                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🖼</div>
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate leading-tight">{product.name}</p>
                                  {product.category && <p className="text-xs text-gray-400 mt-0.5 truncate">{product.category}</p>}
                                </div>
                                {product.bestseller && (
                                  <span className="flex-shrink-0 text-[10px] font-semibold bg-amber-50 text-amber-500 border border-amber-200 px-1.5 py-0.5 rounded-full">★</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                product.type === 'frame' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
                              }`}>
                                {product.type === 'frame' ? 'Ramă' : 'Pictură'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => navigate(`/admin/products/${product.id}`)}
                                  className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                  Editează
                                </button>
                                <button onClick={() => handleDelete(product.id)}
                                  className="text-xs text-gray-300 hover:text-red-500 transition-colors">
                                  Șterge
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-gray-400">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} din {filtered.length}
                    </p>
                    <div className="flex gap-1">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center text-sm rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">‹</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n} onClick={() => setPage(n)}
                          className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg border transition-colors ${
                            n === page ? 'bg-zinc-900 text-white border-zinc-900' : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900'
                          }`}>
                          {n}
                        </button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="w-8 h-8 flex items-center justify-center text-sm rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">›</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'content' && (
            <div className="max-w-2xl space-y-5">

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Categorii</h3>
                <p className="text-xs text-gray-400 mb-5">Categoriile apar în meniu și pe pagina de produse.</p>

                {categories.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-800 font-medium">{cat.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            cat.type === 'painting' ? 'bg-violet-50 text-violet-500' :
                            cat.type === 'frame' ? 'bg-blue-50 text-blue-500' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {cat.type === 'painting' ? 'Picturi' : cat.type === 'frame' ? 'Rame' : 'Toate'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleCategoryNavbar(cat)}
                            title={cat.show_in_navbar === false ? 'Afișează în navbar' : 'Ascunde din navbar'}
                            className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                              cat.show_in_navbar === false
                                ? 'text-gray-300 bg-gray-100 hover:text-gray-500'
                                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {cat.show_in_navbar === false
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              }
                            </svg>
                            Navbar
                          </button>
                          <button onClick={() => deleteCategory(cat.id, cat.name)}
                            className="text-xs text-gray-300 hover:text-red-500 transition-colors px-1">
                            Șterge
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-3">Categorie nouă</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                      placeholder="ex: Peisaje de vară"
                      className={`${inp} flex-1`}
                    />
                    <select
                      value={newCategoryType}
                      onChange={e => setNewCategoryType(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-transparent"
                    >
                      <option value="all">Toate</option>
                      <option value="painting">Picturi</option>
                      <option value="frame">Rame</option>
                    </select>
                    <button
                      type="button"
                      onClick={addCategory}
                      disabled={categoryLoading || !newCategoryName.trim()}
                      className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Pagina principală — Hero</h3>
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>Titlu (normal)</label>
                    <input type="text" value={settings.hero_title} onChange={e => setSettings({ ...settings, hero_title: e.target.value })} placeholder="Artă originală," className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Titlu italic (linia 2)</label>
                    <input type="text" value={settings.hero_title_italic} onChange={e => setSettings({ ...settings, hero_title_italic: e.target.value })} placeholder="pictată cu dragoste." className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Subtitlu</label>
                    <textarea value={settings.hero_subtitle} onChange={e => setSettings({ ...settings, hero_subtitle: e.target.value })} rows={3} placeholder="Fiecare lucrare este unică..." className={`${inp} resize-none`} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Email formular</label>
                    <input type="email" value={settings.contact_email} onChange={e => setSettings({ ...settings, contact_email: e.target.value })} placeholder="contact@atelierullui.ro" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Telefon</label>
                    <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+40 700 000 000" className={inp} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-5">Locație fizică</h3>
                <div className="space-y-4">
                  <div>
                    <label className={lbl}>Nume atelier</label>
                    <input type="text" value={settings.location_name} onChange={e => setSettings({ ...settings, location_name: e.target.value })} placeholder="Atelierul lui Bujor" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Adresă</label>
                    <input type="text" value={settings.location_address} onChange={e => setSettings({ ...settings, location_address: e.target.value })} placeholder="Str. Exemplu nr. 1, Oraș" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Program (ore deschidere per zi)</label>
                    <div className="space-y-2">
                      {scheduleDays.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</span>
                          <input
                            type="text"
                            value={settings[key]}
                            onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                            placeholder="Închis"
                            className={inp}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">Lasă gol pentru zilele închise.</p>
                  </div>

                </div>
              </div>

              <button
                onClick={saveSettings} disabled={settingsSaving}
                className="bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {settingsSaving ? 'Se salvează...' : 'Salvează setările'}
              </button>
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
