# A Step Above Day Care Academy — Website

A modern **demo redesign** of the website for *A Step Above Day Care Academy*, a childcare provider in Cleveland, Ohio. The site presents the daycare's programs (infant to school-age plus summer camp), enrollment flow, safety practices, meals, transportation, and family communication.

It is a **static website** — plain HTML, CSS, and vanilla JavaScript, with **no frameworks, no build step, and no external dependencies**. Just open the files in a browser or serve the folder.

> ⚠️ **Demo content notice.** Phone numbers, addresses, reviews, and some claims (e.g. transportation) are placeholders marked *"verify"* in the markup. Review and replace them before any production launch.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | [index.html](index.html) | Hero, highlights, programs overview, calls to action |
| Programs | [programs.html](programs.html) | Age-group programs and sample daily schedule |
| Enrollment | [enrollment.html](enrollment.html) | Enrollment steps and tour-request form |
| Safety | [safety.html](safety.html) | Safety policies and practices |
| Meals & Transportation | [meals-transportation.html](meals-transportation.html) | Meal program and transportation info |
| Reviews | [reviews.html](reviews.html) | Parent testimonials |
| Contact | [contact.html](contact.html) | Contact details and form |
| Privacy | [privacy.html](privacy.html) | Privacy policy |

## Project structure

```
.
├── *.html                  # One file per page (see table above)
├── assets/
│   ├── css/styles.css      # All styles ("Playful Kid Theme"), design tokens, responsive rules
│   ├── js/site.js          # Vanilla JS: mobile menu, nav, scroll reveal, accordion, tabs, form validation
│   └── img/                # Photos used across the site
├── deploy/
│   ├── docker-compose.yml  # nginx:alpine container serving the site
│   └── nginx.conf          # nginx server config (gzip, caching, security headers)
├── .htaccess               # Apache hosting config (alternative to nginx)
├── robots.txt              # Crawler directives
├── sitemap.xml             # XML sitemap
└── readme.md
```

## Running locally

No build tools are required. Pick whichever is easiest:

**Open directly**

```bash
# Just open index.html in your browser
xdg-open index.html      # Linux
open index.html          # macOS
```

**Serve with a local HTTP server** (recommended, so relative paths and the form behave correctly)

```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000

# or Node
npx serve .
```

## Deployment

### Option A — Docker + nginx

Serves the repository folder read-only through `nginx:alpine`. Expects an external Docker network named `npm-net` (e.g. an existing Nginx Proxy Manager setup).

```bash
docker compose -f deploy/docker-compose.yml up -d
```

The container mounts `/opt/daycare` as the web root and `deploy/nginx.conf` as its config. The nginx config adds gzip, asset caching, security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), and blocks access to `/deploy/` and dotfiles.

### Option B — Apache

Upload the files to an Apache web root. [.htaccess](.htaccess) provides compression, cache headers, and security headers, all wrapped in `<IfModule>` guards so the site keeps working if a module is missing. **Apache only** — it does not apply to nginx, Netlify, Vercel, Cloudflare Pages, or GitHub Pages.

### Option C — Static host

Because it is a plain static site, you can also drop the files onto any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, etc.) without the server configs above.

## Before going live

- [ ] Replace placeholder phone numbers, address, and contact details (search the markup for `verify` / `placeholder`).
- [ ] Confirm or remove the transportation claims.
- [ ] Swap demo/stock images in `assets/img/` for real photos.
- [ ] Update `og:image` and other Open Graph/Twitter metadata in the page `<head>`s.
- [ ] Update the canonical domain in `sitemap.xml`, `robots.txt`, and `og:url` (currently `daycare.perinet.org`).
- [ ] Wire the contact/tour forms to a real backend or form service (current validation is front-end only).

## Tech notes

- **No frameworks / no fonts fetched** — uses system fonts and inline SVG (the bee favicon) to avoid external requests.
- **Accessibility** — skip link, ARIA-based accordion/tabs/nav, `aria-live` form feedback, and reduced-motion support.
- **Browser support** — modern evergreen browsers; uses `IntersectionObserver` for scroll reveal.
