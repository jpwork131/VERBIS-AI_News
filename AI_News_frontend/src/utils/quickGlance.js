export const getQuickGlanceData = (articles, activeCategory) => {
  if (!articles || articles.length === 0) return null;

  // Latest
  const latest = articles[0];

  // Top Category
  const categoryCount = {};
  articles.forEach(a => categoryCount[a.category] = (categoryCount[a.category] || 0) + 1);
  const topCategory = Object.keys(categoryCount).reduce(
    (a,b) => categoryCount[a] > categoryCount[b] ? a : b
  );

  // AI Pick: longest summary
  const first10 = articles.slice(0, 10);
    const aiPick = first10.reduce((best, a) => {
    if (!best || (a.summary && a.summary.length > best.summary.length)) return a;
    return best;
    }, null);

  // Trending: random from top 5 newest
    const top5 = articles.slice(0, Math.min(5, articles.length));
    const trending = top5[Math.floor(Math.random() * top5.length)];


  return { latest, topCategory, aiPick, trending };
  };

