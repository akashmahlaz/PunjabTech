To use arbitrary font classes like font-['Oswald'] in Tailwind CSS, import the font in your CSS or HTML and wrap multi-word font names in quotes and underscores. Single-word names work directly inside square brackets, while spaces must be replaced with underscores (_) so Tailwind compiles the CSS class properly.
Here is a ready-to-use list of top Google Fonts formatted specifically for Tailwind arbitrary classes.

Modern Sans-Serif (Clean & UI)

• font-['Inter'] — Crisp, ultra-readable UI standard.
• font-['Poppins'] — Geometric and friendly for headings.
• font-['Montserrat'] — Bold and modern for hero sections.
• font-['DM_Sans'] — Clean and minimalist at small sizes.
• font-['Plus_Jakarta_Sans'] — Sleek, contemporary SaaS aesthetic.
• font-['Space_Grotesk'] — Tech-forward with subtle quirky details.

Editorial & Classy Serifs

• font-['Playfair_Display'] — High-contrast luxury look for titles.
• font-['Lora'] — Balanced and warm for blog posts and articles.
• font-['Cinzel'] — Classic, sharp Roman-inspired display serif.
• font-['Merriweather'] — Sturdy and easy to read on screens.

Bold Display & Creative

• font-['Oswald'] — Tall, condensed, and punchy for banners.
• font-['Bebas_Neue'] — All-caps impact font for posters and headers.
• font-['Syne'] — Artistic, wide, and avant-garde for creative portfolios.
• font-['Pacifico'] — Smooth, retro brush script for accent text.

Monospace & Tech

• font-['JetBrains_Mono'] — Sharp and legible for code blocks.
• font-['Fira_Code'] — Popular developer font with clean proportions.

Quick Setup Guide

1. Import the fonts in your main CSS file
Paste the Google Fonts @import at the top of your index.css or globals.css before Tailwind's directives:
css
@import url('https://googleapis.com');

@import "tailwindcss";
Use code with caution.
2. Apply them in your HTML/JSX
Use single quotes inside the square brackets for reliable compilation across Tailwind v3 and v4:
html
<h1 class="font-['Oswald'] text-5xl uppercase tracking-wide">
  Bold Headline
</h1>

<h2 class="font-['Playfair_Display'] text-3xl italic">
  Elegant Subheading
</h2>

<p class="font-['Inter'] text-base text-gray-600">
  Clean, readable body text for your layout.
</p>
Use code with caution.
Pro Tip: If you use a font across your entire site, register it as a utility theme variable (e.g., --font-oswald: "Oswald", sans-serif; in Tailwind v4's @theme block) so you can write font-oswald with automatic fallback fonts included.
If you'd like help setting up reusable theme classes instead of arbitrary brackets, tell me:
• Are you using Tailwind v3 (tailwind.config.js) or Tailwind v4 (@theme in CSS)?
• Which two or three fonts from the list do you want to pair together?
