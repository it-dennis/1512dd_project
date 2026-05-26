import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { articlesApi } from '../api/client';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    articlesApi.get(slug)
      .then(res => setArticle(res.data))
      .catch(() => setError('Artikel nicht gefunden.'));
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="card border-red-800 text-red-400 mb-6 font-mono text-sm">{error}</div>
        <Link to="/articles" className="text-green-400 hover:underline font-mono text-sm">
          ← Zurück zur Infothek
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 font-mono text-green-400 animate-pulse">
        Lade Artikel...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/articles" className="text-green-400 hover:underline mb-8 inline-block font-mono text-sm">
        ← Infothek
      </Link>

      {article.category && (
        <div className="text-green-400 font-mono text-xs uppercase tracking-wider mb-3 mt-6">
          {article.category.name}
        </div>
      )}

      <h1 className="text-4xl font-bold text-white mb-10 leading-tight">
        {article.title}
      </h1>

      <div className="md-content">
        <ReactMarkdown>{article.body}</ReactMarkdown>
      </div>
    </div>
  );
}
