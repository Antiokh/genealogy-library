# Tree visualization decision

This document records the current visualization direction for Genealogy Library.

The current scope is intentionally narrow: **family trees only**. Pedigree/fan/timeline/map views can be evaluated later.

## Core requirement

The visualization must understand genealogy as more than a generic hierarchy.

A marriage/partnership must be representable as a real family/union context so that children belong to the correct couple. This matters for remarriages, multiple partners, half-siblings and other normal genealogy cases.

At the same time, Genealogy Library is a browse-first product. Visual quality is therefore a primary requirement, not a cosmetic follow-up. A genealogy-aware renderer with an unacceptable fixed visual design is not a suitable production renderer.

## Current direction: own presentation layer over a generic graph renderer

After testing/reviewing Topola, it is no longer the preferred production renderer. Its genealogy model is useful, but its visual language is too dated and rigid for the intended family-encyclopedia experience.

The preferred implementation direction is now:

```text
canonical Markdown
        ↓
stateless genealogy build
        ↓
people + family/union nodes
        ↓
family-tree layout adapter
        ↓
Vue Flow presentation
```

### Vue Flow

Repository: `bcakmakoglu/vue-flow`

Use Vue Flow primarily for interaction and rendering:

- arbitrary custom person cards;
- arbitrary custom family/union nodes;
- custom relationship edges;
- zoom and pan;
- selection/focus;
- responsive interaction;
- future lightweight edit actions around a person card.

It is a generic graph UI, which is an advantage here: it does not impose a genealogy-specific visual design. Genealogy semantics stay in our generated graph and layout adapter.

### Layout engine

The initial layout experiment should use `elkjs` / Eclipse Layout Kernel.

ELK computes graph positions but does not render the UI. This separation allows the layout algorithm to be replaced without rewriting cards or interactions.

The family/union record should be projected as a small or invisible layout node:

```text
P001 ──┐
       F001
P002 ──┘
        │
   ┌────┴────┐
 P003       P004
```

For another partnership:

```text
P001 ── F001 ── P002
          │
       P003 P004

P001 ── F002 ── P006
          │
          P005
```

This keeps the graph unambiguous: children connect to a specific family/union, not merely to a person who happens to have multiple spouses.

ELK is not genealogy-aware, so the proof-of-concept must verify that its layered layout plus constraints/ports produces acceptable spouse alignment and child routing. If not, keep Vue Flow and replace only the layout algorithm.

## Topola: domain/layout reference, not production UI

Repository: `PeWu/topola`

Topola remains useful because its internal JSON model treats a family as a first-class record:

```ts
interface JsonIndi {
  id: string;
  famc?: string;
  fams?: string[];
}

interface JsonFam {
  id: string;
  children?: string[];
  wife?: string;
  husb?: string;
  marriage?: JsonEvent;
}
```

Useful parts to study:

- family-aware hierarchy construction;
- ancestor/descendant/relatives traversal;
- handling one individual in multiple spouse families;
- duplicate appearance of the same person in complex views;
- GEDCOM-to-family graph behavior.

Do not use Topola's current visual design as the primary site UI and do not let its `husb` / `wife` API shape the canonical gender-neutral model.

## Family Chart: visual reference / possible prototype

Repository: `donatso/family-chart`

Family Chart remains the strongest off-the-shelf visual reference found so far. It is visually much closer to the intended product and easy to embed.

However its public data model stores `parents`, `spouses` and `children` on people, and an open 2026 issue reports incorrect multi-spouse placement where children can visually descend from the wrong couple.

That is a core genealogy correctness issue for this project. Therefore:

- use it as a design benchmark;
- it can be used for a quick visual prototype;
- do not make its relationship model canonical;
- do not depend on it as the only production renderer until multi-spouse behavior is verified/fixed.

If its layout code is substantially easier to adapt than building our own, an MIT-compatible fork or focused fix may be evaluated separately.

## Other useful references

### React Flow

Repository: `xyflow/xyflow`

React Flow is the closest mature alternative to Vue Flow and has a very large ecosystem. The architecture described here works equally well with it. Vue Flow is currently preferred only at the presentation-framework level; the generated genealogy graph and layout adapter must not depend on Vue.

### entitree-flex

Repository: `codeledge/entitree-flex`

A low-level family-tree-oriented layout algorithm supporting parents, children and side nodes such as spouses. It may be worth testing if ELK requires too much constraint work. Its GPL-3.0 license needs to be considered before production use.

### js_family_tree

Repository: `BenPortner/js_family_tree`

Interesting because it explicitly models persons and unions. Keep it as a structural/layout reference rather than the main renderer.

### GoJS Genogram

GoJS has a mature custom genogram layout where marriage pairs are treated specially by the layout algorithm. It is a useful benchmark for what correct spouse/family geometry should look like, but GoJS is commercial and is not preferred as a dependency for an independence-oriented open project.

### Cytoscape.js / D3

Both can render our explicit union-node graph and provide maximum freedom, but they require more interaction/layout code than Vue Flow. Keep them as lower-level fallbacks.

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
layout engine
        ↓
renderer
```

A renderer change must not alter canonical Markdown or stable person/family identities.

## First proof-of-concept

The next useful implementation spike should not build the whole site. It should render one real family slice with custom cards and explicit union nodes.

Test at minimum:

1. one marriage with children;
2. one person with two partnerships and children from both;
3. half-siblings;
4. spouse ancestors;
5. one unknown/missing parent;
6. a larger collateral branch;
7. fit/zoom/navigation with the full roughly 250-person dataset.

The primary evaluation criteria are:

- children visually originate from the correct partnership;
- spouses are visually obvious without turning the chart into an org chart;
- cards can look like part of the Genealogy Library site rather than a third-party widget;
- the graph remains readable with real family density;
- clicking/focusing a person can become the basis for future lightweight editing.

If Vue Flow + ELK cannot satisfy the family geometry cleanly, keep the generated graph and Vue Flow presentation layer and replace only the layout algorithm.