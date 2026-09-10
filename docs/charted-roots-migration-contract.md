# Charted Roots migration / compatibility contract

Charted Roots is close enough to Genealogy Library that compatibility is worth treating as a deliberate boundary rather than an accidental one.

The goal is **not** to make Genealogy Library depend on Obsidian or Charted Roots. The goal is to make Charted Roots usable as an optional, occasional research/editing interface over data that ultimately lives in Git.

## Product role split

```text
Genealogy Library
  -> permanent canonical storage in Git
  -> static/browse-first family encyclopedia
  -> tree/pedigree/search/navigation
  -> occasional lightweight corrections

Charted Roots / Obsidian
  -> optional research workstation
  -> bulk editing / cleanup
  -> GEDCOM inspection/import
  -> evidence/source work
  -> complex relationship maintenance
```

This split reflects expected usage: the family library should be pleasant to browse all the time, while a full genealogy workstation may only be needed occasionally.

Charted Roots must therefore remain an **optional editor/maintenance client**, not the owner of the data model.

## Compatibility principle

Compatibility should primarily be implemented through explicit interchange/import-export adapters. The preferred interoperability boundary is GEDCOM and normalized genealogy data, not Charted Roots' vault schema.

```text
Genealogy Library canonical Markdown
            |
            +------> GEDCOM / adapter
                          |
                          v
                  Charted Roots / Obsidian
                          |
                          v
                    GEDCOM / adapter
                          |
                          v
                 reconciliation import
                          |
                          v
                     Git changes
```

The canonical Genealogy Library schema remains independent.

Do not require Charted Roots-specific fields in canonical records merely to make interoperability easier.

## Identity mapping

Charted Roots uses a stable `cr_id`. Genealogy Library uses its own permanent person ID.

These identifiers must not be conflated.

Conceptually:

```yaml
id: P000251
external:
  charted-roots:
    cr_id: "..."
```

or through an external identity ledger if keeping adapter-specific identifiers out of person frontmatter proves cleaner.

Once a Charted Roots `cr_id` has been mapped to a Genealogy Library person ID, that mapping should be retained so repeated migrations are deterministic.

File paths and Obsidian note titles are never identities.

## Relationship conversion

Charted Roots supports relationship data in forms such as:

```text
father / father_id
mother / mother_id
spouse / spouse_id
child / children_id
```

and may keep relationships bidirectionally synchronized because its UI needs editable wikilinks and reverse relationships.

Genealogy Library should not reproduce this duplication in canonical storage.

On Charted Roots -> Genealogy Library import:

1. Resolve relationships primarily through stable IDs when available.
2. Use wikilinks/note names only as a fallback or consistency signal.
3. Normalize bidirectional declarations into the minimal canonical relationship representation.
4. Do not preserve a derived reverse link merely because Charted Roots stores it explicitly.
5. Report contradictory declarations instead of silently choosing one.

On Genealogy Library -> Charted Roots export:

1. Derive all reverse relationships from the canonical graph.
2. Emit whatever redundant relationship fields Charted Roots requires.
3. Generate Obsidian wikilinks from the exported vault paths/note names.
4. Treat this redundancy as export material only, never canonical state.

## Names and Cyrillic/Latin matching

Migration must use the same transliteration-aware identity rules as GEDCOM reconciliation.

Examples such as:

```text
Алексей Назаров
Aleksei Nazarov
Aleksey Nazarov
Alexey Nazarov
```

may all refer to the same person.

Rules:

- transliteration contributes to candidate matching/search;
- it never establishes identity by itself;
- original spellings should be retained where useful;
- dates, parents, spouses and children carry stronger identity evidence;
- migration must not silently replace Cyrillic names with Latin names or vice versa.

## Fields worth supporting first

Initial compatibility should focus on information that is both common and structurally important:

- stable person identity;
- name and name components;
- sex;
- birth/death dates and places;
- biological parents;
- partners/spouses;
- marriage/divorce metadata when available;
- aliases/alternate names;
- notes/biographical Markdown;
- source/evidence references where a clean mapping exists;
- media references;
- original external/import IDs.

Less common Charted Roots-specific properties should not automatically expand the canonical schema. Unknown properties can be reported or preserved in migration metadata until we deliberately decide to support them.

## Canonical entity structure

Charted Roots usefully demonstrates that mature genealogy eventually needs more than `People`. Genealogy Library should reserve the same domain boundaries while keeping the canonical representation simpler and Git-friendly:

```text
src/content/
├── people/
├── events/
├── places/
├── sources/
├── citations/
└── evidence/
```

These are semantic data entities, not UI/application folders.

An Obsidian `Bases` directory is **not** part of the canonical content model. Its equivalent belongs to generated/configuration/view logic in Genealogy Library.

### People

People are grouped by birth decade for human navigation:

```text
people/
├── 1880-1889/
├── 1890-1899/
├── ...
└── unknown/
```

Paths never participate in identity or relationships.

### Events

First-class events are grouped by the year in which they occurred:

```text
events/
├── 1917/
├── 1941/
├── 1988/
│   └── birth-anton-nazarov/
│       └── index.md
├── 2023/
└── unknown/
```

If an event date is corrected, the event may move to another year directory without changing its stable event ID or breaking links.

Not every GEDCOM fact must become an event file. Simple birth/death metadata may remain embedded in the person record until there is a reason to promote it to a first-class event. Separate event records are most useful when the event has its own participants, place, sources, documents, narrative, or other metadata.

## Events, places, sources and citations migration

Charted Roots can model people, events, places, sources and citations as separate notes. This is useful as a domain reference, but Genealogy Library does not need to mirror Charted Roots' physical vault layout or plugin-oriented metadata.

The migration layer should separate **semantic identity** from **file representation**.

For example, if a Charted Roots birth event exists as its own note, the importer may map it to canonical person birth metadata if that is how Genealogy Library models that fact. If the same event deserves first-class treatment, it can instead become an event record under `events/<year>/...` with its own stable ID.

The same principle applies to places, sources, citations and evidence: preserve their meaning, not Charted Roots' file mechanics.

## Markdown body preservation

Person notes may contain human-written Markdown outside frontmatter. Migration must treat that content as valuable user data.

On import:

- preserve meaningful biography/research text;
- do not overwrite an existing canonical biography automatically;
- if both sides contain non-identical substantial text, produce a merge conflict/review item.

On export:

- generate Charted Roots-compatible frontmatter around the canonical body;
- avoid injecting renderer-specific generated content into the canonical Markdown body.

## Migration workflow

A safe Charted Roots -> Genealogy Library migration should follow the same reconciliation philosophy as GEDCOM import:

```text
select Obsidian vault/folder
        |
        v
scan genealogy notes
        |
        v
parse + normalize Charted Roots properties
        |
        v
resolve external IDs -> internal IDs
        |
        v
cross-script / graph-aware candidate matching
        |
        v
semantic diff
        |
   +----+----+-----------+
   |         |           |
 same   enrichment   conflict / ambiguous identity
   |         |           |
   +---------+-----------+
             |
             v
          review
             |
             v
      Git file changes
```

The importer should ideally produce a preview/diff before changing canonical files.

## Git remains the final history

Obsidian/Charted Roots may provide the richer editing experience, but changes only become part of Genealogy Library when converted into ordinary repository changes.

A future workflow could be:

```text
open/edit in Charted Roots
        -> GEDCOM/export adapter
        -> reconciliation
        -> generated Git diff
        -> review
        -> commit / PR
```

This preserves Git as the authoritative version history rather than maintaining a separate long-lived mutable database.

## What not to guarantee initially

The first compatibility layer does not need perfect bidirectional round-trip support for every Charted Roots feature.

In particular, do not commit to preserving:

- plugin UI state;
- canvas positions/layout state;
- dynamic blocks generated for Obsidian;
- Obsidian cache/index state;
- Charted Roots configuration;
- custom worldbuilding/universe features;
- every plugin-specific custom property;
- Obsidian Bases definitions.

The compatibility contract is about genealogical data and human-written content, not reproducing the application environment.

## Strategic value

This compatibility path provides an escape hatch in both directions:

- Genealogy Library can remain intentionally lightweight for daily use.
- When deep cleanup/research is needed, the data can be moved into a mature research interface.
- Improvements made there can return as transparent Git changes.
- Neither product becomes mandatory for long-term access to the family archive.

The long-term architecture therefore becomes:

```text
                 GEDCOM / Gramps / other sources
                           |
                           v
                 reconciliation/import layer
                           |
                           v
                Genealogy Library canonical Git
                  /                       \
                 /                         \
        static browse UI             optional research UI
        Astro/Starlight              Charted Roots/Obsidian
                 \                         /
                  \                       /
                   ---- interchange ----
```

This is the desired relationship: interoperability without ownership.
