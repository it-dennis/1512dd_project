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
      className="card hover:border-phosphor/50 transition-colors block group"
    >
      {article.category && (
        <span className="text-phosphor font-mono text-xs uppercase tracking-wider">
          {article.category.name}
        </span>
      )}
      <h2 className="text-white font-bold text-lg mt-2 mb-3 group-hover:text-phosphor-soft transition-colors leading-snug">
        {article.title}
      </h2>
      {article.excerpt && (
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'rgba(170,255,204,0.60)' }}>
          {article.excerpt}
        </p>
      )}
      <div className="mt-4 font-mono text-xs" style={{ color: 'rgba(30,167,88,0.50)' }}>{date}</div>
    </Link>
  );
}
