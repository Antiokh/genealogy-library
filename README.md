# Genealogy Library

A repository-first genealogy library: people and their source data live in Git, while family trees and other views are generated from metadata at build time.

The repository must remain useful independently of MyHeritage, Genotek, a specific visualization library, or even the current site generator.

## Core principles

### 1. One person = one editable record

People are stored as ordinary Markdown/MDX records with frontmatter. Photos and documents may live next to the person's record.

The physical folder structure is **not** the family tree. Kinship is stored only through stable person IDs in metadata.

### 2. Folders are only for finding people

People are grouped by birth decade:

```text
src/content/people/
├── 1870-1879/
│   └── ivan-petrovich-nazarov/
│       ├── index.md
│       ├── portrait.jpg
│       └── documents/
├── 1880-1889/
├── 1890-1899/
├── ...
├── 1980-1989/
└── unknown/
```

An estimated birth year is sufficient for choosing the decade. If the date is later corrected and the person moves to another decade, no relationship should break.

Paths are human navigation only. They are never identifiers.

### 3. Stable IDs, path-independent relationships

A person has a permanent internal ID. Relationships reference IDs, never files or URLs.

Example:

```yaml
---
id: P00251

name:
  first: Иван
  patronymic: Петрович
  last: Назаров

sex: M

birth:
  year: 1877

death:
  year: 1948

parents:
  - P00134
  - P00135

partners:
  - P00252
---
```

Derived relations such as children, siblings, grandparents, descendants and generations should not be maintained manually when they can be calculated from canonical relations.

### 4. Stateless build

Every build starts from zero and rebuilds the complete genealogy dataset from the current source files.

Conceptually:

```text
scan person records
        ↓
parse frontmatter
        ↓
validate IDs and references
        ↓
construct genealogy graph from scratch
        ↓
generate datasets and site views
```

No generated relationship state from a previous build is trusted.

This allows records to be renamed or moved between decade folders without affecting kinship.

## Canonical data and generated graph

Person records are the source of truth.

The build produces a neutral genealogy graph, for example:

```text
generated/genealogy.json
```

The graph should be our own stable internal contract rather than the native format of any particular visualization library.

Genealogy is better represented with both person and family/union nodes:

```text
PERSON ─┐
        ├─ FAMILY ─→ CHILD
PERSON ─┘
```

This preserves marriages/partnerships and children from different unions without forcing a visualizer-specific model into the source files.

Example generated shape:

```json
{
  "schema": "genealogy-1",
  "nodes": [
    { "id": "P001", "type": "person" },
    { "id": "P002", "type": "person" },
    { "id": "F001", "type": "family" }
  ],
  "edges": [
    { "source": "P001", "target": "F001", "type": "partner" },
    { "source": "P002", "target": "F001", "type": "partner" },
    { "source": "F001", "target": "P003", "type": "child" }
  ]
}
```

Exact schema is still to be designed before implementation.

## GEDCOM

### Import

GEDCOM import is a first-class requirement because the initial genealogy already exists in external services.

The importer should:

1. Read GEDCOM without making GEDCOM the internal storage model.
2. Create/update canonical person records.
3. Convert relationships to internal stable IDs.
4. Preserve useful source identifiers such as GEDCOM XREFs as import metadata.
5. Place people automatically into birth-decade folders.
6. Handle unknown birth years through `unknown/`.

Example source metadata:

```yaml
external:
  gedcom:
    - source: myheritage-2026
      xref: "@I418@"
```

The external XREF is not the internal person ID.

A mapping should be preserved for repeatable imports and duplicate prevention:

```text
imports/
└── myheritage-2026/
    ├── original.ged
    └── mapping.json
```

### Independence

GEDCOM is an interchange format, not the database:

```text
MyHeritage / Genotek / other source
                ↓
             GEDCOM
                ↓
             importer
                ↓
      repository person records
                ↓
              build
                ↓
       neutral genealogy graph
```

A future GEDCOM export is desirable so data can leave this project just as easily as it enters it.

## Planned views

The site is planned around Astro + Starlight, but genealogy data must not depend on Astro.

### Family tree

Interactive family graph around a selected person, including lateral and descendant branches.

The UI library should consume an adapter built from `genealogy.json`, not become part of the canonical schema.

### Pedigree

Ancestor-focused pedigree view.

This requires the build step to derive the appropriate ancestor dataset from the complete genealogy graph.

The reference person is a view parameter, not a property of the genealogy itself.

### Person pages

Each source record becomes an encyclopedia-style page containing biography, dates, relationships, photos, documents and sources.

## Adding a person

Adding records should not require understanding the repository internals.

Initial version can be a documented template:

```text
1. Choose the person's birth decade.
2. Create:
   src/content/people/<decade>/<person-slug>/index.md
3. Copy the person template.
4. Fill in identity, dates and known relationship IDs.
5. Commit the file.
```

Planned improvement: an **Add person wizard**.

The wizard should collect the minimum data, determine the decade and path, generate the correct frontmatter, and then either:

- create the file automatically through GitHub, or
- open GitHub's file editor at the correct path with a generated template ready to paste/edit.

The important constraint is that the result remains an ordinary repository file. The wizard is a convenience layer, not a separate database or CMS.

## Initial implementation scope

```text
[ ] Define person frontmatter schema
[ ] Define neutral genealogy graph schema
[ ] Create person template
[ ] Implement repository validator
[ ] Implement GEDCOM importer
[ ] Build genealogy.json from person records
[ ] Add tree visualization adapter/view
[ ] Add pedigree dataset/view
[ ] Add person pages in Astro/Starlight
[ ] Add simple "Add person" instructions/template
[ ] Add interactive "Add person" wizard
[ ] Consider GEDCOM export
```

## Non-goals for the data model

The repository structure should not encode:

- paternal vs maternal branches;
- a fixed generation number;
- descendants as nested folders;
- relationships through file paths;
- assumptions specific to Topola, Family Chart or another renderer.

All of these are views over the same genealogy graph.
