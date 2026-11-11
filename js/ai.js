/* ==========================================================================
   js/ai.js (owner: AI) — AI広告メディア支援ページの起動。
   core.boot() → 各セクション module（失敗は個別に隔離）→ core.finalize()。
   語彙は「生成」: intro(シードノイズ) / hud(STEP・SEED) / hero(デノイズ) /
   latent(潜在空間モーフ) / strip(慣性フィルムストリップ) / queue(レンダーキュー) /
   graph(ノードグラフ) / chat(プロンプト応答) / contact(プロンプトバー CTA)
   ========================================================================== */
import { boot, runModules, finalize } from './core.js';

const ctx = boot();

const order = ['intro', 'hud', 'hero', 'latent', 'strip', 'queue', 'graph', 'chat', 'contact'];

await runModules(ctx, order.map((name) => [name, () => import(`./ai/${name}.js?v=onetake-20261111`)]));
finalize();
