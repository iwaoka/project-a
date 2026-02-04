import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { resolvePublishedDate } from '../lib/resolvePublishedDate';

export async function GET(context) {
  const posts = (await getCollection('news', ({ data }) => !data.draft))
    .map((p) => ({
      ...p,
      publishedAt: resolvePublishedDate(p, 'src/content/news'),
    }))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return rss({
    title: 'お知らせ',
    description: 'プロジェクトAのお知らせ',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.publishedAt,
      description: post.data.description,
      link: `/news/${post.slug}/`,
    })),
  });
}
