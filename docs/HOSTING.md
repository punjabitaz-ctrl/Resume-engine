# Hosting the web copy on Cloudflare Pages

Resume Engine is a static site: no server code and no database on the host. Hosting it only delivers the files. Each person's data stays in their own browser, under the hosted address, and their AI requests go straight from their browser to the provider they chose.

## One-time setup (owner, in your own Cloudflare account)

Menu names in Cloudflare move from time to time, so look around if a label differs slightly.

1. Sign in to Cloudflare and open **Workers & Pages**. Choose **Create**, then the **Pages** tab, then **Connect to Git**.
2. Allow Cloudflare to read the `punjabitaz-ctrl/Resume-engine` repository (only that repository is needed).
3. Settings for the project:
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: leave empty
   - Build output directory: `/` (the repository root)
4. Choose **Save and Deploy**. Cloudflare gives the site an address ending in `.pages.dev`.
5. Optional: under the project's **Custom domains**, add a subdomain you own.

The `_headers` file in this repository sets the security headers on every page (content policy, no framing, no referrer, microphone only for this site). Nothing else needs configuring.

## Check after the first deploy

1. Open the address in Chrome. The guided tour should start on an empty copy.
2. In the browser's developer tools, under **Network**, select the page itself and confirm the response headers include `Content-Security-Policy` and `X-Frame-Options: DENY`.
3. Open the address in a second tab. It should say the app is already open in another tab.

## Updates

Every push to `main` redeploys within a minute or two, and testers get the new version the next time they load the page. The GitHub workflow runs the full test suite on each push; Cloudflare deploys whether or not those tests pass, so check that the run on GitHub is green before telling testers to reload.

Data saved by an older version is checked and cleaned on every load, so an update does not need testers to do anything.
