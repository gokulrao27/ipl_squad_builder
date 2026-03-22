# IPL Squad Builder

A festival-themed IPL 2026 squad builder built with React, TypeScript, Vite, Tailwind CSS v4, and Motion.

The app is designed around a bright **Multicolour Burst** visual identity and includes:

- franchise selection from the IPL team list
- squad browsing with player portraits
- playing XI + impact player builder flows
- saved XI comparison for matchups
- fantasy XI selection for each match
- an IPL 2026 schedule view focused on **date, day, and matchup**
- richer match pages with captains, venue context, trends, and storyline panels

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- `motion`
- `lucide-react`

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The dev server runs on port `3000` and binds to `0.0.0.0`.

### Build for production

```bash
npm run build
```

### Type-check the project

```bash
npm run lint
```

## Project Structure

```text
src/
  App.tsx      # Main application UI and navigation
  data.ts      # Team, player, and IPL 2026 match schedule data
  index.css    # Festival theme styling and UI utility classes
  main.tsx     # App entry point
```

## Current Experience

### Home
- festival-style hero section
- franchise cards
- quick entry into team builder or schedule

### Team & Builder
- browse full squad lists
- build a playing XI
- assign one impact player
- save selections per team in local app state

### Schedule & Match Hub
- schedule cards intentionally show only:
  - date
  - day
  - team vs team
- match pages carry the extra detail such as:
  - captains
  - venue and city
  - average first innings score
  - batting-first trend
  - storyline and strategy notes

### Fantasy & Compare
- compare saved XIs between two teams in a matchup
- create a fantasy XI from both squads for a selected match

## Notes

- Player and captain images are styled to auto-fit within portrait frames as consistently as possible.
- Team and match data is currently maintained in `src/data.ts`.
- This project does not require `vite.config.ts` for its current setup.

## Scripts

```json
{
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit"
}
```
