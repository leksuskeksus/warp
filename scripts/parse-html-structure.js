const fs = require('fs');
const path = require('path');

// Read the reference HTML
const html = fs.readFileSync(path.join(__dirname, '../reference.html'), 'utf-8');

// Helper to extract meaningful content from a node
function cleanText(text) {
  return text.trim().replace(/\s+/g, ' ');
}

// Extract the body content (between <body> and </body>)
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
if (!bodyMatch) {
  console.error('Could not find body tag');
  process.exit(1);
}

const bodyContent = bodyMatch[1];

// Find the main app container
const mainContainerMatch = bodyContent.match(/<div class="scrollbar-hide bg-bg[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/body>/);

if (!mainContainerMatch) {
  console.error('Could not find main container');
  process.exit(1);
}

// Parse main sections by looking for key structural divs
const sections = {
  sidebar: null,
  mainContent: null,
  testimonial: null,
};

// Extract sidebar (max-tablet:hidden sticky...)
const sidebarMatch = bodyContent.match(/<div class="max-tablet:hidden sticky[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="bg-bg border-border/);
if (sidebarMatch) {
  sections.sidebar = sidebarMatch[1];
}

// Extract main content area
const mainContentMatch = bodyContent.match(/<div class="bg-bg border-border relative[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/);
if (mainContentMatch) {
  sections.mainContent = mainContentMatch[1];
}

// Parse sidebar structure
let sidebarStructure = { logo: null, userProfile: null, footer: null };
if (sections.sidebar) {
  // Logo
  const logoMatch = sections.sidebar.match(/<img[^>]*alt="Warp logo"[^>]*>/);
  if (logoMatch) {
    sidebarStructure.logo = logoMatch[0];
  }

  // User profile
  const profileMatch = sections.sidebar.match(/<div class="flex items-center gap-\[7px\]">([\s\S]*?)<\/div>\s*<div class="text-caption text-fg3/);
  if (profileMatch) {
    sidebarStructure.userProfile = profileMatch[0];
  }

  // Footer links
  const footerMatch = sections.sidebar.match(/<div class="text-caption text-fg3[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<div class="bg-bg/);
  if (footerMatch) {
    sidebarStructure.footer = footerMatch[0];
  }
}

// Extract all h1 elements
const h1Matches = [...bodyContent.matchAll(/<h1[^>]*>(.*?)<\/h1>/g)];

// Extract form structure
const formSections = [];
const formMatch = bodyContent.match(/<div class="group\/checkout[^"]*"[^>]*>([\s\S]*?)<\/section>/);
if (formMatch) {
  const formContent = formMatch[1];

  // Extract each pricing row
  const pricingRows = [...formContent.matchAll(/<div class="flex gap-\[10px\]">([\s\S]*?)<\/div>/g)];

  // Extract inputs
  const inputs = [...formContent.matchAll(/<input[^>]*>/g)];

  formSections.push({
    pricingRows: pricingRows.length,
    inputs: inputs.map(m => {
      const match = m[0];
      const typeMatch = match.match(/type="([^"]*)"/);
      const placeholderMatch = match.match(/placeholder="([^"]*)"/);
      return {
        type: typeMatch ? typeMatch[1] : 'text',
        placeholder: placeholderMatch ? placeholderMatch[1] : '',
        classes: match.match(/class="([^"]*)"/)?.[1] || '',
      };
    }),
  });
}

// Find the features sidebar (bg-bg2)
const featuresSidebarMatch = bodyContent.match(/<aside class="basis-1\/3 bg-bg2[^"]*"[^>]*>([\s\S]*?)<\/aside>/);
let featuresStructure = null;
if (featuresSidebarMatch) {
  const content = featuresSidebarMatch[1];
  const features = [...content.matchAll(/<span class="text-body-2[^"]*"[^>]*>(.*?)<\/span>/g)].map(m => m[1]);
  const otherFeatures = [...content.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map(m => m[1]);

  featuresStructure = {
    includedFeatures: features,
    otherFeatures: otherFeatures,
  };
}

// Look for testimonial section
const testimonialMatch = bodyContent.match(/<div class="max-laptop:hidden[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/);
let testimonialStructure = null;
if (testimonialMatch) {
  const content = testimonialMatch[1];
  const quoteMatch = content.match(/<p class="text-h4[^"]*"[^>]*>(.*?)<\/p>/);
  const nameMatch = content.match(/<div class="text-caption font-semibold[^"]*"[^>]*>(.*?)<\/div>/);
  const titleMatch = content.match(/<div class="text-tag text-fg3"[^>]*>(.*?)<\/div>/);

  if (quoteMatch || nameMatch) {
    testimonialStructure = {
      quote: quoteMatch ? quoteMatch[1] : null,
      name: nameMatch ? nameMatch[1] : null,
      title: titleMatch ? titleMatch[1] : null,
    };
  }
}

// Look for payment section
const paymentMatch = bodyContent.match(/<div class="StripeElement">([\s\S]*?)<\/div>/);
const paymentExists = !!paymentMatch;

// Extract button text
const buttonMatches = [...bodyContent.matchAll(/<button[^>]*data-slot="button"[^>]*>(.*?)<\/button>/g)];

// Build comprehensive structure report
const structure = {
  layout: {
    hasSidebar: !!sections.sidebar,
    hasMainContent: !!sections.mainContent,
    hasTestimonial: !!testimonialStructure,
    columns: [
      sections.sidebar ? 'sidebar' : null,
      sections.mainContent ? 'main' : null,
      testimonialStructure ? 'testimonial' : null,
    ].filter(Boolean),
  },
  sidebar: sidebarStructure,
  mainContent: {
    heading: h1Matches.map(m => cleanText(m[1])),
    formSections: formSections,
    hasPaymentSection: paymentExists,
    buttons: buttonMatches.map(m => cleanText(m[1])),
  },
  features: featuresStructure,
  testimonial: testimonialStructure,
};

// Find key text content
const allText = [];
const textMatches = [
  ...bodyContent.matchAll(/<h1[^>]*>(.*?)<\/h1>/g),
  ...bodyContent.matchAll(/<span class="flex-1"[^>]*>(.*?)<\/span>/g),
  ...bodyContent.matchAll(/<label[^>]*>(.*?)<\/label>/g),
];

textMatches.forEach(m => {
  const text = cleanText(m[1]);
  if (text && text.length > 0 && !text.includes('<')) {
    allText.push(text);
  }
});

structure.textContent = [...new Set(allText)].slice(0, 30);

// Extract the complete checkout section HTML for reference
const checkoutSectionMatch = bodyContent.match(/<div class="flex gap-\[50px\] max-tablet:flex-col">([\s\S]*?)<\/div>\s*<div class="h-\[1px\] bg-divider"><\/div>/);
if (checkoutSectionMatch) {
  structure.checkoutSectionHTML = checkoutSectionMatch[0].substring(0, 2000) + '...'; // First 2000 chars
}

// Output the analysis
const outputPath = path.join(__dirname, '../analysis/html-structure.json');
fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));

console.log('✅ HTML structure analysis complete!');
console.log(`\n📐 Layout: ${structure.layout.columns.join(' + ')}`);
console.log(`\n📊 Sections found:`);
console.log(`  - Sidebar: ${structure.layout.hasSidebar ? '✓' : '✗'}`);
console.log(`  - Main content: ${structure.layout.hasMainContent ? '✓' : '✗'}`);
console.log(`  - Testimonial: ${structure.layout.hasTestimonial ? '✓' : '✗'}`);
console.log(`  - Payment form: ${structure.mainContent.hasPaymentSection ? '✓' : '✗'}`);

if (structure.sidebar.logo) {
  console.log(`\n🎨 Sidebar:`);
  console.log(`  - Logo: Found`);
  console.log(`  - User profile: ${structure.sidebar.userProfile ? 'Found' : 'Missing'}`);
}

if (structure.features) {
  console.log(`\n⭐ Features:`);
  console.log(`  - Included: ${structure.features.includedFeatures.length} items`);
  console.log(`  - Other: ${structure.features.otherFeatures.length} items`);
}

if (structure.testimonial) {
  console.log(`\n💬 Testimonial:`);
  console.log(`  - Quote: ${structure.testimonial.quote ? 'Found' : 'Missing'}`);
  console.log(`  - Author: ${structure.testimonial.name || 'Unknown'}`);
}

console.log(`\n📝 Results saved to: ${outputPath}`);
