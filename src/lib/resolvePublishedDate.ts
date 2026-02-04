import { execSync } from "node:child_process";
import path from "node:path";

const cache = new Map<string, Date | null>();

function gitFirstCommitDateISO(repoRelativePath: string): string | null {
  try {
    // %cI = committer date, strict ISO 8601
    // --diff-filter=A で初回コミットのみ、--follow で名前変更追跡
    const out = execSync(
      `git log --diff-filter=A --follow -1 --format=%cI -- "${repoRelativePath}"`,
      {
        stdio: ["ignore", "pipe", "ignore"],
      }
    )
      .toString()
      .trim();
    return out || null;
  } catch {
    return null;
  }
}

export function resolvePublishedDate(
  entry: { id: string; data: { date?: Date } },
  collectionDir: string
): Date {
  // 1) front matter があるならそれを優先
  if (entry.data.date instanceof Date) return entry.data.date;

  // 2) ないなら git の初回コミット日時（ファイル単位）
  // リポジトリ相対パス: src/content/news/hello.md
  const repoRelativePath = path.join(collectionDir, entry.id).replace(/\\/g, "/");

  const cached = cache.get(repoRelativePath);
  if (cached !== undefined) {
    if (cached === null) {
      throw new Error(
        `Published date not available for "${repoRelativePath}": ` +
        `date is not set and git first commit cannot be resolved (check git history or set date in front matter)`
      );
    }
    return cached;
  }

  const iso = gitFirstCommitDateISO(repoRelativePath);
  if (!iso) {
    cache.set(repoRelativePath, null);
    throw new Error(
      `Published date not available for "${repoRelativePath}": ` +
      `date is not set and git first commit cannot be resolved (check git history or set date in front matter)`
    );
  }

  const d = new Date(iso);
  cache.set(repoRelativePath, d);
  return d;
}

export function getGitFirstCommitDate(
  repoRelativePath: string
): Date | null {
  const cached = cache.get(repoRelativePath);
  if (cached !== undefined) return cached;

  const iso = gitFirstCommitDateISO(repoRelativePath);
  const d = iso ? new Date(iso) : null;
  cache.set(repoRelativePath, d);
  return d;
}
