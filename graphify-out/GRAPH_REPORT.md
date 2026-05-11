# Graph Report - .  (2026-05-11)

## Corpus Check
- Corpus is ~12,657 words - fits in a single context window. You may not need a graph.

## Summary
- 221 nodes · 305 edges · 33 communities (22 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Routes|API Routes]]
- [[_COMMUNITY_Dashboard History|Dashboard History]]
- [[_COMMUNITY_Tweaks Panel|Tweaks Panel]]
- [[_COMMUNITY_App Pages|App Pages]]
- [[_COMMUNITY_Feeding Form|Feeding Form]]
- [[_COMMUNITY_Settings Modal|Settings Modal]]
- [[_COMMUNITY_Dry Progress|Dry Progress]]
- [[_COMMUNITY_Settings & Widget|Settings & Widget]]
- [[_COMMUNITY_App Layout|App Layout]]
- [[_COMMUNITY_Feeding Components|Feeding Components]]
- [[_COMMUNITY_Settings API|Settings API]]
- [[_COMMUNITY_Purchases API|Purchases API]]
- [[_COMMUNITY_Bulk Feeding|Bulk Feeding]]
- [[_COMMUNITY_Stock Widget|Stock Widget]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_Purchase Components|Purchase Components]]
- [[_COMMUNITY_Push & DB Services|Push & DB Services]]
- [[_COMMUNITY_Auth Utils|Auth Utils]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_NextJS Config|NextJS Config]]
- [[_COMMUNITY_Push Subscription DB|Push Subscription DB]]
- [[_COMMUNITY_Architecture|Architecture]]
- [[_COMMUNITY_Favicon Mascot|Favicon Mascot]]
- [[_COMMUNITY_Push Test API|Push Test API]]
- [[_COMMUNITY_Tweaks Panel Component|Tweaks Panel Component]]
- [[_COMMUNITY_Orb Layer Component|Orb Layer Component]]
- [[_COMMUNITY_Cron Setup|Cron Setup]]
- [[_COMMUNITY_Apple Touch Icon|Apple Touch Icon]]

## God Nodes (most connected - your core abstractions)
1. `supabase` - 14 edges
2. `sendPushToAll()` - 8 edges
3. `Feedings Table` - 7 edges
4. `checkBearer()` - 6 edges
5. `Stock API` - 6 edges
6. `Feeding` - 5 edges
7. `Settings` - 5 edges
8. `useCountUp()` - 5 edges
9. `Status API` - 5 edges
10. `Settings Table` - 5 edges

## Surprising Connections (you probably didn't know these)
- `iPhone Shortcuts` --conceptually_related_to--> `checkBearer`  [INFERRED]
  SETUP.md → lib/auth.ts
- `GET()` --calls--> `checkBearer()`  [EXTRACTED]
  app/api/status/route.ts → lib/auth.ts
- `POST()` --calls--> `sendPushToAll()`  [EXTRACTED]
  app/api/push/test/route.ts → lib/webpush.ts
- `StockWidget()` --calls--> `useCountUp()`  [EXTRACTED]
  components/StockWidget.tsx → lib/hooks.ts
- `DryProgress()` --calls--> `useCountUp()`  [EXTRACTED]
  components/DryProgress.tsx → lib/hooks.ts

## Hyperedges (group relationships)
- **Feeding Management Flow** — DashboardPage, api_feedings, api_feedings_id, api_feedings_bulk, db_feedings [INFERRED 0.90]
- **Authentication Flow** — middleware, LoginPage, api_auth [INFERRED 0.95]
- **Stock Tracking Flow** — api_stock, cron_check_stock, db_purchases, db_feedings [INFERRED 0.85]
- **Push Notification System** — registerPush, resubscribePush, sendPushToAll, service_worker, push_notification_flow [INFERRED 0.90]
- **Stock Management Flow** — StockWidget, PurchaseModal, PurchaseHistory, StockInfo_type [INFERRED 0.85]
- **Settings UI Elements** — SettingsTab, SettingsModal, Settings_type [INFERRED 0.80]

## Communities (33 total, 11 thin omitted)

### Community 0 - "API Routes"
Cohesion: 0.11
Nodes (17): POST(), checkCronSecret(), GET(), THRESHOLDS, checkCronSecret(), GET(), GET(), isAuthorized() (+9 more)

### Community 1 - "Dashboard History"
Cohesion: 0.09
Nodes (18): DayData, OrbLayer(), OrbLayerProps, Props, Props, useTweaks(), isToday(), Props (+10 more)

### Community 2 - "Tweaks Panel"
Cohesion: 0.08
Nodes (17): RadioOption, TweakButtonProps, TweakColorProps, TweakNumberProps, TweakRadioProps, TweakRecord, TweakRowProps, TweakSection() (+9 more)

### Community 3 - "App Pages"
Cohesion: 0.18
Nodes (17): Dashboard Page, Login Page, Auth API, Feedings API, Bulk Feedings API, Feedings ID API, Purchases API, Settings API (+9 more)

### Community 4 - "Feeding Form"
Cohesion: 0.15
Nodes (8): PRESETS, Props, Props, DELETE(), isAuthorized(), PUT(), FOOD_TYPE_LABELS, FoodType

### Community 5 - "Settings Modal"
Cohesion: 0.19
Nodes (8): Props, BIRTHDATE, calcAge(), CAT_ROWS, plural(), Props, registerPush(), resubscribePush()

### Community 6 - "Dry Progress"
Cohesion: 0.32
Nodes (4): DryProgress(), Props, StockWidget(), useCountUp()

### Community 7 - "Settings & Widget"
Cohesion: 0.38
Nodes (7): SettingsModal, SettingsTab, Settings, WaterWidget, registerPush, resubscribePush, Water Schema Migration

### Community 8 - "App Layout"
Cohesion: 0.4
Nodes (3): metadata, nunito, viewport

### Community 9 - "Feeding Components"
Cohesion: 0.5
Nodes (5): BulkFeedingModal, FeedingForm, FeedingList, Feeding, HistoryTab

### Community 10 - "Settings API"
Cohesion: 0.83
Nodes (3): GET(), isAuthorized(), PUT()

### Community 11 - "Purchases API"
Cohesion: 0.83
Nodes (3): GET(), isAuthorized(), POST()

### Community 12 - "Bulk Feeding"
Cohesion: 0.67
Nodes (3): BulkFeedingModal(), Props, toLocalDateStr()

### Community 13 - "Stock Widget"
Cohesion: 0.5
Nodes (4): DryProgress, StockInfo, StockWidget, useCountUp

### Community 15 - "Purchase Components"
Cohesion: 0.67
Nodes (3): PurchaseHistory, PurchaseModal, Purchase

### Community 16 - "Push & DB Services"
Cohesion: 0.67
Nodes (3): sendPushToAll, Service Worker Push Handler, Supabase Client

### Community 17 - "Auth Utils"
Cohesion: 0.67
Nodes (3): checkBearer, checkPassword, iPhone Shortcuts

## Knowledge Gaps
- **66 isolated node(s):** `config`, `config`, `nextConfig`, `nunito`, `metadata` (+61 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `API Routes` to `Settings API`, `Purchases API`, `Feeding Form`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `FoodType` connect `Feeding Form` to `API Routes`, `Dashboard History`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Stock API` (e.g. with `Status API` and `Cron Check Stock`) actually correct?**
  _`Stock API` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `config`, `nextConfig` to the rest of the system?**
  _66 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Dashboard History` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Tweaks Panel` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._