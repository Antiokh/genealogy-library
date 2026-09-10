# Product direction and reference projects

This document records the current product intent and the external projects worth studying while designing Genealogy Library.

## Product intent

Genealogy Library is primarily an **interface for reading, exploring, and sharing a family history**, with occasional corrections and additions.

It is deliberately not intended to become a full-time genealogy research workstation comparable to Gramps.

That distinction should drive product decisions:

- browsing and understanding the family should be immediate;
- person pages, family context, tree views, pedigree views, search, maps/timelines and source visibility matter more than dense data-entry screens;
- editing is occasional and should be lightweight;
- advanced import/reconciliation tools can exist without dominating the everyday interface;
- the canonical data remains ordinary versioned files in Git;
- a UI may assist edits, but it must end by changing repository files rather than creating a second database.

A useful mental split is:

```text
NORMAL USE
read -> browse -> search -> tree/pedigree -> open person/source

OCCASIONAL MAINTENANCE
add/edit person -> import GEDCOM -> review conflicts -> commit changes
```

The expensive genealogy tooling is therefore a maintenance surface, not the home screen.

## Git-native difference

Existing genealogy applications are usually database-first or application-first. Our design is repository-first:

```text
Markdown/YAML + media in Git
          |
          v
     stateless build
          |
          v
 normalized genealogy dataset
          |
    +-----+------+------+
    |            |      |
 person pages   tree  pedigree / other views
```

Git provides:

- human-readable version history;
- diffs and blame;
- branches/PRs when useful;
- portability without a running genealogy server;
- independence from MyHeritage, Genotek, Gramps, Obsidian, Astro, or a specific visualization library.

The application layer should improve access to the files, not replace them.

## Editing direction

The first editing interface can stay deliberately simple.

### Initial version

Provide a documented person template and deterministic path rule:

```text
src/content/people/<birth-decade>/<person-slug>/index.md
```

An estimated year is sufficient to select the decade.

### Add person wizard

A future wizard should:

1. collect the minimum identity/date/relationship data;
2. determine the decade and path;
3. generate the canonical frontmatter;
4. create the file through GitHub or open the GitHub editor with the generated file/template;
5. leave the result as an ordinary repository change.

The same principle applies to conflict resolution: a review UI may be rich, but its output should be a transparent Git change.

## Name matching across Cyrillic and Latin scripts

Cross-script matching is a first-class requirement.

The existing genealogy contains data in Cyrillic and Latin scripts, and external systems may transliterate the same person differently. Examples of the same candidate identity can include:

```text
Алексей Назаров
Aleksei Nazarov
Aleksey Nazarov
Alexey Nazarov
```

Therefore duplicate detection and cross-dataset identity matching must be transliteration-aware.

Important rules:

- transliteration is a **matching/search aid**, not a canonical display transformation;
- preserve imported/original name forms;
- do not overwrite Cyrillic with Latin or Latin with Cyrillic merely because they normalize to the same candidate;
- retain alternate spellings/transliterations as aliases when useful;
- compare normalized name components rather than only whole display strings;
- support plausible transliteration variants rather than assuming one transliteration standard;
- family context, dates and relationships must outweigh a name-only transliteration match.

A transliteration match increases identity confidence; it does not establish identity by itself.

## Reference projects

### 1. Charted Roots / Obsidian

Repository: `banisterious/obsidian-charted-roots`

This is the closest architectural reference found so far.

Useful ideas to study:

- YAML/Markdown-first person records;
- stable internal `cr_id` independent from imported GEDCOM XREF;
- GEDCOM 5.5.1 import/export and Gramps XML support;
- pre-import analysis and quality preview;
- staging/review before writing imported data;
- duplicate detection and merge UI;
- family graph built from Markdown notes;
- person indexing;
- tree, hourglass, timeline and Family Chart adapters;
- source/evidence modeling;
- maps, statistics and reports;
- import compatibility fixes for real-world GEDCOM producers such as MyHeritage.

Differences from our direction:

- Charted Roots is an Obsidian research environment; Genealogy Library is primarily an exploration/publishing interface with occasional edits.
- Charted Roots depends on an active Obsidian vault and metadata cache; our build must work from repository files alone.
- Charted Roots stores several relationships bidirectionally and supports both wikilinks and IDs; our canonical model should avoid maintaining derived reverse relationships manually.
- Charted Roots has application state and interactive mutation services; our generated graph remains disposable and stateless.

The project should be installed in a test Obsidian vault and exercised with the same GEDCOM fixtures used by Genealogy Library. This is likely more informative than reading code alone.

Because Charted Roots is close to our Markdown-first model, it should also be treated as an optional research/editing client with an explicit migration/compatibility contract rather than only as a code reference. See [`charted-roots-migration-contract.md`](./charted-roots-migration-contract.md).

### 2. Gramps / Gramps Web

Repositories include `gramps-project/gramps-web` and the wider Gramps ecosystem.

Use Gramps primarily as a **genealogy domain-model reference**, not as an architectural template.

Questions to check against Gramps when our schema becomes unclear:

- how Person, Family, Event, Place, Source, Citation, Repository, Media and Notes are modeled;
- how unusual family relationships are represented;
- how events and evidence attach to people/families;
- what information is needed for serious GEDCOM round-tripping;
- which genealogy concepts should be first-class entities rather than ad-hoc frontmatter fields.

Gramps Web is also useful as a benchmark for research-oriented UX, but our product should remain substantially lighter for everyday use.

### 3. GEDKeeper

Repository: `Serg-Norseman/GEDKeeper`

Useful mainly as a mature GEDCOM 5.5.1 implementation and edge-case reference.

Study it when:

- a GEDCOM construct is ambiguous;
- vendor exports behave unexpectedly;
- parser/writer round-trip behavior needs comparison;
- pedigree/tree semantics need an additional independent implementation for validation.

It is not a storage or UI architecture reference for this project.

### 4. MGeurts/genealogy

Repository: `MGeurts/genealogy`

Potentially useful for its explicit person/couple model, multiple partnerships/remarriage handling and relationship rules.

It is a conventional Laravel/database application, so its persistence model should not drive our canonical format.

### 5. deep_architecture_genealogy

Repository: `hunkim/deep_architecture_genealogy`

Not relevant to family genealogy. It is a genealogy/mind-map of deep-learning architectures and can be ignored for our implementation.

## Visualization references

Visualization remains an adapter concern, not a canonical data concern.

Current useful references:

- **Family Chart** — attractive interactive local/family view and already used by Charted Roots;
- **Topola** — genealogy-specific ancestor/descendant/hourglass/relatives views and direct GEDCOM consumption;
- **Gramps Web** — useful benchmark for ancestor, descendant, fan, hourglass and map UX;
- **Charted Roots** — useful for comparing Family Chart, canvas trees, hourglass and timeline layouts.

The generated genealogy dataset should make it cheap to replace or combine these renderers.

## Working reference hierarchy

When making architectural decisions, use the projects for different purposes rather than treating any one of them as the model to copy:

```text
Gramps
  -> genealogy domain semantics

Charted Roots
  -> Markdown/YAML representation, import UX, merge/duplicate ideas, graph construction
  -> optional research/editing client via explicit migration adapters

GEDKeeper
  -> GEDCOM implementation and edge cases

Family Chart / Topola
  -> visualization experiments

Genealogy Library
  -> Git-native source of truth + static exploration interface + occasional editing
```

The goal is to borrow solved ideas while keeping the project's defining constraints: Git history, readable canonical files, stateless builds, importer independence, and a browse-first interface.