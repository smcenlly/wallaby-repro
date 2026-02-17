// Path diagnostics for Windows Server 2022 module resolution investigation
// Run with: node diagnose.mjs
import { realpathSync, lstatSync } from 'fs';
import { resolve, join } from 'path';
import { platform, release, version } from 'os';

const cwd = process.cwd();
const resolved = resolve('.');
let nativeRealpath;
try { nativeRealpath = realpathSync.native('.'); } catch (e) { nativeRealpath = 'ERROR: ' + e.message; }
let realpath;
try { realpath = realpathSync('.'); } catch (e) { realpath = 'ERROR: ' + e.message; }

console.log('=== Path Diagnostics ===');
console.log('process.cwd():', cwd);
console.log('path.resolve(.):', resolved);
console.log('realpathSync(.):', realpath);
console.log('realpathSync.native(.):', nativeRealpath);
console.log('cwd === resolved:', cwd === resolved);
console.log('cwd === realpath:', cwd === realpath);
console.log('cwd === nativeRealpath:', cwd === nativeRealpath);
console.log('Drive letter (cwd):', cwd[0]);
console.log('Drive letter (resolved):', resolved[0]);
console.log('');
console.log('=== Environment ===');
console.log('process.platform:', process.platform);
console.log('os.platform():', platform());
console.log('os.release():', release());
console.log('os.version():', version());
console.log('Node.js:', process.version);
console.log('');

// Check for junction points / symlinks
const testPaths = [
  cwd,
  join(cwd, 'libs'),
  join(cwd, 'libs', 'shared', 'ui', 'src', 'lib', 'facet.type.ts'),
  join(cwd, 'libs', 'shared', 'ui', 'src', 'index.ts'),
  join(cwd, 'apps', 'test-app', 'src', 'app', 'filter.type.ts'),
  join(cwd, 'apps', 'test-app', 'src', 'app', 'app.spec.ts'),
  join(cwd, 'node_modules'),
];

console.log('=== Junction/Symlink Check ===');
for (const p of testPaths) {
  try {
    const real = realpathSync(p);
    const nativeReal = realpathSync.native(p);
    const stat = lstatSync(p);
    const isSymlink = stat.isSymbolicLink();
    if (p !== real || p !== nativeReal || isSymlink) {
      console.log(`MISMATCH: ${p}`);
      console.log(`  realpath:        ${real}`);
      console.log(`  realpath.native: ${nativeReal}`);
      console.log(`  isSymbolicLink:  ${isSymlink}`);
    } else {
      console.log(`OK: ${p}`);
    }
  } catch (e) {
    console.log(`ERROR for ${p}: ${e.message}`);
  }
}

console.log('');
console.log('=== Drive letter case comparison ===');
try {
  const nativeOfCwd = realpathSync.native(cwd);
  console.log('cwd:              ', JSON.stringify(cwd.slice(0, 10)));
  console.log('native realpath:  ', JSON.stringify(nativeOfCwd.slice(0, 10)));
  if (cwd.slice(0, 3) !== nativeOfCwd.slice(0, 3)) {
    console.log('*** DRIVE LETTER / PREFIX MISMATCH DETECTED ***');
    console.log('This is likely causing the Wallaby module resolution issue!');
  }
} catch (e) {
  console.log('Could not compare:', e.message);
}

console.log('');
console.log('=== \\\\?\\ prefix check (Windows native realpath) ===');
try {
  const nativeOfCwd = realpathSync.native(cwd);
  if (nativeOfCwd.startsWith('\\\\?\\')) {
    console.log('*** NATIVE REALPATH USES \\\\?\\ PREFIX ***');
    console.log('Native realpath:', nativeOfCwd);
    console.log('This UNC-style prefix can cause module ID mismatches in Vite.');
  } else {
    console.log('No \\\\?\\ prefix detected (good).');
  }
} catch (e) {
  console.log('Could not check:', e.message);
}
