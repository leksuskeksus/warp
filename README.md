This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Warp Calendar Test Case

### Style

scraped styles from your app, tried to match where i could but more of a spirit of the law than letter of the law

minimal app chrome, tried to maximize content area to enable readability at high data density, existing controls placed over soft overlay

### What We Got

#### Calendar View

- unbroken smooth scroll, added pagination
- main navigation, displays all events
- select events, or select days with clicks, shift+clicks, cmd+clicks for filtration and quick spanning events
- optimized for scrolling performance
- create events by clicking on gaps in between events, or quickly create spanning events by
- groupped time off
- supports overflow

#### Inspector View

- collapse for fullscreen overview
- shows all upcoming events in a chronological view
- click event to focus it; scrolls the calendar to event's date

#### Event Detail & New Event Creation

- all formal requests satisfied, but very hacky and uneven, i was rushing
- (laggy) realtime preview of all edits on the calendar

### Bugs

(empty for now)

### What We Don't Got

- filtering (it's implied in the ui, but completely non functional, except for the date)
- external calendar sync
- mobile layout
