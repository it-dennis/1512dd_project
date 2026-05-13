import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  const date = new Date(article.created_at).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="card hover:border-amber-500/50 transition-colors block group"
    >
      {article.category && (
        <span className="text-amber-500 font-mono text-xs uppercase tracking-wider">
          {article.category.name}
        </span>
      )}
      <h2 className="text-white font-bold text-lg mt-2 mb-3 group-hover:text-amber-100 transition-colors leading-snug">
        {article.title}
      </h2>
      {article.excerpt && (
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
          {article.excerpt}
        </p>
      )}
      <div className="mt-4 text-gray-600 font-mono text-xs">{date}</div>
    </Link>
  );
}
