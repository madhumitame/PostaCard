# PostaCard — Virtual

A completely virtual, free version of PostaCard.

## Included
- Message editor
- Photo upload (up to 5MB)
- Front/back postcard preview
- Email sharing
- Copy share link
- Native device sharing
- Download postcard as PNG
- About section
- Mobile/iPad friendly layout

## Deploy on Netlify

Upload this folder to a GitHub repository and connect it to Netlify, or drag the folder into Netlify's deploy workflow.

No environment variables or server functions are required.

## Important note about share links

The app deliberately does not put a photo into the URL. Large image data makes links unreliable and can exceed browser/server URL limits.

The copied link preserves the message and sender name. The photo remains available on the device that created it. For a photo-inclusive postcard, use Download or the device Share option.

If you later want permanent photo-inclusive public links, add a small image/object-storage backend (for example Netlify Blobs or another storage provider).
