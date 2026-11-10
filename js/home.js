/* ==========================================================================
   js/home.js (owner: F) — boots core, then every section module in page order.
   Each js/home/<name>.js exports init(ctx). A failing module is skipped with a
   console.warn and never blocks the others. To add a section: drop the file in
   js/home/ (stubs already exist for every planned name) — no edit needed here.
   ========================================================================== */
import { boot, runModules, finalize } from './core.js';

const ctx = boot();

const order = [
  'hero',        // SEC 01  F
  'stats',       // SEC 02  H1
  'reason',      // SEC 03  H1
  'works',       // SEC 04  H1
  'problems',    // SEC 05  H1
  'services',    // SEC 06  H2
  'process',     // SEC 07  H2
  'pricing',     // SEC 08  H2
  'experience',  // SEC 09  H2
  'signage',     // SEC 10  H2
  'profile',     // SEC 11  H2
  'faq',         // SEC 12  H2
  'contact'      // SEC 13  H2 (+ footer end-roll)
];

await runModules(ctx, order.map((name) => [name, () => import(`./home/${name}.js?v=onetake-20261111`)]));
finalize();
