import { useEffect, useState } from 'react';
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
      <p className="text-gray-400 mb-8 font-mono text-sm">
        Alles über den Amstrad PC1512-DD
      </p>

      {loading && (
        <div className="font-mono text-green-400 animate-pulse">Lade Artikel...</div>
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
                    ? 'bg-[#00FF41] text-black font-bold'
                    : 'border border-gray-700 text-gray-400 hover:border-green-400/50 hover:text-green-400'
                }`}
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
                  className={`card transition-colors ${isOpen ? 'border-green-400/30' : 'hover:border-gray-700'}`}
                >
                  <button
                    onClick={() => toggle(article.slug)}
                    className="w-full text-left flex items-start justify-between gap-4 group"
                  >
                    <div>
                      {article.category && (
                        <span className="text-green-400 font-mono text-xs uppercase tracking-wider">
                          {article.category.name}
                        </span>
                      )}
                      <h2 className="text-white font-bold text-lg mt-1 group-hover:text-green-100 transition-colors leading-snug">
                        {article.title}
                      </h2>
                      {!isOpen && article.excerpt && (
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-green-400 mt-1 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-6 pt-6 border-t border-gray-800">
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
            <div className="text-gray-500 font-mono">Keine Artikel in dieser Kategorie.</div>
          )}
        </>
      )}
    </div>
  );
}
