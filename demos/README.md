# Tree visualization demos

These demos are intentionally disposable. The comparison is filtered by three hard requirements rather than visual appeal alone.

A viable renderer must support, either natively or with a small adapter:

1. branch expand/collapse;
2. multiple marriages/partnerships with children attached to the correct union;
3. a fully custom person card that can be treated as a reusable UI component.

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

## Shared PersonCard

`person-card.js` is the single visual source of truth for a person node.

It defines the `genealogy-person-card` Web Component and a small `personCardElementHtml()` adapter. The same component must be embedded by every renderer demo. A library is not allowed to keep a visually similar but renderer-specific card just to stay in the comparison.

Open `person-card.html` to inspect the component independently from any tree renderer.

This gives us a practical hard test:

> if a renderer cannot host the same PersonCard cleanly, it fails the custom-card requirement.

## Remaining candidates

### Family Chart

Repository: `donatso/family-chart`.

Why it remains:

- genealogy-specific;
- built-in tree interaction and branch expansion;
- accepts arbitrary HTML card content;
- can host the shared PersonCard;
- MIT licensed.

Blocking question: its current multi-spouse layout can place children under the wrong couple. It remains viable only if that behavior can be corrected without replacing the layout engine.

The comparison demo disables transition animation and explicitly neutralizes Family Chart's own card background, border, shadow and pseudo-elements. The only visible card should now be the shared `genealogy-person-card`.

### BALKAN FamilyTreeJS 2

Why it is a primary candidate:

- genealogy-specific rather than an org-chart projection;
- native `spouseIds` plus parent/child relationships;
- multiple spouses are supported directly;
- children identify their actual parent pair, so remarriage does not require union-node hacks;
- collapse state is part of the API (`collapsedIds`) and the library has genealogy-specific expand/collapse behavior;
- the v2 template API accepts arbitrary HTML, so the shared PersonCard Web Component can be returned directly from `template.html`;
- node size, HTML, SVG background and relationship-specific templates are customizable.

The demo maps the same synthetic source data into FamilyTreeJS 2 records and uses the exact shared PersonCard. It also exposes simple collapse/expand buttons to exercise collapse state directly.

Risk: commercial/proprietary dependency. Runtime feel, visual geometry and licensing must justify using it as a core renderer.

### Vue Flow + ELK

Why it remains:

- explicit person + union graph preserves genealogy semantics exactly;
- arbitrary HTML/component nodes are possible;
- the shared PersonCard can sit inside a custom Vue Flow node;
- zoom/pan are already solved.

Risk: branch collapse, genealogy-specific layout rules and much of the behavior become our responsibility. It is the flexible fallback, not the preferred answer by default.

## Rejected from active evaluation

The following demos were removed because they cannot satisfy the product requirements cleanly enough:

- **ApexTree** — strict nested `children[]` hierarchy; one structural parent path;
- **treeSpider** — strict `id + parentId` hierarchy; additionally the demo did not load reliably in testing;
- **d3-org-chart** — one structural `parentId`; secondary connections do not participate in layout;
- **DHTMLX Diagram org chart** — partner nodes cannot themselves be parent nodes, so children cannot naturally belong to a specific partnership;
- **JSCharting Org** — multiple-parent layout was promising, but the HTML annotation layer rendered the shared Web Component markup as text instead of hosting it as DOM. Supporting it would require a JSCharting-specific card implementation, which violates the shared-component requirement;
- **Custom SVG renderer demo** — removed because it was not a library candidate. Only the reusable PersonCard is kept as a renderer-independent visual baseline.

These projects may still be useful visual references, but they are no longer implementation candidates.

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
- clean embedding of the exact shared PersonCard component.
