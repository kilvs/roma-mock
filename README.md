# ROMA Overseas: homepage mock, redesign

Redesign of the ROMA homepage mock (17 Oct 2026), live at https://kilvs.github.io/roma-mock/. Same
copy, logo and photos as the 15 Oct mock; new look, layout, accessibility and performance. The 15 Oct
version is in this repo's history (commit b026165).

## Run it

```
python3 -m http.server 4321 --bind 127.0.0.1
```

Run it from this folder.

Then open http://localhost:4321. Plain HTML, CSS and JS: no build step.

## ROMA's comments (28 Oct 2026)

From ROMA's email ("Pls proceed with the dev"), all applied:

- Hero copy is ROMA's: "Connecting Talent Worldwide", the subline, the "People-first. Integrity-led.
  Globally minded." tagline and its line (the line hides only on 320x568-size phones, to keep the fold).
- Menu order: About, Jobs, For Employers, Contact, Apply now (header, phone menu, footer).
- US spelling "License" in everything visitors read.
- No email next to "Send a job order"; the employer accreditation steps and checklist are gone.
- Jobs heading: "Career opportunities" eyebrow, "Find your next opportunity."
- New `apply.html`: ROMA's "Take the first step." header and their application sheet as a six-step
  form (position, personal information, personal references, education, latest job, résumé and
  consent). Required: position, full name, email, mobile, résumé, privacy consent. Job cards open it
  with the role filled in. On submit it shows a reference number like `26OCT001` (year, month,
  count). In the mock the count lives in the browser and nothing is sent.



- **Type.** Headings in Source Serif 4 (display cut), echoing the Times New Roman "ROMA" wordmark;
  body and UI stay in Montserrat. One token (`--font-serif`) swaps it.
- **Big idea.** The core values band: the four initials spell R-O-M-A across the page in gold on
  deep green, like the wordmark.
- **Audience colours.** Gold means applicants (Apply now, the applicant door, View and apply),
  green means employers (the employer door, Send a job order).
- **Hero.** Bento grid replaced by headline, two doors and one photo bleeding off the right edge.
  Fits the fold at 1440x900, 1366x657, 1280x800, 768x1024, 390x844 and 360x740.
- **Jobs.** Ticket-style cards (perforated stub with the openings and the action), solid country
  tags with ISO codes, a "Showing 1 to 3 of 6" line instead of dots. Each card is one link named
  by the job title.
- **Process.** A route line from Apply to Fly that draws once on scroll (the page's only motion
  moment; off with reduced motion or without JS).
- **Employers.** "See the full document checklist" opens the MWO document list from the deck.
- **Contact.** Real Google map, dark-mode aware.
- **No glass, gradients or decorative rings** (16 Oct design system), tinted shadows, 12px semi-pill buttons.

## Checks (17 Oct 2026)

- axe-core WCAG 2.2 AA: 0 violations, light and dark, desktop and phone, menu open and closed.
- Every text element at least 5.09:1 contrast (light) and 5.44:1 (dark).
- No horizontal scroll at 320 to 1920 px.
- Lighthouse (served compressed, as on Vercel): performance 99 mobile and 100 desktop,
  accessibility 100, best practices 100. SEO 63 only because the mock is `noindex` on purpose.
- Page weight 357 KB (15 Oct mock: 1,736 KB). Photos as WebP in two or three sizes, logo SVGs
  optimised with svgo (80 KB to 34 KB, visually identical).

## Files

- `index.html`: the page. The header logo is inlined so its subline turns white in dark mode.
- `css/styles.css`: tokens first (light, then `[data-theme="dark"]`), then components and sections.
- `js/main.js`: theme toggle, header hide on scroll, burger menu, jobs row, nav highlight, route.
- `assets/img`: photos (Pexels placeholders) as WebP sizes plus the original JPGs as fallback.
- `assets/logo`: optimised copies of the rebuilt logo SVGs (originals in `Assets/Logo/`).

Placeholder content: the job listings, the photos and anything in [BRACKETS] are not final.
