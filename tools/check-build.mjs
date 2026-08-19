// Fails if the committed HTML does not match what content/*.json renders.
// Run before committing: a stale page is worse than no build step, because the
// data file and the live page disagree and nobody can tell which is right.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const before = fs.readdirSync('.').filter(f => f.endsWith('.html'))
  .map(f => [f, fs.readFileSync(f, 'utf8')]);

execSync('node tools/build.mjs', { stdio: 'pipe' });

const stale = before.filter(([f, was]) => fs.readFileSync(f, 'utf8') !== was).map(([f]) => f);

if (stale.length) {
  // put the tree back so the check has no side effects
  before.forEach(([f, was]) => fs.writeFileSync(f, was));
  console.error('Pages are out of date with content/:\n  ' + stale.join('\n  '));
  console.error('\nRun: node tools/build.mjs');
  process.exit(1);
}
console.log('HTML matches content/');
