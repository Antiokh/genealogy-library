# Tree visualization decision

This document records the current visualization direction for Genealogy Library.

The current scope is intentionally narrow: **family trees only**. Pedigree/fan/timeline/map views can be evaluated later.

## Core requirement

The visualization must understand genealogy as more than a generic hierarchy.

A marriage/partnership must be representable as a real family/union context so that children belong to the correct couple. This matters for remarriages, multiple partners, half-siblings and other normal genealogy cases.

At the same time, Genealogy Library is a browse-first product. Visual quality and perceived lightness are primary requirements, not cosmetic follow-ups.

The renderer should ideally provide most of the boring interaction work — layout, zoom/pan, focus, expand/collapse — while still allowing the tree to look like Genealogy Library rather than an embedded enterprise diagram widget.

## Current status: evaluation reopened

Topola has good genealogy semantics but an unacceptable visual language for the intended product.

Vue Flow + ELK proved the opposite extreme: technically flexible and correct, but heavy for a site whose tree cards would still need to be designed and implemented manually. The stack is useful as a fallback, not an automatic first choice.

The current evaluation therefore compares three categories:

```text
1. genealogy-aware renderer
   understands multiple parents / unions directly

2. lightweight hierarchy renderer
   looks good and feels fast, but needs genealogy projection hacks

3. custom presentation + layout engine
   maximum control, maximum implementation ownership
```

Disposable demos live under `demos/` on the visualization spike branch.

## Family Chart

Repository: `donatso/family-chart`

Family Chart remains the strongest permissive off-the-shelf genealogy-specific visual reference found so far.

Strengths:

- genealogy-specific rather than generic org chart;
- attractive enough to be usable after moderate card/CSS work;
- zoom/pan and interactive focus already solved;
- MIT licensed;
- easy to embed.

Risks:

- person-centric `parents/spouses/children` relationship model;
- known multi-spouse layout problems can cause children to appear under the wrong couple;
- initial rendering has felt slower than expected in testing.

The demo now disables transition animation completely. This lets us distinguish animation latency from actual layout/render cost.

Family Chart is still a serious candidate if its multi-spouse behavior can be corrected without effectively rewriting the layout engine.

## ApexTree

Repository: `apexcharts/apextree`

ApexTree is visually much lighter and more polished than most generic graph frameworks.

Useful features:

- SVG rendering;
- built-in expand/collapse;
- zoom/pan and fit/center behavior;
- search and selection;
- custom `nodeTemplate` HTML;
- approximately 88 KB minified package in the current CDN release;
- no need to bring a Vue/React graph framework into the site.

Its fundamental limitation is the data model:

```text
node
└── children[]
```

Each node has exactly one structural parent. There is no native marriage/union or multi-parent edge.

A genealogy adapter can insert family/union nodes, but with a strict tree one spouse then has to become structurally subordinate or the same person must be duplicated in different branches. This may still be acceptable for selected descendant/ancestor projections, but it is not a lossless general family graph renderer.

Current licensing is a community/commercial model rather than a conventional permissive OSS license, which also weakens it as a long-term foundation.

## treeSpider

Repository: `paulosabayomi/treeSpider`

Visually interesting because it is compact, relatively stylish, and includes several tree layouts without the visual weight of a generic node editor.

Strengths:

- MIT licensed;
- D3 + TypeScript;
- responsive zoomable trees;
- expand/collapse events;
- multiple layout styles;
- relatively small conceptual/API surface.

Its canonical data model is explicitly:

```text
id + parentId
```

so it has the same structural genealogy limitation as ApexTree. It can be a good renderer for a projected hierarchy, but cannot natively represent two parents or a union that owns children.

Keep it in the visual comparison because its design/runtime tradeoff may still be attractive enough to justify a specialized genealogy projection.

## JSCharting Org

JSCharting is proprietary/commercial, but technically it is the most interesting new org-chart candidate because it supports multiple parents natively.

That allows this projection:

```text
P1 ─┐
    ├── F1 ── child
P2 ─┘
```

where `F1` is a generated family/union point with both partners as parents. Multiple children then point to `F1`. A second partnership creates `F2`, so children remain attached to the correct couple without duplicating a person.

Useful features:

- automatic organizational layout;
- multiple parent nodes;
- connector customization;
- HTML-rich node labels/annotations;
- SVG rendering;
- interactive hierarchy navigation;
- no framework dependency.

The main risk is strategic rather than technical: it is a paid proprietary dependency. It should be evaluated on visual quality and implementation savings before considering whether the license tradeoff is justified.

## DHTMLX Diagram

DHTMLX is visually polished and has explicit `partner` shapes in org-chart mode. It also supports custom HTML shapes, zoom, expand/collapse, and a complete editor if that were ever useful.

However its own documentation states that partner items cannot themselves be parent items. That is a direct problem for genealogy with multiple marriages: children attach to the primary hierarchy node rather than to a specific partner relationship.

So its native org-chart family model is visually attractive but not semantically strong enough for our main requirement.

A custom DHTMLX default-mode graph with explicit union nodes is possible, but at that point we would be paying the complexity/license cost while owning more layout ourselves.

The 2026 open-source package is GPL-2.0-only; non-GPL/commercial usage requires a commercial license.

## Vue Flow + ELK

Repository: `bcakmakoglu/vue-flow` plus `elkjs`.

This remains the correctness/control fallback:

```text
canonical graph
   ↓
explicit person + family nodes
   ↓
ELK layout
   ↓
Vue Flow presentation
```

Strengths:

- exact genealogy semantics can be preserved;
- arbitrary custom person cards and union nodes;
- interaction/edit affordances are easy to add;
- layout and renderer are replaceable independently.

Weaknesses:

- comparatively heavy conceptual and runtime stack;
- cards still need to be built manually;
- genealogy-specific layout constraints become our responsibility;
- easy to overbuild a simple browse-first tree.

Do not choose this merely because it is flexible.

## Topola

Repository: `PeWu/topola`.

Topola is no longer a production UI candidate, but remains a useful genealogy-domain and layout reference because it models families as first-class records and one person can participate in multiple spouse families.

Study its traversal and family handling; do not inherit its visual design or renderer-specific schema.

## Custom SVG / HTML

The custom demo represents the opposite lower bound: own the visual layer completely and outsource only layout — or eventually own a small genealogy-specific layout as well.

This becomes attractive if all full renderers require substantial card restyling anyway. In that case the real reusable component we need may be **layout**, not a complete graph UI framework.

## Renderer-independent contract

No visualization library becomes the data model.

```text
src/content/**
        ↓
canonical genealogy compiler
        ↓
generated/genealogy.json
        ↓
view-specific projection
        ↓
layout / renderer adapter
```

A renderer change must not alter canonical Markdown or stable person/family identities.

## Evaluation matrix

The practical shortlist should now be judged on these dimensions:

| Candidate | Visual baseline | Marriage semantics | Lightness | Custom cards | License |
| --- | --- | --- | --- | --- | --- |
| Family Chart | good | genealogy-specific but multi-spouse issue | medium | yes | MIT |
| ApexTree | very good | hierarchy only | very good | yes | community/commercial |
| treeSpider | good | hierarchy only | good | limited/moderate | MIT |
| JSCharting Org | very good | multiple parents; union-node projection works | good | yes | commercial |
| DHTMLX Diagram | very good | partner UI but weak child-per-union semantics | medium | yes | GPL-2 / commercial |
| Vue Flow + ELK | entirely ours | excellent | weak/medium | entirely ours | MIT |
| Custom SVG | entirely ours | excellent if layout is ours | excellent | entirely ours | ours |

## Decision criterion

Do not choose from toy screenshots alone. The eventual winner must be tested with the real imported genealogy, especially:

1. multiple marriages with children from each union;
2. half-siblings;
3. missing/unknown parent;
4. spouse ancestry;
5. pedigree collapse;
6. wide collateral branches;
7. roughly 250 people and mobile interaction;
8. initial load and focus/expand latency with animations disabled;
9. how much custom code is required before the cards actually look finished.

The likely decision is no longer "which graph framework is most capable?" but rather:

> Which option gives us the best family geometry and interaction with the least code that the user can see or feel?
