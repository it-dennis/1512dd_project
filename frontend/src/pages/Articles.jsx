import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { articlesApi } from '../api/client';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSlug, setOpenSlug] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Alle');

  useEffect(() => {
    articlesApi.list()
      .then(res => setArticles(res.data))
      .catch(() => setError('Backend nicht erreichbar. Läuft docker compose up?'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Alle', ...new Set(articles.map(a => a.category?.name).filter(Boolean))];

  const filtered = activeCategory === 'Alle'
    ? articles
    : articles.filter(a => a.category?.name === activeCategory);

  const toggle = (slug) => setOpenSlug(prev => prev === slug ? null : slug);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Infothek</h1>
      <p className="mb-6 font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
        Alles über den Amstrad PC1512-DD
      </p>

      <div className="mb-8 card flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'rgba(57,255,122,0.2)' }}>
        <div>
          <span className="text-phosphor font-mono text-xs uppercase tracking-wider">Hardware</span>
          <p className="text-white font-bold mt-0.5">Technische Daten des PC1512-DD</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(170,255,204,0.50)' }}>
            Prozessor, RAM, Grafik und Laufwerke im Detail erklärt.
          </p>
        </div>
        <Link to="/technik" className="btn-secondary text-sm px-5 py-2 flex-shrink-0">
          Technische Daten →
        </Link>
      </div>

      {loading && (
        <div className="font-mono text-phosphor animate-pulse">Lade Artikel...</div>
      )}

      {error && (
        <div className="card border-red-800 text-red-400 font-mono text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded font-mono text-xs uppercase tracking-wider transition-colors ${
                  activeCategory === cat
                    ? 'bg-phosphor text-black font-bold'
                    : 'border border-phosphor-muted/30 hover:border-phosphor/50 hover:text-phosphor'
                }`}
                style={activeCategory !== cat ? { color: 'rgba(170,255,204,0.60)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map(article => {
              const isOpen = openSlug === article.slug;
              return (
                <div
                  key={article.slug}
                  className={`card transition-colors ${isOpen ? 'border-phosphor/30' : 'hover:border-phosphor-muted/40'}`}
                >
                  <button
                    onClick={() => toggle(article.slug)}
                    className="w-full text-left flex items-start justify-between gap-4 group"
                  >
                    <div>
                      {article.category && (
                        <span className="text-phosphor font-mono text-xs uppercase tracking-wider">
                          {article.category.name}
                        </span>
                      )}
                      <h2 className="text-white font-bold text-lg mt-1 group-hover:text-phosphor-soft transition-colors leading-snug">
                        {article.title}
                      </h2>
                      {!isOpen && article.excerpt && (
                        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(170,255,204,0.50)' }}>
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-phosphor mt-1 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-6 pt-6 border-t border-phosphor-muted/20">
                      <div className="md-content">
                        <ReactMarkdown>{article.body}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="font-mono" style={{ color: 'rgba(30,167,88,0.60)' }}>Keine Artikel in dieser Kategorie.</div>
          )}
        </>
      )}
    </div>
  );
}
