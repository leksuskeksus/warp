# Warp Component Patterns

This document contains the **exact Tailwind class patterns** extracted from Warp's production checkout page.

## 📊 Summary

- **Total unique classes**: 190
- **Buttons found**: 49 instances
- **Inputs found**: 15 instances
- **Custom tokens needed**: 15 (border-input, text-input-1, bg-btn-main, etc.)
- **Custom breakpoints**: max-tablet, max-mobile-h

---

## 🔘 Button Patterns

### Primary Button (Main CTA - Disabled State)

```tsx
<button
  data-slot="button"
  disabled
  className="group/button relative inline-flex items-center justify-center gap-[3px] whitespace-nowrap rounded-md transition-all duration-0 shrink-0 cursor-pointer focus-visible:border-ring focus-visible:ring-ring/0 focus-visible:ring-0 data-[active=true]:bg-bg-btn-active data-[active=true]:outline-transparent data-[active=true]:!text-fg-btn-active data-[active=true]:hover:bg-bg-btn-active-hover [&_svg]:stroke-[2.25px] [&_svg]:-ml-[1px] [&_svg]:mr-[1px] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 [&_kbd]:ml-[4px] [&_kbd]:-mr-[2px] text-button-1 px-[17px] !text-fg4 outline-none bg-bg-disabled hover:bg-background-alt hover:opacity-100 hover:brightness-100 !cursor-not-allowed h-[50px]"
>
  Continue to payment
</button>
```

**Key patterns:**
- `group/button` - Named group for nested selectors
- `data-[active=true]:...` - Data attribute state variants
- `[&_svg]:...` - Arbitrary variant for child SVG styling
- `h-[50px]` - Custom height (50px standard for main buttons)
- `gap-[3px]` - Custom gap between icon and text
- `text-button-1` - Custom font size token

### Simple Text Button

```tsx
<button className="text-left underline hover:text-fg">
  Apply Promo Code
</button>
```

**Key patterns:**
- No borders, backgrounds
- Simple hover state with `hover:text-fg`
- Text alignment with `text-left`

### Subtle Button with Transition

```tsx
<button className="cursor-pointer font-inherit tracking-inherit underline transition-default hover:opacity-60">
  Change plan
</button>
```

**Key patterns:**
- `font-inherit` - Inherit surrounding font
- `tracking-inherit` - Inherit letter spacing
- `transition-default` - Custom transition token
- `hover:opacity-60` - Opacity-based hover effect

---

## 📝 Input Patterns

### Text/Number Input (Standard)

```tsx
<input
  type="number"
  className="border-input text-input-1 flex h-[40px] w-full min-w-0 rounded-md border bg-transparent py-[3px] px-[10px] text-base outline-none transition-[color,box-shadow] placeholder:text-fg4 disabled:cursor-not-allowed disabled:text-fg4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive file:inline-flex file:h-[40px] file:border-0 file:bg-transparent file:text-input-1 file:font-medium"
  min="1"
  max="50"
  placeholder="Enter a number"
/>
```

**Key patterns:**
- `border-input` - Custom semantic border color
- `text-input-1` - Custom font size for inputs
- `h-[40px]` - Standard input height
- `transition-[color,box-shadow]` - Specific transition properties
- `placeholder:text-fg4` - Placeholder pseudo-class
- `focus-visible:ring-[3px]` - Custom ring width on focus
- `aria-invalid:...` - ARIA state variants
- `file:...` - File input pseudo-element styling
- `dark:aria-invalid:...` - Dark mode + ARIA combined

---

## 🎨 Typography Patterns

### Custom Font Size Tokens Used

From the extraction, these are the typography utilities Warp uses:

```css
text-h4          /* Heading 4 */
text-body-1      /* Body text (default) */
text-body-2      /* Smaller body text */
text-button-1    /* Button text */
text-caption     /* Caption/helper text */
text-tag         /* Tags/labels */
text-input-1     /* Input field text */
```

### Font Weight Patterns

```css
font-book        /* Custom 450 weight */
font-medium      /* 500 */
font-semibold    /* 600 */
font-inherit     /* Inherit from parent */
```

---

## 🎯 Semantic Color Tokens

These tokens are used throughout and must be in your Tailwind config:

### Text Colors
```css
text-fg          /* Primary text */
text-fg2         /* Secondary text */
text-fg3         /* Tertiary text */
text-fg4         /* Placeholder/disabled text */
text-fg-error    /* Error state text */
text-g8          /* Gray scale 8 */
```

### Background Colors
```css
bg-bg            /* Primary background */
bg-bg2           /* Secondary background */
bg-bg-disabled   /* Disabled state */
bg-divider       /* Divider/separator */
bg-g96           /* Gray scale 96 */
```

### Border Colors
```css
border-input     /* Input border */
border-ring      /* Focus ring */
```

---

## 📐 Spacing Patterns

Warp uses **consistent arbitrary values** for spacing:

### Common Gaps
```css
gap-[3px]    /* Tight (icon + text) */
gap-[7px]    /* Small */
gap-[10px]   /* Medium */
gap-[15px]   /* Default */
gap-[20px]   /* Large */
gap-[30px]   /* Extra large */
gap-[50px]   /* Section spacing */
```

### Common Heights
```css
h-[40px]     /* Inputs, small buttons */
h-[50px]     /* Primary buttons */
h-[1px]      /* Dividers */
h-[30px]     /* Icons, avatars */
```

### Common Padding
```css
p-[15px]     /* Card padding (mobile) */
p-[20px]     /* Card padding (desktop) */
px-[10px]    /* Input horizontal padding */
px-[17px]    /* Button horizontal padding */
py-[3px]     /* Input vertical padding */
```

---

## 📱 Responsive Patterns

### Custom Breakpoints

```css
max-tablet:...    /* Below 768px */
max-mobile-h:...  /* Below 600px (mobile horizontal) */
```

### Common Responsive Utilities

```css
max-tablet:hidden         /* Hide on mobile/tablet */
max-tablet:flex-col       /* Stack on mobile */
max-tablet:px-[30px]      /* Smaller padding on mobile */
max-tablet:text-caption   /* Smaller text on mobile */
max-tablet:gap-[10px]     /* Tighter spacing on mobile */
```

---

## 🎭 Advanced Patterns

### Arbitrary Variants (Child Selectors)

```tsx
// Style child SVGs within button
className="[&_svg]:stroke-[2.25px] [&_svg]:size-4 [&_svg]:shrink-0"

// Style child kbd elements
className="[&_kbd]:ml-[4px] [&_kbd]:-mr-[2px]"

// Conditional styling with :not()
className="[&_svg:not([class*='size-'])]:size-4"
```

### Data Attribute States

```tsx
// Active state via data attribute
className="data-[active=true]:bg-bg-btn-active data-[active=true]:!text-fg-btn-active"
```

### Group Variants

```tsx
// Parent with named group
<div className="group/checkout">
  {/* Child that hides when parent doesn't have specific descendant */}
  <div className="group-[&:not(:has([data-slot='totals']))]/checkout:flex" />
</div>
```

### Complex Pseudo-classes

```tsx
// File input styling
className="file:inline-flex file:h-[40px] file:border-0"

// Placeholder styling
className="placeholder:text-fg4"

// Has-sibling selector
className="has-[a]:underline"
```

---

## 🔄 Migration Path

### Before (Your Current Approach)

```tsx
// components/ui/button.tsx
<button className="warp-button warp-button--primary warp-button--md">
  Click me
</button>
```

### After (Warp's Approach)

```tsx
// components/ui/button.tsx
<button className="relative inline-flex items-center justify-center gap-[3px] h-[50px] px-[17px] rounded-md bg-bg-btn-main text-fg-btn-main text-button-1 font-semibold hover:bg-bg-btn-main-hover focus-visible:ring-[3px] focus-visible:ring-ring disabled:bg-bg-disabled disabled:text-fg4 disabled:cursor-not-allowed">
  Click me
</button>
```

**Benefits:**
- ✅ No custom CSS to maintain
- ✅ All styling visible in JSX
- ✅ Easy to customize per-instance
- ✅ Matches Warp exactly
- ✅ Full TypeScript autocomplete for all utilities

---

## 🚀 Quick Start

1. **Update Tailwind config** with new tokens:
   ```bash
   mv tailwind.config.js tailwind.config.old.js
   mv tailwind.config.new.js tailwind.config.js
   ```

2. **Remove custom CSS classes** from `globals.css`:
   - Delete `.warp-button` and related styles
   - Keep only CSS variables/tokens

3. **Update components** to use utility classes:
   ```tsx
   // OLD
   <Button variant="primary">Text</Button>

   // NEW
   <Button>Text</Button>

   // Where Button outputs the full utility string
   ```

4. **Test and iterate**:
   - Compare visually against reference.html
   - Adjust arbitrary values as needed
   - Add missing tokens to tailwind.config.js

---

## 📚 Reference

- **Full button class string**: See `analysis/class-extraction.json` → `fullComponentClasses.button`
- **Full input class string**: See `analysis/class-extraction.json` → `fullComponentClasses.input`
- **All extracted classes**: See `analysis/class-extraction.json` → `categories`
- **Theme extensions needed**: See `analysis/class-extraction.json` → `themeExtensions`
