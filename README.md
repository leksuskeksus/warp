# Warp Calendar Test Case

## To Run

```bash
npm install
npm run dev
```

## Style

Scraped styles from your app, tried to match where I could but more of a spirit of the law than letter of the law.

Minimal app chrome, tried to maximize content area to enable readability at high data density, existing controls placed over soft overlay.

## What We Got

### Calendar View

- Unbroken smooth scroll, added pagination
- Main navigation, displays all events
- Select events, or select days with clicks, shift+clicks, cmd+clicks for filtration and quick spanning events
- Optimized for scrolling performance
- Create events by clicking on gaps in between events, or quickly create spanning events by
- Grouped time off
- Supports overflow

### Inspector View

- Collapse for fullscreen overview
- Shows all upcoming events in a chronological view
- Click event to focus it; scrolls the calendar to event's date

### Event Detail & New Event Creation

- All formal requests satisfied, including conflict detection, but very hacky and uneven, I was rushing
- (Laggy) realtime preview of all edits on the calendar

### Bugs

- Lots of them!!!

## What We Don't Got

- Filtering (it's implied in the UI, but completely non functional, except for the date)
- External calendar sync
- Mobile layout
