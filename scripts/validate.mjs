import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const newsDir = new URL('../src/content/news/', import.meta.url);
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.md'));

const errors = [];
const slugs = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(newsDir.pathname, file), 'utf-8');
  const { data, content: body } = matter(content);
  const slug = file.replace(/\.md$/, '');

  // 必須項目チェック
  if (!data.title) errors.push(`${file}: title が未設定`);
  if (!data.date) errors.push(`${file}: date が未設定`);
  if (!data.description) errors.push(`${file}: description が未設定`);
  if (!body.trim()) errors.push(`${file}: 本文が空`);

  // 日付フォーマットチェック
  if (data.date && isNaN(new Date(data.date).getTime())) {
    errors.push(`${file}: date が無効な形式 (YYYY-MM-DD推奨)`);
  }

  // slug重複チェック
  if (slugs.has(slug)) {
    errors.push(`${file}: 重複するslug "${slug}"`);
  }
  slugs.add(slug);

  // draftが boolean チェック
  if (data.draft !== undefined && typeof data.draft !== 'boolean') {
    errors.push(`${file}: draft は true/false のみ許可`);
  }
});

if (errors.length > 0) {
  console.error('❌ Validation failed:');
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log('✅ Validation passed!');
}
