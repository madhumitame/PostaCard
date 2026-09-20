# PostaCard — virtual postcards with real photo-inclusive share links

This version keeps the existing design and adds real persistent share links.

When a user shares a postcard, the photo is uploaded to Netlify Blobs and the postcard record stores the photo ID. The generated link contains only the postcard ID, for example `/?p=<id>`. Opening that link retrieves the postcard data and the original photo, so the recipient sees the actual uploaded picture.

### Netlify setup

Deploy this folder as a Netlify site. The project uses Netlify Functions and `@netlify/blobs` for persistent storage. No Stripe, Lob, payment, address, or physical-mail code is included.

Functions:
- `upload-image` — stores the uploaded photo
- `create-postcard` — stores message/name/photo reference and creates the postcard ID
- `postcard/:id` — retrieves postcard data
- `image/:id` — serves the stored photo

The photo is not placed in the URL, so links stay short and usable.

Review current Netlify Blobs limits/pricing for the account used to deploy the site before public launch.
