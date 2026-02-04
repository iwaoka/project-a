import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const newsDir = path.join(__dir, '../src/content/news');
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.md'));

const errors = [];
const slugs = new Set();

function gitFirstCommitDateISO(repoRelativePath) {
  try {
    const out = execSync(
      `git log --diff-filter=A --follow -1 --format=%cI -- "${repoRelativePath}"`,
      { stdio: ['ignore', 'pipe', 'ignore'] }
    )
      .toString()
      .trim();
    return out || null;
  } catch {
    return null;
  }
}

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(content);
  const slug = file.replace(/\.md$/, '');

  if (!data.title) errors.push(`${file}: title が未設定`);
  if (!data.description) errors.push(`${file}: description が未設定`);
  if (!body.trim()) errors.push(`${file}: 本文が空`);

  if (data.date && isNaN(new Date(data.date).getTime())) {
    errors.push(`${file}: date が無効な形式 (YYYY-MM-DD推奨)`);
  }

  if (!data.date) {
    const repoRelativePath = path.join('src/content/news', file).replace(/\\/g, '/');
    const gitDate = gitFirstCommitDateISO(repoRelativePath);
    if (!gitDate) {
      errors.push(`${file}: date が未設定で、git初回コミット日時も取得できません（浅いcloneが疑われます）`);
    }
  }

  if (slugs.has(slug)) {
    errors.push(`${file}: 重複するslug "${slug}"`);
  }
  slugs.add(slug);

  if (data.draft !== undefined && typeof data.draft !== 'boolean') {
    errors.push(`${file}: draft は true/false のみ許可`);
  }
});

if (errors.length > 0) {
  console.error(' Validation failed:');
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log(' Validation passed!');
}
