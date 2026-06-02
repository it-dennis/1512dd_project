import { useState, useEffect } from 'react';
import { articlesApi, categoriesApi } from '../api/client';

const toSlug = (title) =>
  title.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const emptyForm = { title: '', slug: '', body: '', excerpt: '', category_id: '' };

export default function Admin() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadArticles();
    categoriesApi.list().then(r => setCategories(r.data));
  }, []);

  const loadArticles = () =>
    articlesApi.list().then(r => setArticles(r.data));

  const handleTitleChange = (val) => {
    setForm(f => ({ ...f, title: val, slug: editId ? f.slug : toSlug(val) }));
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const startEdit = (article) => {
    setForm({
      title: article.title,
      slug: article.slug,
      body: article.body,
      excerpt: article.excerpt || '',
      category_id: article.category?.id || '',
    });
    setEditId(article.id);
    setError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      title: form.title,
      body: form.body,
      excerpt: form.excerpt || null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    };
    try {
      if (editId) {
        await articlesApi.update(editId, payload);
      } else {
        await articlesApi.create({ ...payload, slug: form.slug });
      }
      await loadArticles();
      cancel();
    } catch (err) {
      setError(err.response?.data?.detail || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`„${title}" wirklich löschen?`)) return;
    await articlesApi.remove(id);
    loadArticles();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 font-mono">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-phosphor text-xl tracking-widest">[ ADMIN PANEL ]</h1>
        {!showForm && (
          <button onClick={startCreate} className="btn-primary text-sm">
            + Neuer Artikel
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-phosphor/30 p-6 mb-10 space-y-4">
          <h2 className="text-phosphor text-sm tracking-widest mb-4">
            {editId ? '[ ARTIKEL BEARBEITEN ]' : '[ NEUER ARTIKEL ]'}
          </h2>

          <div>
            <label className="block text-phosphor-muted text-xs mb-1">Titel *</label>
            <input
              className="w-full bg-crt-black border border-phosphor/30 text-phosphor font-mono text-sm px-3 py-2 focus:outline-none focus:border-phosphor"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              required
            />
          </div>

          {!editId && (
            <div>
              <label className="block text-phosphor-muted text-xs mb-1">Slug *</label>
              <input
                className="w-full bg-crt-black border border-phosphor/30 text-phosphor font-mono text-sm px-3 py-2 focus:outline-none focus:border-phosphor"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-phosphor-muted text-xs mb-1">Kategorie</label>
            <select
              className="w-full bg-crt-black border border-phosphor/30 text-phosphor font-mono text-sm px-3 py-2 focus:outline-none focus:border-phosphor"
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">— keine —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-phosphor-muted text-xs mb-1">Excerpt (Kurztext)</label>
            <input
              className="w-full bg-crt-black border border-phosphor/30 text-phosphor font-mono text-sm px-3 py-2 focus:outline-none focus:border-phosphor"
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-phosphor-muted text-xs mb-1">Inhalt (Markdown) *</label>
            <textarea
              className="w-full bg-crt-black border border-phosphor/30 text-phosphor font-mono text-sm px-3 py-2 focus:outline-none focus:border-phosphor resize-y"
              rows={16}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Speichern...' : editId ? 'Speichern' : 'Erstellen'}
            </button>
            <button type="button" onClick={cancel} className="btn-secondary text-sm">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-phosphor/20 text-phosphor-muted text-xs text-left">
            <th className="pb-2 pr-4">Titel</th>
            <th className="pb-2 pr-4">Kategorie</th>
            <th className="pb-2 pr-4">Datum</th>
            <th className="pb-2">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(a => (
            <tr key={a.id} className="border-b border-phosphor/10 hover:bg-phosphor/5 transition-colors">
              <td className="py-2 pr-4 text-phosphor">{a.title}</td>
              <td className="py-2 pr-4 text-phosphor-muted text-xs">{a.category?.name || '—'}</td>
              <td className="py-2 pr-4 text-phosphor-muted text-xs">
                {new Date(a.created_at).toLocaleDateString('de-DE')}
              </td>
              <td className="py-2 flex gap-3">
                <button
                  onClick={() => startEdit(a)}
                  className="text-phosphor/60 hover:text-phosphor text-xs underline transition-colors"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(a.id, a.title)}
                  className="text-red-500/60 hover:text-red-400 text-xs underline transition-colors"
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {articles.length === 0 && (
        <p className="text-phosphor-muted text-xs mt-6 text-center">Noch keine Artikel vorhanden.</p>
      )}
    </div>
  );
}
