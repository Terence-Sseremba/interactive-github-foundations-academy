# Terence's GitHub Foundations Academy

An interactive, single-page learning app for the **GitHub Foundations** certification.
Built with React 19, TypeScript and Vite, styled with Tailwind CSS v4.

## What's in it

The app is one stateful workspace with seven views, driven from the sidebar:

| View | What it does |
| --- | --- |
| **Academy Dashboard** | Live progress, current milestone, XP and rank, quick launch cards |
| **Interactive Roadmap** | Six milestones; completion is computed from lessons actually finished |
| **Current Lesson** | The authored "Why version control exists" unit, with both failure scenarios and the four-stage model |
| **Interactive 4-Stage Map** | Click any stage (Working -> Staging -> Local -> Remote) to open its inspector |
| **Practice terminal** | A simulated Git shell over a mock C# repo |
| **Certification Quizzes** | Three scenario questions with scoring and explanations |
| **Review & Progress** | Strengths, focus areas and the recommended next unit |

### The practice terminal

A reactive Git simulator. Files move through real lifecycle states and the
left-hand inspector updates as you go. Supported commands:

```
git status                    git branch [name]
git add <file> | .            git switch <branch>
git commit -m "message"       git merge <branch>
git push [remote] [branch]    git fetch
git pull
```

Type them, or use the Quick Commands tray. XP is awarded for commits and pushes.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck (`tsc -b`) then production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run verify` | Headless smoke test - mounts the real app in jsdom and drives every tab, the terminal flow and the quizzes |

`npm run verify` is the fastest way to confirm nothing regressed after a change.
It asserts 35 behaviours, including the ones most likely to break silently:
quiz selection surviving re-render, milestone progress recalculating, and the
lab's add -> commit -> push state machine.

## Project structure

```
src/
  App.tsx                          all views + the Git simulator
  main.tsx                         React entry point
  index.css                        Tailwind import, design tokens, base layer
  components/icons/GithubIcon.tsx  local GitHub mark
verify/
  entry.tsx                        interaction harness
  run.mjs                          jsdom runner
```

## Notes for maintainers

- **Design tokens.** The UI uses four slate shades that aren't in stock
  Tailwind (`slate-650`, `slate-750`, `slate-755`, `slate-850`). They're
  declared in the `@theme` block in `src/index.css`. Referencing an
  undeclared shade fails silently - the element just renders unstyled.
- **The GitHub mark is local.** lucide-react v1 dropped every brand glyph, so
  `Github` is no longer importable from it. Use
  `src/components/icons/GithubIcon.tsx`, which takes the same props.
- **Milestone gradients.** Each milestone carries a `color` string like
  `"from-blue-500 to-indigo-600"` that is composed into a class at runtime.
  Tailwind only finds these because the full class names appear as literals in
  the source. If you build one by concatenation, it will not be generated.
- **Lesson content.** Only `lesson-1` is authored. Any other lesson renders a
  deliberate "unit in production" screen with routes back into the live
  material, rather than an empty panel.
