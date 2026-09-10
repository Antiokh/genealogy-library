# Tree visualization decision

This document records the first visualization decision for Genealogy Library.

The current scope is intentionally narrow: **family trees only**. Pedigree/fan/timeline/map views can be evaluated later.

## Core requirement

The renderer must understand genealogy as more than a generic hierarchy.

A marriage/partnership must be representable as a real family/union context so that children belong to the correct couple. This matters for remarriages, multiple partners, half-siblings and other normal genealogy cases.

A renderer whose only native structure is `node -> parentId` is not a suitable primary genealogy renderer.

## Initial choice: Topola

Repository: `PeWu/topola`

Topola is the preferred first renderer to integrate.

Reasons:

- genealogy-specific rather than generic org-chart software;
- TypeScript/JavaScript and browser/SVG based;
- Apache-2.0 licensed;
- can be embedded as a library rather than requiring a server application;
- supports ancestor, descendant, hourglass, relatives and kinship-oriented views;
- accepts either GEDCOM data or its own JSON data provider;
- family is a first-class record in its JSON model;
- one individual may belong to multiple spouse families;
- each family record owns its own children and marriage metadata.

The relevant Topola JSON shape is conceptually:

```ts
interface JsonIndi {
  id: string;
  famc?: string;
  fams?: string[];
  // ...person data
}

interface JsonFam {
  id: string;
  children?: string[];
  wife?: string;
  husb?: string;
  marriage?: JsonEvent;
}
```

This is close to the provider-independent generated model already planned for Genealogy Library:

```text
canonical Markdown people
        ↓
stateless build
        ↓
people + families
        ↓
Topola adapter
```

The canonical schema must still remain independent of Topola. The adapter may translate our gender-neutral partnership/family representation into Topola's current `husb` / `wife` fields where necessary.

## Why not Family Chart as the primary renderer

Repository: `donatso/family-chart`

Family Chart remains visually attractive and worth keeping as a secondary experiment. It is MIT licensed, D3-based, framework-agnostic, and easy to embed.

However its current public data model stores `parents`, `spouses` and `children` directly on person records and expects relationships to be bidirectional. More importantly, there is an open 2026 issue around multiple-spouse layout where spouses can stack on one side and children may not visually descend from the correct couple.

That problem hits one of our primary requirements directly. Family Chart should therefore not define the canonical graph or be the first renderer we depend on.

It may still become useful later for local-person views if the multi-spouse layout matures.

## Why not BALKAN FamilyTreeJS

BALKAN FamilyTreeJS has a convenient explicit relationship API (`pids`, `mid`, `fid`) and a strong built-in UI, but it is proprietary. Ongoing use requires commercial licensing outside its limited trial/evaluation terms.

That conflicts with the independence goal of Genealogy Library, so it is not the preferred foundation.

## Other useful references

### js_family_tree

Repository: `BenPortner/js_family_tree`

Interesting mainly because it explicitly models `persons`, `unions`, and links between them. That is structurally close to our graph philosophy and can be used as a layout/reference implementation if Topola becomes too restrictive.

It is GPL-3.0 and substantially smaller/less mature than Topola, so it is not the first choice.

### entitree-flex

Repository: `codeledge/entitree-flex`

Useful as a low-level layout algorithm supporting parents, children and spouse side-nodes. It is not a complete genealogy renderer. Keep it as a fallback if we eventually build our own HTML/SVG cards while outsourcing only layout.

### Generic graph libraries

Cytoscape.js, d3-dag and similar graph libraries can represent explicit union nodes and therefore can model genealogy correctly. However they leave much more genealogy-specific layout behavior to us. They are fallback building blocks, not the first implementation target.

## Integration rule

Topola is a renderer, not the data model.

Do not make canonical Markdown emit Topola fields directly. The intended flow is:

```text
src/content/people/**
        ↓
build canonical genealogy graph
        ↓
generated/genealogy.json
        ↓
adapters/topola
        ↓
Topola
```

The first proof-of-concept should use a real imported family dataset and explicitly test:

1. one marriage with children;
2. a person with two marriages and children from both;
3. half-siblings;
4. a spouse with their own ancestors;
5. unknown/missing spouse;
6. cousin/pedigree-collapse cases if present in the source data;
7. roughly 250 people to check interaction and performance.

If Topola renders these cases correctly and the result is visually acceptable, it becomes the first production tree renderer. If not, retain the same generated genealogy graph and replace only the adapter/renderer.