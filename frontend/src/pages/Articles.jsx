import { useEffect, useState } from 'react';
import { articlesApi } from '../api/client';
import ArticleCard from '../components/ArticleCard';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    articlesApi.list()
      .then(res => setArticles(res.data))
      .catch(() => setError('Backend nicht erreichbar. Läuft docker compose up?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Infothek</h1>
      <p className="text-gray-400 mb-10 font-mono text-sm">
        Alles über den Amstrad PC1512-DD
      </p>

      {loading && (
        <div className="font-mono text-amber-500 animate-pulse">Lade Artikel...</div>
      )}

      {error && (
        <div className="card border-red-800 text-red-400 mb-8 font-mono text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {!loading && !error && articles.length === 0 && (
        <div className="text-gray-500 font-mono">Noch keine Artikel vorhanden.</div>
      )}
    </div>
  );
}
