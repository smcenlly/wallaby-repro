import type { Plugin } from 'vite';

/**
 * Diagnostic plugin that traces module resolution for files related to the
 * FacetType enum barrel-file issue. Logs resolveId and load calls so we can
 * see if the same file gets different module IDs (split identity).
 */
export function moduleResolutionTracer(): Plugin {
  return {
    name: 'module-resolution-tracer',
    enforce: 'post',
    resolveId: {
      order: 'post' as const,
      async handler(source, importer) {
        if (
          source.includes('facet') ||
          source.includes('shared-ui') ||
          source.includes('filter') ||
          (source.includes('index') && importer?.includes('shared'))
        ) {
          console.log(
            `[TRACE resolveId] source="${source}" importer="${importer}"`
          );
        }
        return null; // don't resolve, just trace
      },
    },
    load(id) {
      if (
        id.includes('facet') ||
        (id.includes('shared') && id.includes('ui') && id.includes('index'))
      ) {
        console.log(`[TRACE load] id="${id}"`);
      }
      return null;
    },
  };
}

/**
 * Diagnostic plugin that tracks every module ID that passes through the
 * transform hook (post-resolution). Detects if the same underlying file
 * is seen with multiple different module IDs (split identity), which would
 * cause duplicate module evaluations and undefined exports.
 */
export function moduleIdLogger(): Plugin {
  // Map from normalized basename → Set of full IDs seen
  const seenIds = new Map<string, Set<string>>();

  function extractBasename(id: string): string {
    // Strip query strings and hashes
    const clean = id.replace(/[?#].*$/, '');
    // Get the last path segment (works with both / and \)
    const parts = clean.split(/[\\/]/);
    return parts[parts.length - 1];
  }

  function isRelevantFile(id: string): boolean {
    return (
      id.includes('facet') ||
      id.includes('filter.type') ||
      (id.includes('shared') && id.includes('index'))
    );
  }

  return {
    name: 'module-id-logger',
    enforce: 'post',

    transform(code, id) {
      if (!isRelevantFile(id)) return null;

      const basename = extractBasename(id);
      if (!seenIds.has(basename)) {
        seenIds.set(basename, new Set());
      }
      const ids = seenIds.get(basename)!;
      const isNew = !ids.has(id);
      ids.add(id);

      console.log(
        `[MODULE-LOG transform] id="${id}"` +
          ` (${isNew ? 'NEW' : 'cached'}, ${ids.size} variant(s) for "${basename}")`
      );

      // Alert if we see the same file with multiple different IDs
      if (ids.size > 1) {
        console.log(
          `[MODULE-LOG *** SPLIT IDENTITY DETECTED ***] "${basename}" has ${ids.size} IDs:`
        );
        for (const seenId of ids) {
          console.log(`  -> "${seenId}"`);
        }
      }

      return null;
    },

    buildEnd() {
      console.log('\n[MODULE-LOG Summary]');
      for (const [basename, ids] of seenIds) {
        if (ids.size > 1) {
          console.log(
            `  *** SPLIT: "${basename}" — ${ids.size} different IDs:`
          );
          for (const id of ids) {
            console.log(`    -> "${id}"`);
          }
        } else {
          console.log(`  OK: "${basename}" — 1 ID: "${[...ids][0]}"`);
        }
      }
    },
  };
}
