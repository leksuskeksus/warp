const fs = require('fs');
const path = require('path');

// Read the reference HTML
const html = fs.readFileSync(path.join(__dirname, '../reference.html'), 'utf-8');

// Extract all class attributes
const classRegex = /class="([^"]*)"/g;
const allClasses = new Set();
const componentPatterns = {
  buttons: [],
  inputs: [],
  selects: [],
  textareas: [],
  layouts: [],
};

let match;
while ((match = classRegex.exec(html)) !== null) {
  const classes = match[1].split(/\s+/).filter(Boolean);
  classes.forEach(cls => allClasses.add(cls));
}

// Extract element-specific patterns
const buttonRegex = /<button[^>]*class="([^"]*)"[^>]*>/g;
while ((match = buttonRegex.exec(html)) !== null) {
  componentPatterns.buttons.push(match[1]);
}

const inputRegex = /<input[^>]*class="([^"]*)"[^>]*>/g;
while ((match = inputRegex.exec(html)) !== null) {
  componentPatterns.inputs.push(match[1]);
}

const selectRegex = /<select[^>]*class="([^"]*)"[^>]*>/g;
while ((match = selectRegex.exec(html)) !== null) {
  componentPatterns.selects.push(match[1]);
}

const textareaRegex = /<textarea[^>]*class="([^"]*)"[^>]*>/g;
while ((match = textareaRegex.exec(html)) !== null) {
  componentPatterns.textareas.push(match[1]);
}

// Categorize classes
const categories = {
  customTokens: new Set(),
  typography: new Set(),
  spacing: new Set(),
  colors: new Set(),
  layout: new Set(),
  responsive: new Set(),
  pseudo: new Set(),
  arbitrary: new Set(),
  group: new Set(),
  data: new Set(),
  other: new Set(),
};

allClasses.forEach(cls => {
  // Skip module-hashed classes
  if (cls.includes('module__') || cls.includes('_')) {
    return;
  }

  // Custom semantic tokens (these need to be in tailwind.config)
  if (cls.match(/^(text|bg|border|ring)-(input|button|field|status|tab|caption|tag|subhead|body|h[1-4]|btn|fg|bg|divider|destructive)/)) {
    categories.customTokens.add(cls);
  }
  // Typography
  else if (cls.startsWith('text-') || cls.startsWith('font-') || cls.startsWith('leading-') || cls.startsWith('tracking-')) {
    categories.typography.add(cls);
  }
  // Spacing
  else if (cls.match(/^(p|m|gap|space)[txylrb]?-/) || cls.match(/^(h|w|min|max)-(full|screen|\[)/)) {
    categories.spacing.add(cls);
  }
  // Colors
  else if (cls.match(/^(text|bg|border|ring)-(red|green|blue|yellow|orange|purple|sky|g-|g\d)/)) {
    categories.colors.add(cls);
  }
  // Layout
  else if (cls.match(/^(flex|grid|inline|block|hidden|relative|absolute|fixed|sticky)/)) {
    categories.layout.add(cls);
  }
  // Responsive
  else if (cls.match(/^(sm|md|lg|xl|2xl|max-tablet|max-mobile):/)) {
    categories.responsive.add(cls);
  }
  // Pseudo states
  else if (cls.match(/^(hover|focus|active|disabled|group-hover|data-\[):/)) {
    categories.pseudo.add(cls);
  }
  // Arbitrary values
  else if (cls.includes('[') && cls.includes(']')) {
    categories.arbitrary.add(cls);
  }
  // Group variants
  else if (cls.includes('group/')) {
    categories.group.add(cls);
  }
  // Data attributes
  else if (cls.startsWith('data-[')) {
    categories.data.add(cls);
  }
  else {
    categories.other.add(cls);
  }
});

// Identify custom theme extensions needed
const themeExtensions = {
  borderColor: new Set(),
  textColor: new Set(),
  backgroundColor: new Set(),
  ringColor: new Set(),
  fontSize: new Set(),
  screens: new Set(),
};

categories.customTokens.forEach(cls => {
  const [prefix, ...rest] = cls.split('-');
  const token = rest.join('-');

  if (prefix === 'border') themeExtensions.borderColor.add(token);
  if (prefix === 'text' && !cls.match(/text-(left|right|center|justify)/)) {
    // Could be color or font size
    if (token.match(/^(input|button|field|status|tab|caption|tag|body|h\d|subhead)/)) {
      themeExtensions.fontSize.add(token);
    } else {
      themeExtensions.textColor.add(token);
    }
  }
  if (prefix === 'bg') themeExtensions.backgroundColor.add(token);
  if (prefix === 'ring') themeExtensions.ringColor.add(token);
});

// Extract custom screen sizes
categories.responsive.forEach(cls => {
  const screen = cls.split(':')[0];
  if (screen.startsWith('max-')) {
    themeExtensions.screens.add(screen);
  }
});

// Generate output
const output = {
  summary: {
    totalUniqueClasses: allClasses.size,
    componentPatterns: {
      buttons: componentPatterns.buttons.length,
      inputs: componentPatterns.inputs.length,
      selects: componentPatterns.selects.length,
      textareas: componentPatterns.textareas.length,
    },
  },
  categories: {
    customTokens: Array.from(categories.customTokens).sort(),
    typography: Array.from(categories.typography).sort(),
    spacing: Array.from(categories.spacing).sort(),
    colors: Array.from(categories.colors).sort(),
    layout: Array.from(categories.layout).sort(),
    responsive: Array.from(categories.responsive).sort(),
    pseudo: Array.from(categories.pseudo).sort(),
    arbitrary: Array.from(categories.arbitrary).sort(),
    group: Array.from(categories.group).sort(),
    data: Array.from(categories.data).sort(),
  },
  componentPatterns: {
    buttons: componentPatterns.buttons.slice(0, 5).map(c => c.split(/\s+/).slice(0, 15).join(' ') + '...'),
    inputs: componentPatterns.inputs.slice(0, 3).map(c => c.split(/\s+/).slice(0, 15).join(' ') + '...'),
    selects: componentPatterns.selects.slice(0, 3).map(c => c.split(/\s+/).slice(0, 15).join(' ') + '...'),
    textareas: componentPatterns.textareas.slice(0, 3).map(c => c.split(/\s+/).slice(0, 15).join(' ') + '...'),
  },
  themeExtensions: {
    borderColor: Array.from(themeExtensions.borderColor).sort(),
    textColor: Array.from(themeExtensions.textColor).sort(),
    backgroundColor: Array.from(themeExtensions.backgroundColor).sort(),
    ringColor: Array.from(themeExtensions.ringColor).sort(),
    fontSize: Array.from(themeExtensions.fontSize).sort(),
    screens: Array.from(themeExtensions.screens).sort(),
  },
  fullComponentClasses: {
    button: componentPatterns.buttons[2] || '', // The full main button
    input: componentPatterns.inputs[0] || '',
    select: componentPatterns.selects[0] || '',
    textarea: componentPatterns.textareas[0] || '',
  }
};

// Write results
const outputPath = path.join(__dirname, '../analysis/class-extraction.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ Class extraction complete!');
console.log(`📊 Total unique classes: ${output.summary.totalUniqueClasses}`);
console.log(`🔘 Buttons found: ${output.summary.componentPatterns.buttons}`);
console.log(`📝 Inputs found: ${output.summary.componentPatterns.inputs}`);
console.log(`📋 Results saved to: ${outputPath}`);
console.log('\n🎨 Custom tokens that need Tailwind config:');
console.log(`  - Border colors: ${output.themeExtensions.borderColor.length}`);
console.log(`  - Text colors: ${output.themeExtensions.textColor.length}`);
console.log(`  - Background colors: ${output.themeExtensions.backgroundColor.length}`);
console.log(`  - Font sizes: ${output.themeExtensions.fontSize.length}`);
console.log(`  - Custom screens: ${output.themeExtensions.screens.length}`);
