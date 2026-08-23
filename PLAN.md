# VIDEO SIGNAGEセクション追加 ExecPlan

> 作成日時: 2026-08-23 19:23
> 最終更新: 2026-08-23 20:41

## ゴール

既存LPの「EXPERIENCE / 動画制作以外もご相談ください」の直後、「CREATOR PROFILE」の直前に、LARGE「43インチ 動画看板」とMINI「持ち運べる動画POP」のVIDEO SIGNAGEセクションを追加する。既存のA/B共通ソース・カード・ボタン・余白・色・スクロール表示を再利用し、PCでは2カラム、モバイルではLARGE→MINIの1カラムで表示する。今回の公開対象はB版のみとし、A版のpush/deployおよび外部公開は最終ゲート完了後まで行わない。

## 前提条件 / 環境

- 対象リポジトリ: `/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp`
- 仕様書: `/Users/junya/Downloads/01_仕様書/dogazukuri_signage_large_mini_codex_spec.md`
- 変更対象はA/B共通ソースの既存LP実装とする。バリアント固有の設定追加は行わない。
- plan-ledger workerの担当ファイルは `/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/PLAN.md` のみ。今回の全体実装では`index.html`、`styles.css`、`assets/signage/*`も担当workerが編集した。
- `game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json`は保全対象で変更なし。`index.html`、`styles.css`、`assets/signage/*`は今回の実装対象であり、既存差分を保持した上で意図した更新を追加した。
- 指定モデル・推論レベル: `gpt-5.6-luna` / `low`。実効モデルの確認可否: 未確認（今回も確認不可）。

## Progress

- [x] **フェーズ1: 既存実装と差分の把握**
  - [x] 対象リポジトリの共通HTML、既存CSS、レスポンシブブレークポイント、カード、ボタン、FAQ、スクロール表示、`#contact`導線を確認し、既存の構造・スタイルを再利用した。
  - [x] `index.html` のEXPERIENCE直後からCREATOR PROFILE直前がVIDEO SIGNAGEの挿入位置になっていることを確認した。
  - [x] 作業ツリーの既存差分を確認した。`game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json` は既存差分のまま不変で、コミット・GitHub pushは行っていない。

- [x] **フェーズ2: VIDEO SIGNAGEの共通ソース実装**
  - [x] `index.html` にVIDEO SIGNAGE見出し、リード文、LARGE/MINIの2カード、カード下の共通補足コピーを追加した。
  - [x] LARGEを「43インチ 動画看板」とし、料金を「機器代は実費。導入・設定サポート 50,000円〜」、設置環境に応じて屋内用・屋外対応モデルを提案する表現にした。
  - [x] MINIを「持ち運べる動画POP」とし、機器代実費＋初期設定・動画制作、用途に合わせた個別提案の表現にした。
  - [x] `styles.css` にnamespaced stylingを追加し、PC 2カラム、mobile 1カラム、既存の本文色・余白・カード表現・focus・hover・スクロール表示を再利用した。
  - [x] LARGE/MINIの画像を4:3 CSSプレースホルダーとし、将来の画像差し替えに対応できる構造にした。画像生成・素材削除・新規JavaScript/API・新規バリアント設定は行っていない。
  - [x] CTAは既存CONTACTへの`#contact`アンカーを使用した。初回無料・FIRST TEST・未確定の固定本体価格・保証表現・実績表現は追加していない。
  - [x] 既存FAQの開閉仕様を再利用し、機器購入、ループ再生、動画差し替え、屋外設置、LARGE/MINIの違いの5件を追加した。390px向けにh2のspan改行も追加した。

- [x] **フェーズ3: 静的検証と表示確認**
  - [x] `npm run build`、`DOGAZUKURI_VARIANT=b PUBLIC_SITE_URL=https://dogazukuri-b.pages.dev npm run build`、`node --check scripts.js`、`node --check scripts/build-variant.mjs`、`git diff --check` がすべてPASSした。
  - [x] ローカルブラウザでPC 1440pxの2カラム、カード・余白・CTA、mobile 390pxの1カラムを確認した。横overflowはなく、console error/warningもなかった。
  - [x] mobile 390pxでLARGE→MINIの順序、見出しの折返し、4:3 placeholder、CTAタップ、FAQ開閉を確認した。CTAはスムーススクロールした。
  - [x] 4:3 placeholder、CLS対策、将来の差し替え可能な構造、focus、48px CTA、`prefers-reduced-motion`対応を確認した。
  - [x] セクション文言・カード構造・共通補足により、機器販売だけでなく動画制作＋導入サポートとして伝わることを確認した。既存ナビ、Works、Price、FAQ、CONTACTの回帰も確認した。

- [x] **フェーズ4: 公開ゲート（前回完了履歴）**
  - [x] 最終ゲートでPC・スマートフォン双方のサイネージ表示、文言、CTA、FAQ、console error/warningなし、既存セクション回帰を確認した。
  - [x] B版のみをビルド・公開対象とし、Cloudflare Pages Direct Uploadに成功した。A版のpush/deployは行っていない。
  - [x] 最終ゲート後に外部公開した。公開URLは `https://c8807297.dogazukuri-b.pages.dev`、公開エイリアスは `https://dogazukuri-b.pages.dev/` である。
  - [x] 公開B版を`curl`でHTTP/2 200、認証なしブラウザでPC/mobile、VIDEO SIGNAGE、CTA、FAQ、console error/warningなしとして確認した。`#contact`遷移も確認した。
  - [x] 公開B版Worksの「もっと見る」後に36件（横長16・縦長20）を確認し、`wide-07`、`wide-10`、`wide-16`、`wide-17`、対象YouTube URLが表示されず、`work-wide-07`、`work-wide-10`、`work-wide-16`、`work-wide-17`が表示されないことを確認した。

- [ ] **フェーズ5: 第1波workerの実画像・料金更新**
  - [x] `assets/signage/signage-large.avif` / `signage-large.jpg` / `signage-mini.avif` / `signage-mini.jpg` を追加した。各1536x1152。LARGE/MINI各1回の内蔵`image_gen`を使用し、生成メタデータ上はgpt-image version 2.0。目視確認はJPEGで実施した。
  - [x] `index.html` はpicture＋AVIF source＋JPEG img、alt/width/height/loading=lazy/decoding=async、`signage-visual--image`、価格3行へ更新した。
  - [x] `styles.css` は画像表示時にplaceholder擬似要素を無効化し、価格項目と導入目安を強調した。
  - [x] 料金を更新した。LARGEは機器代実費（目安150,000円〜）／導入・設定サポート50,000円〜／導入目安200,000円〜。MINIは機器代実費（目安30,000円〜）／初期設定・導入サポート15,000円〜／導入目安45,000円〜。動画制作は別途、表示価格税込。
  - [x] 親QCでローカルdistを`127.0.0.1:4173`配信し、Codex in-app browserで画像ロードを確認した。PC 1440x900はAVIF currentSrc、complete=true、naturalWidth=1536、naturalHeight=1152、mobile 390x844もLARGE/MINI双方complete=true、1536x1152だった。

- [x] **フェーズ6: QA worker検証**
  - [x] 通常/B build、`node --check scripts.js`、`node --check scripts/build-variant.mjs`、`git diff --check`、`assets/dist`のAVIF/JPEG存在・1536x1152を親QCで再確認した。
  - [x] B Works 36件（横16／縦20）と`wide-07`、`wide-10`、`wide-16`、`wide-17`除外をPASSした。
  - [x] PC 1440x900でLARGE/MINI同一行2カラム（left 130/728、width 582）、`scrollWidth=clientWidth=1440`を確認した。mobile 390x844でLARGE→MINIの1カラム（left 18、width 354）、`scrollWidth=clientWidth=390`を確認した。
  - [x] FAQ全11件、その末尾5件が動画看板FAQであること、末尾の「LARGEとMINIの違いは？」をクリックして`open=true`になることを確認した。CTA 2件とも`href=#contact`だった。
  - [x] 主要ナビ、CONTACT、価格表示、console error/warning空配列を確認した。

- [ ] **フェーズ7: 公開ゲート（今回未実施）**
  - [ ] 画像追加・料金更新後のB版公開URLを認証なしで確認する。公開更新は未実施。
  - [ ] Cloudflare deploy、GitHub push、コミット、A版deployはユーザー承認と最終ゲート完了まで実施しない。

- [x] **フェーズ8: ユーザー承認とコミット／push実行計画**
  - [x] ユーザー承認を記録した。サイネージ関連だけをコミット対象とし、対象は`index.html`、`styles.css`、`PLAN.md`、`assets/signage/*`とする。
  - [x] `game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json`は既存未コミット差分としてstage／commitしない。
  - [x] コミットメッセージを`VIDEO SIGNAGE画像と導入価格を更新`とすることを決定した。
  - [x] `origin/main`へ通常pushし、force pushは行わない方針を承認した。
  - [x] GitHub Pagesがmain連携されている場合のA版自動公開反映を許可した。Cloudflare Pages B版Direct Uploadは実施しない。
  - [ ] push前に`npm run build`、`DOGAZUKURI_VARIANT=b PUBLIC_SITE_URL=https://dogazukuri-b.pages.dev npm run build`、`node --check scripts.js`、`node --check scripts/build-variant.mjs`、`git diff --check`、`git diff --cached --check`を実行する。
  - [ ] push前後のremote HEAD照合を行い、push後に保全対象だけが未コミットで残ることを確認する。
  - [ ] 本フェーズのコミット・push・自動公開反映は、このplan-ledger更新では実行していない。実行結果を別途確認してから完了扱いにする。

## Surprises & Discoveries

- 2026-08-23時点で、`game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json` に既存の未コミット差分がある。これらは今回の担当外として保全し、リセット・復元・編集を行わない。
- 仕様書は実画像未準備時のCSSプレースホルダーを許容していたが、第1波workerで実画像4種が追加された。既存のplaceholder履歴は削除せず、画像表示への更新履歴を追記した。
- 生成メタデータ上のモデルはgpt-image version 2.0。画像の目視はJPEGで実施した。ローカルdistではPC/mobile双方のlazy画像がcomplete=true、1536x1152だった。
- AVIFの形式・寸法・distコピーとJPEG fallbackのファイル存在、ローカルdistのブラウザ画像ロードはQAで確認済み。公開更新はまだ行われていない。
- `scripts.js`、`scripts/build-variant.mjs`、既存動画素材も変更していないことを確認対象として記録する。
- 前回のB版Direct Uploadと公開確認は完成履歴として保持する。今回の画像・料金改訂を含む公開更新とは別のゲートである。
- 今回の「今回未実施」公開履歴は保持したまま、ユーザー承認によりGitHub Pages main連携時のA版自動公開反映を許可する新しい実行計画を追加した。Cloudflare Pages B版Direct Uploadは対象外とする。

## Decision Log

- **A/B共通ソースへ実装する**: サービス追加はLP共通の情報構造であり、A/B間のソース分岐や新規バリアント設定を増やさないため。
- **公開はB版のみ**: 今回の目的と指示に従い、B版でのみ公開検証を行う。A版のpush/deployは行わない。
- **外部公開は最終ゲート後**: 静的チェックやビルド成功だけでは表示・導線・回帰を保証できないため、PC/モバイル・CTA・FAQ・既存セクションの確認後に限定する。
- **既存コンポーネントとCSSを再利用する**: 既存LPの世界観、カード、余白、色、レスポンシブ設計を維持し、新しいデザインシステムやCSSフレームワークを導入しない。
- **実画像はAVIF優先＋JPEG fallbackとする**: 軽量配信と表示互換性を両立するため。LARGE/MINI各AVIF・JPEGの相対パスは`assets/signage/`配下に固定する。
- **料金は本体価格を固定断定せず、導入目安を明示する**: 実費・サポート・動画制作別途の区分を保ち、表示価格税込で導入判断に必要な目安を示すため。
- **画像のブラウザnaturalWidthはローカルdistで確認済みとする**: PC/mobile双方でcomplete=true、1536x1152を確認したため。ただし公開URLでの画像ロード確認は公開ゲート未実施のため残課題とする。
- **保全対象の範囲を明記する**: `game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json`、`scripts.js`、`scripts/build-variant.mjs`、既存動画素材は変更しない。一方、`index.html`、`styles.css`、`assets/signage/*`は今回の全体実装対象として更新する。
- **保全対象と実装対象を分離する**: `game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json`は保全対象として変更しない。一方、`index.html`、`styles.css`、`assets/signage/*`は今回の全体実装対象であり、既存差分を保持した上で意図した更新を追加した。plan-ledger worker自身の編集対象はPLAN.mdのみとする。
- **承認済みのコミット対象をサイネージ関連に限定する**: `index.html`、`styles.css`、`PLAN.md`、`assets/signage/*`だけをstage／commit対象とし、`game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json`の既存未コミット差分はstage／commitしないため。
- **通常pushと公開経路を固定する**: `origin/main`へforce pushなしでpushし、GitHub Pagesのmain連携によるA版自動公開反映は許可する一方、Cloudflare Pages B版Direct Uploadは実施しないため。
- **push前後の検証を必須にする**: build、構文チェック、working/cached diff check、remote HEAD照合、保全対象だけが未コミットで残ることの確認を、コミット・push完了条件にするため。

## Outcomes & Retrospective

- 前回の完成履歴を復元した。VIDEO SIGNAGEのフェーズ1〜4、B版公開URL、認証なし公開確認、Works 36件、前回の未完了事項を保持している。
- 第1波workerの画像4種追加、1536x1152、内蔵image_gen、AVIF＋JPEG構成、index/CSS更新、価格3行更新を今回の改訂履歴として追記した。
- QA workerおよび親QCの通常/B build、構文チェック、diff check、画像形式・寸法・distコピー、PC/mobile表示、回帰、console error 0を記録した。
- 未完了事項は、今回の画像・料金改訂の公開ゲートである。公開更新、Cloudflare deploy、GitHub push、コミット、A版deployは今回実施していない。
- ユーザー承認により、サイネージ関連4範囲（`index.html`、`styles.css`、`PLAN.md`、`assets/signage/*`）の限定コミット、指定メッセージ`VIDEO SIGNAGE画像と導入価格を更新`、`origin/main`への通常push、GitHub Pages A版自動公開反映を実行予定として記録した。Cloudflare Pages B版Direct Uploadは実施しない。
- 承認内容の台帳追記のみ完了しており、コミット、push、remote HEAD照合、push後の保全対象確認、GitHub Pages自動公開結果は未実施である。これらはフェーズ8の未完了事項として残す。
- 保全対象の`game-demo.html`、`game-demo.css`、`game-demo.js`、`variants/b.json`、`scripts.js`、`scripts/build-variant.mjs`、既存動画素材は変更していない。今回の全体実装で更新された絶対パスは、`/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/index.html`、`/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/styles.css`、`/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/PLAN.md`、`/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/assets/signage/signage-large.avif`、`/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/assets/signage/signage-large.jpg`、`/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/assets/signage/signage-mini.avif`、`/Users/junya/Documents/ツール形/LP制作/dogazukuri-lp/assets/signage/signage-mini.jpg`である。
- 要求モデル／推論レベルは `gpt-5.6-luna` / `low`。実効モデルの確認可否は不可・未確認。
