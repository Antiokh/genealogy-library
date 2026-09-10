# Tree visualization demos

These are intentionally disposable comparison demos. They use the same synthetic family wherever the renderer's data model allows it, including:

- three grandparent couples;
- one person with two partners;
- children assigned to different unions;
- a single-parent union;
- one further descendant generation.

Run from the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/demos/
```

The demos load third-party libraries from public CDNs, so they need an internet connection.

## What each demo is testing

### Family Chart

Tests how far the genealogy-specific library gets us with card/CSS customization.

Strength: low implementation effort and genealogy-specific interaction/layout.

Risk: its canonical input is person-centric (`parents`, `spouses`, `children`). That loses the explicit `family -> children` association and is exactly where multi-spouse layouts become ambiguous.

The comparison version sets transition time to `0` so perceived slowness can be separated from animation cost.

### ApexTree

Tests a lightweight, polished SVG hierarchy renderer with good expand/collapse, zoom/pan, search, and custom HTML node templates.

Strength: small visual/runtime surface and attractive defaults.

Risk: input is a strict nested tree (`node.children[]`). There is no native multi-parent or partnership relationship. The demo therefore inserts a partnership node below Daniel and puts the spouse and children below that node. This is a visual/data projection compromise, not true genealogy semantics.

Licensing is not a conventional permissive OSS license: current ApexTree/ApexCharts releases use a community/commercial licensing model.

### treeSpider

Tests another visually light hierarchy renderer.

Strength: MIT license, TypeScript/D3 implementation, several layout styles, zoom and collapse/expand behavior.

Risk: the source data model is linear `id + parentId`, so it has the same fundamental marriage problem as any org chart. The demo intentionally exposes that by representing each partnership as a hierarchy node.

### d3-org-chart

Repository: `bumbeishvili/org-chart` / npm `d3-org-chart`.

This is more interesting than a generic D3 baseline because it already supplies most tree interaction we would otherwise have to rebuild: flextree layout, zoom/pan, fit/center, expand/collapse, search/highlight, multiple layouts and arbitrary HTML node content.

Strengths:

- MIT licensed;
- no Vue/React dependency;
- custom HTML cards are first-class via `nodeContent`;
- animation duration can be set to zero;
- arbitrary extra `connections` can be drawn between nodes;
- the implementation is essentially one configurable chart class over D3/flextree, making it comparatively approachable to adapt or fork.

Risk: the structural hierarchy still gives each node one `parentId`. Extra `connections` are rendered links, not layout parents. The demo therefore makes an explicit union node the structural child of one partner and uses an extra connection from the second partner. Children descend from the union correctly, but the spouse connection does not participate in automatic layout. This is the exact geometry question to evaluate visually.

### JSCharting Org

Tests whether a polished organizational renderer with native multiple-parent support can map cleanly to our generated `people + families` graph.

Strength: a point can have multiple parents, so a generated family/union point can have both partners as parents and the children can descend from the union. That preserves the correct marriage-to-child association without duplicating people.

Risk: commercial/proprietary dependency. It is therefore interesting technically and visually, but is a weaker strategic dependency for an independence-oriented open project.

### DHTMLX Diagram

Tests DHTMLX org-chart partner support and its polished interaction model.

Strength: native horizontal partner items, expand/collapse, zoom, custom HTML shapes, and an optional full visual editor.

Risk: DHTMLX documents that partner items cannot themselves be parent items. That means its native org-chart relationship model cannot naturally say "these children belong to this specific partnership" when one person has multiple partners. The demo shows this limitation directly.

The 2026 GPL edition can be used in GPL-compatible open-source projects; broader proprietary/commercial use requires a commercial license.

### Vue Flow + ELK

Tests the opposite approach: explicit `family` nodes in our graph, ELK for coordinates, Vue Flow only for rendering/interactions.

Strength: the graph semantics stay correct and the UI can be fully custom.

Risk: two libraries and substantially more code. We also have to own genealogy-specific layout tuning.

### Custom SVG

Tests the lower bound of implementation weight and the desired visual language.

Strength: virtually unlimited design control and very small runtime.

Risk: this demo uses hand-authored positions. A production version would still need a real layout algorithm. Its purpose is to answer whether a custom renderer is visually attractive enough to justify owning the layout layer.

## Current comparison questions

The important distinction is not simply "which demo looks nicest".

A renderer may be useful in one of three roles:

1. **genealogy renderer** — understands partnerships/multiple parents well enough to lay them out directly;
2. **tree renderer** — visually strong, but requires our build step to project genealogy into a simpler hierarchy;
3. **presentation layer** — renders coordinates/interactions while we own genealogy layout ourselves.

ApexTree, treeSpider and d3-org-chart are category 2. d3-org-chart is the most flexible of those three because it exposes HTML node rendering and arbitrary secondary connections without a framework. JSCharting is the most interesting candidate for category 1 because of native multiple-parent links. Vue Flow and custom SVG represent category 3.

## Decision criterion

Do not choose based on the synthetic sample alone. The winner should later be tested with the real imported genealogy, especially:

1. multiple marriages with children from each union;
2. half-siblings;
3. missing/unknown parent;
4. spouse ancestry;
5. pedigree collapse;
6. wide collateral branches;
7. roughly 250 people and mobile interaction;
8. initial load and interaction latency with animations disabled;
9. the amount of custom card/layout code required to reach the intended visual quality.
