# Glass UI – v1 stable

Snapshot taken: 2026-04-19

## What this captures

The "Investing Hub" card on the landing page at its first fully-accepted
state, after the baked "Transparent Glass Effect" title and "Feature" badge
were inpainted out of the source PNG.

Layers (front to back):
- `investing-hub-clean.png` — source artwork with the original baked title and
  Feature pill erased via per-column vertical-interpolation inpainting.
- `InvestmentServicesSection.tsx` — React component that renders the artwork
  plus a floating `<h3>Investing Hub</h3>` and the Persian FINVEST/NOVA
  front-pill overlay.
- `investing-hub-original.png` — untouched original asset from Figma, kept so
  the inpainting can be redone from scratch if the script needs to change.

## Files in this snapshot

- `InvestmentServicesSection.tsx`  → copy of
  `src/components/InvestmentServicesSection.tsx` at snapshot time.
- `investing-hub-clean.png`        → copy of
  `public/figma/investing-hub-clean.png` at snapshot time.
- `investing-hub-original.png`     → copy of
  `public/figma/investing-hub.png` (the unmodified Figma export).

## How to restore

From the project root (`namdar-academy/`):

```bash
cp .snapshots/glass-ui-v1-stable/InvestmentServicesSection.tsx src/components/InvestmentServicesSection.tsx
cp .snapshots/glass-ui-v1-stable/investing-hub-clean.png       public/figma/investing-hub-clean.png
cp .snapshots/glass-ui-v1-stable/investing-hub-original.png    public/figma/investing-hub.png
```

After restoring, the landing page should render identically to this
accepted state.

## Do not modify

Treat every file under this directory as read-only. Future iterations should
edit `src/` and `public/` directly, not the snapshot copies.
