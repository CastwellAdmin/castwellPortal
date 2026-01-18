# Images Directory

## Required Files:

### Logo Files:
- `logo-light.png` - Light version of Castwell logo (for dark backgrounds)
- `logo-dark.png` - Dark version of Castwell logo (for light backgrounds)

Recommended size: 200-400px width, transparent background (PNG format)

### Favicon:
- `favicon.ico` - 32x32 or 16x16 icon for browser tab
- OR `favicon.png` - PNG version of favicon

## How to Add Your Files:

1. Place your logo files in this directory (`/public/images/`)
2. Name them exactly as shown above
3. Push to GitHub and Netlify will deploy automatically

## Usage in Code:

The Logo component (`src/components/shared/Logo.tsx`) references:
- `/images/logo-light.png`
- `/images/logo-dark.png`

The favicon is referenced in `index.html`
