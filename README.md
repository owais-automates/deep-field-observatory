# Deep Field Observatory — Exoplanet Research Interface

A Next.js 15 prototype for the **NASA Space Apps Challenge 2026**.

## Challenge alignment

**Selected challenge:** Planet X and SPHEREx

**Status — partial alignment.** The official Planet X and SPHEREx challenge asks teams to build a *public-facing web tool that displays SPHEREx sky images and makes it easy to see how they change over time*, including RA/declination input, a time-series image viewer, and optional 102-band infrared display, image add/subtract, FOV control, and Gaia/WISE overlays.

This repository is **not** a complete SPHEREx implementation. It is an exoplanet research interface built around a 3D solar-system visualization and an exoplanet catalog. It shares the challenge's scientific motivation (finding moving objects, understanding the sky, making NASA data explorable) and uses the same web/visualization stack, but it does **not** currently:

- Display SPHEREx imagery or spectra
- Accept Right Ascension / declination coordinates
- Compare sky images over time
- Show the 102 near-infrared bands
- Provide the recommended test targets (Barnard's Star, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis)

**Recommendation:** submit this as an exoplanet-research prototype, and be explicit in your presentation that the SPHEREx-specific functionality is not yet implemented. Do not describe it as a SPHEREx sky-comparison tool.

## What the application does

An interactive observatory console for exploring exoplanet research:

- **3D solar-system scene** (Three.js) with orbit rings, a habitable-zone overlay (conservative and optimistic boundaries), and camera Focus / Reset controls.
- **Exoplanet catalog** with a discovery drawer and a detail view for each object.
- **Data visualization dashboard** (Recharts) showing an aggregate exoplanet-discovery trend.
- **Selected-object information ribbon** that shows identity, measurements, mode, and actions.
- A keyboard-accessible scene selector and an About / Provenance panel.

## Technologies

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Three.js (with OrbitControls)
- Recharts
- Playwright (verification only)

## Running the project

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build:

```bash
npm run build
```

## Data sources and citations

- **Exoplanet catalog:** mock/demo data only. The three exoplanets shown (Kepler-186f, TRAPPIST-1e, Proxima Centauri b) are illustrative records; their values are not pulled live from a NASA API in this build.
- **Solar-system model:** mock data representing Mercury, Venus, Earth, and Mars.
- **Habitable-zone boundaries:** Kopparapu et al. (2013), *ApJ* 765,131; erratum *ApJ* 770,82. Conservative 0.99–1.67 AU, optimistic 0.75–1.77 AU. The HZ is an illustrative climate/orbit guide, not a habitability guarantee, and is rendered on a visual scale independent of the scientific AU values.
- **Aggregate chart data:** synthetic demo dataset. It is not real exoplanet-discovery statistics.

## Mock data and limitations

- All displayed data is mock/demo. Do not describe it as live NASA data.
- Exoplanet host-system geometry is unavailable in the current catalog mock and is shown as "Unavailable (unverified in catalog)".
- Missing numeric fields are shown as "Unavailable" or "—".
- No real SPHEREx imagery, spectra, or time-series sky data is integrated.
- The 3D scene is a visualization, not a physically accurate simulation.

## AI tools used

This prototype was developed with assistance from an AI coding agent (Kilo Code) that performed code inspection, editing, type-checking, build verification, and Playwright-based runtime verification. All design and scientific claims were reviewed and confirmed by the human team before submission.

## Known limitations

- No live NASA API integration; all data is mock.
- No SPHEREx challenge functionality.
- Pre-existing test-file type errors remain in `src/components/scientific/ExoplanetCard.test.tsx` and `src/components/scientific/StarSystem3D.test.tsx` (they test an older component API).
- No ESLint configuration file exists in the repository root.
- Visual quality has not been verified in a real browser by a human; automated Playwright checks confirm the canvas and chart render without console errors.