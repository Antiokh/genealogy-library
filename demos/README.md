# Tree visualization demos

These are intentionally disposable comparison demos. They all use the same synthetic family with:

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

Tests how far the free genealogy-specific library gets us with only CSS/card customization.

Strength: low implementation effort and genealogy-specific layout.

Risk: its canonical input is person-centric (`parents`, `spouses`, `children`). That loses the explicit `family -> children` association and is exactly where multi-spouse layouts become ambiguous.

### Vue Flow + ELK

Tests the opposite approach: explicit `family` nodes in our graph, ELK for coordinates, Vue Flow only for rendering/interactions.

Strength: the graph semantics stay correct and the UI can be fully custom.

Risk: two libraries and more code. We also have to own genealogy-specific layout tuning.

### Custom SVG

Tests the lower bound of implementation weight and the desired visual language.

Strength: virtually unlimited design control and very small runtime.

Risk: this demo uses hand-authored positions. A production version would still need a real layout algorithm. Its purpose is to answer whether a custom renderer is visually attractive enough to justify owning the layout layer.

## Decision criterion

Do not choose based on the synthetic sample alone. The winner should later be tested with the real imported genealogy, especially:

1. multiple marriages with children from each union;
2. half-siblings;
3. missing/unknown parent;
4. spouse ancestry;
5. pedigree collapse;
6. wide collateral branches;
7. ~250 people and mobile interaction.
