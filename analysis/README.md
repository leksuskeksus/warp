# Warp Class Extraction System

## 🎯 What This Does

This tooling extracts and analyzes the **exact Tailwind utility classes** from Warp's production site, then generates the Tailwind configuration you need to use those same patterns in your own code.

## 🔍 The Problem You Were Facing

**Your old approach:**
- Writing custom CSS classes (`.warp-button`, `.warp-input`)
- Manually guessing what styles Warp uses
- Maintaining parallel CSS alongside Tailwind
- Visual parity always slightly off

**Warp's actual approach:**
- Pure Tailwind utility composition
- Semantic tokens in `tailwind.config.js`
- All styles visible in markup
- No custom CSS classes

**Why it wasn't working:**
You were trying to recreate Tailwind with custom CSS, when you should have been **extending Tailwind's config** to support Warp's semantic tokens.

---

## 🛠️ How This System Works

### 1. Extract Classes from HTML

```bash
npm run warp:classes
```

**What it does:**
- Parses `reference.html` (the saved Warp checkout page)
- Extracts all `class="..."` attributes
- Categorizes classes by type (typography, spacing, colors, etc.)
- Identifies component patterns (buttons, inputs, etc.)
- Finds custom tokens that need Tailwind config extensions

**Output:** `analysis/class-extraction.json`

### 2. Generate Tailwind Config

```bash
npm run warp:config
```

**What it does:**
- Reads the class extraction results
- Generates a complete `tailwind.config.js` with:
  - All semantic color tokens (`fg`, `bg`, `divider`, etc.)
  - Complete typography scale (`text-h1`, `text-body-1`, `text-button-1`, etc.)
  - Border/ring tokens (`border-input`, `ring`, etc.)
  - Custom breakpoints (`max-tablet`, `max-mobile-h`)
  - Button state colors (`bg-btn-main`, `bg-btn-secondary-hover`, etc.)

**Output:** `tailwind.config.new.js`

### 3. Run Complete Analysis

```bash
npm run warp:analyze
```

Runs both extraction and config generation in sequence.

---

## 📊 What Was Extracted

From Warp's checkout page:

- **190 unique classes** identified
- **49 button instances** found
- **15 input instances** found
- **15 custom semantic tokens** requiring Tailwind config
- **7 typography tokens** (h4, body-1, body-2, button-1, caption, tag, input-1)
- **1 custom breakpoint** (max-tablet)

### Key Findings

#### Custom Tokens in Use
```
bg-bg, bg-bg2, bg-bg-disabled, bg-divider
text-fg-error, text-fg2, text-fg3
border-input
text-h4, text-body-1, text-body-2, text-button-1, text-caption, text-tag, text-input-1
```

#### Spacing Patterns
```
Heights: 40px (inputs), 50px (buttons)
Gaps: 3px, 7px, 10px, 15px, 20px, 30px, 50px
Padding: 15px, 20px (cards)
```

#### Advanced Patterns
- Arbitrary child selectors: `[&_svg]:stroke-[2.25px]`
- Data attribute states: `data-[active=true]:bg-bg-btn-active`
- Group variants: `group/button`
- Complex pseudo-classes: `placeholder:text-fg4`, `file:h-[40px]`

---

## 🚀 Next Steps

### 1. Review the Generated Config

```bash
cat tailwind.config.new.js
```

Compare it with your current config to understand what's changing.

### 2. Study Component Patterns

```bash
cat analysis/COMPONENT_PATTERNS.md
```

This shows you the exact class strings Warp uses for:
- Buttons (primary, text, subtle)
- Inputs (text, number)
- Typography patterns
- Responsive patterns

### 3. Adopt the New Config

```bash
# Backup current config
mv tailwind.config.js tailwind.config.old.js

# Use new config
mv tailwind.config.new.js tailwind.config.js

# Rebuild Tailwind
npm run dev
```

### 4. Refactor Components

**Before:**
```tsx
// components/ui/button.tsx
<button className="warp-button warp-button--primary">
  Click me
</button>
```

**After:**
```tsx
// components/ui/button.tsx
<button className="relative inline-flex items-center justify-center gap-[3px] h-[50px] px-[17px] rounded-md bg-bg-btn-main text-fg-btn-main text-button-1 font-semibold hover:bg-bg-btn-main-hover focus-visible:ring-[3px] focus-visible:ring-ring disabled:bg-bg-disabled disabled:text-fg4 disabled:cursor-not-allowed transition-all">
  Click me
</button>
```

See `COMPONENT_PATTERNS.md` for the full strings.

### 5. Remove Custom CSS

From `app/globals.css`, you can now **delete**:
- `.warp-button` and all variants
- `.warp-input`
- `.warp-select`
- `.warp-textarea`

**Keep:**
- CSS custom property definitions (`:root { --fg: ... }`)
- Font face declarations
- Global resets

---

## 🔄 Workflow for Updates

When Warp updates their design and you want to sync:

1. **Save new reference HTML:**
   ```bash
   # While logged into app.joinwarp.com/checkout
   # Right-click → Save Page As → reference.html
   ```

2. **Re-run analysis:**
   ```bash
   npm run warp:analyze
   ```

3. **Review changes:**
   ```bash
   git diff tailwind.config.new.js tailwind.config.js
   cat analysis/class-extraction.json
   ```

4. **Apply updates:**
   ```bash
   mv tailwind.config.new.js tailwind.config.js
   npm run dev
   ```

---

## 📁 Files Created

```
scripts/
  extract-classes.js           # Parses HTML, extracts classes
  generate-tailwind-config.js  # Generates Tailwind config

analysis/
  class-extraction.json        # Raw extraction data
  COMPONENT_PATTERNS.md        # Human-readable patterns guide
  README.md                    # This file

tailwind.config.new.js         # Generated Tailwind config
```

---

## 💡 Key Insights

### Why This Approach Works

1. **No guesswork**: You're using Warp's actual class strings
2. **Semantic tokens**: `bg-bg-btn-main` is clearer than `bg-gray-800`
3. **Tailwind-native**: No custom CSS to maintain
4. **Easy updates**: Re-run extraction when Warp changes
5. **Full power**: Access to all Tailwind features (arbitrary values, variants, etc.)

### What You Learned

- Warp doesn't use custom CSS classes for components
- They extend Tailwind's config with semantic tokens
- All their styling is pure utility composition
- Your CSS custom properties are correct—you just needed to wire them into Tailwind

### The Fundamental Shift

**Old mental model:**
> "I need to write CSS that looks like Tailwind"

**New mental model:**
> "I need to extend Tailwind to support Warp's tokens, then use those tokens as utilities"

---

## ❓ FAQ

**Q: Do I still need the CSS custom properties in `warp-tokens.css`?**
A: YES! The Tailwind config references them via `var(--fg)`, `var(--bg-btn-main)`, etc.

**Q: Can I still use React component props like `<Button variant="primary">`?**
A: Yes, but now those props should map to Tailwind utility strings, not custom CSS classes.

**Q: What about the `.warp-button` CSS I already wrote?**
A: You can delete it. The Tailwind utilities will replace it completely.

**Q: How do I customize a button for a specific use case?**
A: Add utilities directly: `<Button className="!bg-blue-500 !h-[60px]">` or modify the base string in the component.

**Q: Will this increase my bundle size?**
A: No—Tailwind's JIT compiler only includes used utilities. Pure utilities are actually smaller than custom CSS.

---

## 🎓 Learning Resources

- See real examples in `COMPONENT_PATTERNS.md`
- Compare old vs new in your components (Button, Input)
- Check `class-extraction.json` for the raw data
- Read Tailwind docs on:
  - [Extending the config](https://tailwindcss.com/docs/theme)
  - [Arbitrary values](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)
  - [Custom variants](https://tailwindcss.com/docs/hover-focus-and-other-states#custom-modifiers)

---

**You're now ready to build with Warp's exact design system! 🚀**
