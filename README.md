# SlabAI — Grade Slab Design Platform

A browser-based structural design checker for reinforced-concrete **grade slabs (slabs-on-grade)** to **ACI 318-19**. Collect design inputs conversationally or via a manual form, run a transparent set of code checks, and read the results as an engineer's stamped calculation sheet — with step-by-step substitutions, clause references, interactive diagrams, and printable reports.

> **Live demo:** https://slabai-ten.vercel.app

---

## Core principle: deterministic engineering, not AI-generated numbers

Every structural number in SlabAI is computed by a **deterministic TypeScript engine** (`src/lib/calculations/`). The AI chatbot is used **only** to gather inputs and explain terms — it never produces capacities, demands, or pass/fail verdicts. Recommendations are derived rule-based from the calculation results, not by model inference.

Unimplemented design codes report `NOT_IMPLEMENTED` rather than silently borrowing another code's formulas.

---

## Features

- **Two input modes** — an AI chatbot that walks you through inputs step by step, or a full manual form.
- **8 ACI 318-19 checks** — geometry adequacy, soil bearing pressure, factored load (1.2D + 1.6L), flexural design (Whitney stress block), one-way shear, minimum reinforcement, crack control, and a deflection review.
- **DCR-driven results** — each check reports a Demand/Capacity Ratio with a bar that visually communicates **margin to the 1.0 limit**, plus a PASS / WARNING / FAIL stamp.
- **Interactive diagrams** — slab plan & reinforcement layout, bending-moment / shear-force diagrams, and a soil bearing-pressure distribution.
- **Reports & history** — the last 10 designs are stored locally in the browser; any run can be printed/exported.
- **Code comparison** — a side-by-side ACI 318-19 vs IS 456:2000 reference table.

Units are **US customary** (ft, in, psi, psf, kips).

> **Status:** ACI 318-19 is fully implemented. IS 456:2000 is a **stub** (roadmap) and reports `NOT_IMPLEMENTED`.

---

## Design language — "field notebook / instrument panel"

The UI is intentionally styled as a stamped calc sheet and drawing set rather than a generic dashboard: a warm-graphite background, a single desaturated steel-blue accent, moss-green for PASS and hazard-orange for FAIL (the only saturated color, reserved for failures and the stamp). Numeric values, DCR ratios, code references, and formulas are set in **IBM Plex Mono**; headings and status stamps use an expanded **Archivo** grotesk. No gradients — flat fills only.

---

## Tech stack

- **[Vite](https://vitejs.dev/)** + **React** + **TypeScript**
- **[Tailwind CSS](https://tailwindcss.com/)** with **[shadcn/ui](https://ui.shadcn.com/)** (Radix primitives) — theming via HSL CSS custom properties
- **[React Router](https://reactrouter.com/)** for client-side routing
- **[Recharts](https://recharts.org/)** for DCR charts; hand-authored SVG for structural diagrams
- **[react-hook-form](https://react-hook-form.com/)** for the manual input form

---

## Getting started

**Prerequisites:** Node.js (18+) & npm.

```sh
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Production build + local preview
npm run build
npm run preview

# Lint
npm run lint
```

---

## Project structure

```
src/
├── pages/                    # Route views: Index, Design, Reports, Compare, NotFound
├── components/
│   ├── features/             # ChatBot, DesignForm, ChecksList, ResultsDashboard
│   ├── diagrams/             # SlabPlan, ShearMoment, BearingPressure (SVG)
│   ├── layout/               # Header / nav
│   └── ui/                   # shadcn/ui primitives
├── hooks/                    # useDesignEngine, useChatbot
├── lib/calculations/         # Deterministic ACI 318-19 engine (aci318.ts) + IS 456 stub
├── types/                    # SlabInputs, CheckResult, DesignResults
├── constants/                # Default inputs, nav items
└── index.css                 # Design tokens (:root HSL custom properties)
```

---

## Deployment

Deployed on **Vercel** as a static SPA. `vercel.json` rewrites all unmatched paths to `/index.html` so client-side routes (e.g. `/design`) resolve on direct load and refresh.

```sh
vercel --prod        # deploy to production
```

---

## Disclaimer

SlabAI is an educational and preliminary-design aid. Clause numbers and provisions should be verified against the latest published edition of ACI 318. **Always have designs reviewed and stamped by a licensed structural engineer before construction.**
