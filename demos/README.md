# Tree visualization demos

These demos are intentionally disposable. The comparison is now filtered by three hard requirements rather than visual appeal alone.

A viable renderer must support, either natively or with a small adapter:

1. branch expand/collapse;
2. multiple marriages/partnerships with children attached to the correct union;
3. fully custom person cards that can be treated as reusable UI components.

The shared synthetic family includes remarriage, children from different unions, a single-parent union and another descendant generation.

Run from the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/demos/
```

The demos load third-party libraries from public CDNs, so they need an internet connection.

## Remaining candidates

### Family Chart

Repository: `donatso/family-chart`.

Why it remains:

- genealogy-specific;
- built-in tree interaction and branch expansion;
- customizable HTML cards;
- MIT licensed.

Blocking question: its current multi-spouse layout can place children under the wrong couple. It remains viable only if that behavior can be corrected without replacing the layout engine.

The comparison demo disables transition animation so rendering/layout cost can be judged separately from animation latency.

### JSCharting Org

Why it remains:

- organizational layout supports multiple parents;
- an explicit generated union node can therefore have both partners as parents;
- children can structurally descend from that union rather than from only one spouse;
- node appearance is highly customizable;
- hierarchy interaction/collapse is available.

Risk: proprietary/commercial dependency and a less component-native rendering model than Vue.

### Vue Flow + ELK

Why it remains:

- explicit person + union graph preserves genealogy semantics exactly;
- person cards can be real Vue components;
- arbitrary interaction/edit affordances are possible;
- zoom/pan are already solved.

Risk: branch collapse, genealogy-specific layout rules and much of the behavior become our responsibility. It is the flexible fallback, not the preferred answer by default.

### Custom SVG

This is not a third-party renderer candidate. It stays only as a baseline showing how small the visible rendering layer can be if we eventually own layout/collapse ourselves.

## Rejected from active evaluation

The following demos were removed because their structural model cannot satisfy child-per-union semantics cleanly enough for the product:

- **ApexTree** — strict nested `children[]` hierarchy; one structural parent path;
- **treeSpider** — strict `id + parentId` hierarchy; additionally the demo did not load reliably in testing;
- **d3-org-chart** — one structural `parentId`; secondary connections do not participate in layout;
- **DHTMLX Diagram org chart** — partner nodes cannot themselves be parent nodes, so children cannot naturally belong to a specific partnership.

These projects may still be useful visual references, but they are no longer implementation candidates.

## Next candidate to test

**BALKAN FamilyTreeJS 2** should be added as a focused comparison because it explicitly supports multiple partners, genealogy-oriented family relationships, expand/collapse and customizable node templates. Its main downside is commercial licensing.

## Decision criterion

The winner must be tested on the real genealogy, especially:

- multiple marriages with children from each union;
- half-siblings;
- missing/unknown parent;
- spouse ancestry;
- pedigree collapse;
- wide collateral branches;
- roughly 250 people;
- mobile interaction;
- initial load and expand/collapse latency;
- the amount of custom code required to make a finished person card.
