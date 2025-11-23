# Agent Brief

## Context
- Repository is a joinwarp.com test case.
- Objective: build a calendar experience that feels native to Warp while we continue aligning with their current styling system.
- Foundation: Warp tokens, typography, and layout primitives are already integrated so UI iterations stay consistent with their aesthetic.

## Progress
- ✅ Persisted event data store (localStorage-backed) with hydration helpers.
- ✅ Monthly grid rendered with consistent cell sizing, hover/active states, and selectable days.
- ✅ Click-to-select (with shift multi-select) filtering that powers both the grid and inspector.
- ✅ Inspector sidebar lists filtered events chronologically, grouped by day.
- ✅ Event pills include titles, times (with all-day handling), notes, and participant rollups.
- ✅ Base styling updated to match Warp tokens while preserving responsive flex layout.
- ✅ Calendar UI refactored into modular components (`CalendarView`, `CalendarDayCell`, `CalendarInspector`, `CalendarEventDetails`) with shared helpers in `lib/calendar.ts`, enabling richer interactions and multi-day span handling.

## Next Focus Areas
1. Month navigation controls and virtualized scroll for long horizons.
2. Event creation/edit flow with type, participants, and notes.
3. Visual differentiation per event type (color/icon system) in both grid and inspector.
4. Multi-day & overlapping event layout refinements.
5. Accessibility polish: keyboard interaction for selection and inspector, screen reader labels.
6. Optional: mobile responsive breakpoints once desktop parity feels solid.

## Current Workflow
1. **Refresh Warp tokens** – `npm run warp:fetch` then `npm run warp:extract` to stay synced with production styles.
2. **Develop calendar features** – core code lives in `app/page.tsx` with shared pieces under `components/` and stores in `lib/`.
3. **Persist + hydrate data** – use the helpers in `lib/events-store.ts` for any event changes so the UI stays consistent across sessions.

## Feature Checklist

### Core Features
- [x] Monthly calendar view (current month stream; navigation pending).
- [ ] Navigation between months (explicit controls).
- [x] Display events: title, start time, end time (optional), type, notes, participants.
- [ ] Event creation interface.
- [ ] Visual differentiation by event type (colors/icons).
- [ ] Click day to view expanded details (inspector shows list; day-level drill-in still basic).
- [ ] Mobile responsive layout.

### Technical Constraints
- [x] React application.
- [x] No calendar UI libraries; using date-fns for utilities.
- [x] Styling via Tailwind + Warp tokens (documented choice).
- [ ] Full TypeScript adoption (currently mixed TS/JS).

### Considerations (In Progress / Planned)
- [ ] Multi-day events rendering.
- [ ] Overlapping events display logic.
- [ ] Time zone awareness for remote teams.
- [ ] Recurring event support.
- [ ] High-density month handling (performance & readability).
- [ ] Continued Warp aesthetic polish.

### Bonus Challenges
- [ ] Google Calendar sync UI.
- [ ] Smart conflict detection.
- [ ] Advanced filtering by type/person/team.
- [ ] Accessibility: full keyboard + screen reader support.
