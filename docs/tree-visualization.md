# Tree visualization decision

This document records the current visualization shortlist for Genealogy Library.

The current scope is intentionally narrow: **family trees only**. Pedigree/fan/timeline/map views can be evaluated later.

## Hard requirements

A renderer is only a candidate if it can plausibly satisfy all three requirements:

1. **Expand/collapse** — users must be able to hide/show branches without rebuilding the page manually.
2. **Correct multi-partner genealogy** — one person may have multiple marriages/partnerships, and children must belong to the correct union rather than merely to one structural parent.
3. **Reusable custom person card** — the visual card must be fully ours and embeddable as the same reusable UI component inside and outside the tree, not a renderer-specific imitation.

Visual polish, load time, licensing and implementation weight are comparison criteria only after those three requirements are met.

## Canonical visualization model

The canonical genealogy remains renderer-independent:

```text
people + families/unions
        ↓
view projection
        ↓
renderer adapter
```

A union is an explicit semantic object even if a particular renderer hides its visual node:

```text
P1 ─┐
    F1
P2 ─┘
     │
  children
```

A second partnership creates a different family/union record. This is non-negotiable because it prevents children from being attached to the wrong partner relationship.

## Shared PersonCard contract

The visualization spike now has one card implementation:

```text
demos/person-card.js
        ↓
genealogy-person-card
        ├── Family Chart
        ├── BALKAN FamilyTreeJS 2
        ├── Vue Flow + ELK
        └── standalone person-card.html
```

Every renderer must host this exact component or an eventual production equivalent with the same component boundary. Separate renderer-specific card markup is no longer acceptable for comparison because it makes visual and integration cost impossible to compare fairly.

The current demo implementation is a Web Component so it can be embedded independently of a framework. That does not force the production site to use Web Components permanently; it establishes the architectural requirement that the person card belongs to Genealogy Library, not to the tree library.

If a renderer cannot render, size, interact with or event-bind the shared component cleanly, that is a renderer limitation and counts against the candidate.

## Active shortlist

### Family Chart

Repository: `donatso/family-chart`.

Why it remains:

- genealogy-specific;
- built-in family-tree interaction;
- branch expansion/collapse behavior;
- accepts custom HTML card rendering;
- can host the shared PersonCard;
- MIT licensed;
- relatively small integration surface.

Blocking issue:

Its current multi-spouse layout can place children under the wrong couple. This is a correctness problem, not a cosmetic issue. Family Chart remains a candidate only if the layout can be fixed or adapted without replacing most of the engine.

The current demo disables transition animations and neutralizes the library's own card background/border/shadow so only the shared PersonCard should remain visible.

### BALKAN FamilyTreeJS 2

This is now a primary candidate rather than a future test.

Why it remains:

- genealogy-specific rather than a generic org-chart projection;
- native spouse relationships (`spouseIds`);
- parent/child relationships are explicit, including mother/father pairs and child lists;
- multiple spouses are supported directly;
- children can be attached to the actual parent pair, so remarriage does not require duplicating people or inserting fake hierarchy nodes;
- collapse state is part of the public API through `collapsedIds`, with genealogy-oriented collapse/expand behavior;
- templates support arbitrary HTML via `template.html`;
- template width/height, SVG background and relationship-specific node templates are customizable;
- the exact shared `genealogy-person-card` Web Component can therefore be hosted inside a BALKAN node instead of imitated.

The demo uses the same synthetic family as the other renderers, including Daniel's two spouses and children from different unions. It also exposes explicit collapse/expand buttons to exercise the collapse API directly.

Primary risk: proprietary/commercial licensing. It should win only if its genealogy layout, interaction quality and implementation savings justify that dependency.

### Vue Flow + ELK

Repositories: `bcakmakoglu/vue-flow` and `kieler/elkjs`.

Why it remains:

- arbitrary graph semantics, including explicit family nodes;
- arbitrary component nodes;
- the same PersonCard can be hosted directly inside a custom node;
- zoom/pan and selection are solved;
- renderer and layout engine remain replaceable independently.

Risks:

- branch collapse must be implemented in our graph projection/state;
- genealogy-specific layout tuning is ours;
- two libraries and more runtime/conceptual weight;
- easy to overbuild a browse-first site.

This is the correctness/control fallback, not the automatic first choice.

## Rejected candidates

The following are no longer active implementation candidates:

| Candidate | Reason for rejection |
| --- | --- |
| ApexTree | strict nested hierarchy; only one structural parent path |
| treeSpider | strict `id + parentId` hierarchy; demo also failed to load reliably |
| d3-org-chart | secondary spouse connections do not participate in layout; one structural parent remains |
| DHTMLX Diagram org chart | partner nodes cannot themselves be parents, preventing clean child-per-union semantics |
| JSCharting Org | multiple-parent geometry worked in principle, but its HTML annotation layer rendered the shared Web Component markup as text; supporting it would require a renderer-specific card |
| Topola | genealogy semantics are useful, but production visual design is too rigid/dated for this product |
| Custom SVG demo | not a library candidate; removed after extracting the renderer-independent PersonCard baseline |

Rejected renderers may still be used as design or implementation references. They should not receive more demo/integration work unless their underlying model changes.

## Current comparison

The practical comparison is now deliberately small:

| Candidate | Collapse | Multiple marriages / correct parent pair | Exact shared card | Main concern |
| --- | --- | --- | --- | --- |
| Family Chart | yes | native relations, but known multi-spouse layout risk | yes | layout correctness / perceived speed |
| BALKAN FamilyTreeJS 2 | yes | native | yes, via arbitrary HTML template | proprietary/commercial |
| Vue Flow + ELK | ours | exact through explicit union nodes | yes | implementation/runtime weight |

## Final evaluation

The remaining candidates should be judged on the same real genealogy cases:

- multiple marriages with children from each union;
- half-siblings;
- missing/unknown parent;
- spouse ancestry;
- pedigree collapse;
- wide collateral branches;
- roughly 250 people;
- mobile interaction;
- expand/collapse latency;
- initial load time;
- clean embedding of the exact same person-card component;
- ability for card click/hover/actions to remain owned by Genealogy Library rather than the renderer.

The goal is not the most capable graph library. The goal is the smallest maintainable renderer that handles family geometry correctly, feels fast, and lets Genealogy Library own the visual language.
