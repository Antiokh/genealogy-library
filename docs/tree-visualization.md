# Tree visualization decision

This document records the current visualization shortlist for Genealogy Library.

The current scope is intentionally narrow: **family trees only**. Pedigree/fan/timeline/map views can be evaluated later.

## Hard requirements

A renderer is only a candidate if it can plausibly satisfy all three requirements:

1. **Expand/collapse** — users must be able to hide/show branches without rebuilding the page manually.
2. **Correct multi-partner genealogy** — one person may have multiple marriages/partnerships, and children must belong to the correct union rather than merely to one structural parent.
3. **Custom person card** — the visual card must be fully ours and usable as a reusable UI component, not a fixed third-party widget skin.

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

## Active shortlist

### Family Chart

Repository: `donatso/family-chart`.

Why it remains:

- genealogy-specific;
- built-in family-tree interaction;
- branch expansion/collapse behavior;
- custom HTML card rendering;
- MIT licensed;
- relatively small integration surface.

Blocking issue:

Its current multi-spouse layout can place children under the wrong couple. This is a correctness problem, not a cosmetic issue. Family Chart remains a candidate only if the layout can be fixed or adapted without replacing most of the engine.

The current demo disables transition animations to separate perceived animation latency from actual layout/render cost.

### JSCharting Org

Why it remains:

- supports multiple parents in organizational layouts;
- explicit generated union nodes can therefore have both partners as parents;
- children can descend structurally from the correct union;
- node visuals are highly customizable;
- expand/collapse and hierarchy interaction are available;
- no application framework is required.

Risks:

- proprietary/commercial dependency;
- custom-card integration is HTML/annotation-oriented rather than naturally framework-component-oriented.

This is currently the strongest generic renderer from a relationship-layout perspective.

### Vue Flow + ELK

Repositories: `bcakmakoglu/vue-flow` and `kieler/elkjs`.

Why it remains:

- arbitrary graph semantics, including explicit family nodes;
- person cards can be real Vue components;
- zoom/pan and selection are solved;
- renderer and layout engine remain replaceable independently.

Risks:

- branch collapse must be implemented in our graph projection/state;
- genealogy-specific layout tuning is ours;
- two libraries and more runtime/conceptual weight;
- easy to overbuild a browse-first site.

This is the correctness/control fallback, not the automatic first choice.

### BALKAN FamilyTreeJS 2 — next focused test

This is the next serious candidate to demo because it is genealogy-specific and explicitly supports multiple partners, family relationships, expand/collapse and customizable templates.

Its main strategic downside is commercial licensing. If its interaction and layout save enough implementation work, that may still be acceptable; if not, it should not become a core dependency.

### Custom SVG — baseline only

The custom SVG demo is not a library candidate. It remains as a visual baseline and proves that our visible rendering layer can be very small if we own or reuse a suitable genealogy-specific layout algorithm.

## Rejected candidates

The following are no longer active implementation candidates:

| Candidate | Reason for rejection |
| --- | --- |
| ApexTree | strict nested hierarchy; only one structural parent path |
| treeSpider | strict `id + parentId` hierarchy; demo also failed to load reliably |
| d3-org-chart | secondary spouse connections do not participate in layout; one structural parent remains |
| DHTMLX Diagram org chart | partner nodes cannot themselves be parents, preventing clean child-per-union semantics |
| Topola | genealogy semantics are useful, but production visual design is too rigid/dated for this product |

Rejected renderers may still be used as design or implementation references. They should not receive more demo/integration work unless their underlying model changes.

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
- amount of custom code required for a finished card;
- ability to use the same person-card component outside the tree.

The goal is not the most capable graph library. The goal is the smallest maintainable renderer that handles family geometry correctly, feels fast, and lets Genealogy Library own the visual language.
