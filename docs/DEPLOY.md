# Putting Tumbuh online (Vercel)

Same setup as KiTA. `vercel.json` already tells Vercel how to build the site:
install with `npm install`, build with `npx expo export --platform web --output-dir dist`,
serve the `dist` folder, and send every page to `index.html`.

1. On vercel.com, **Add New → Project**, find **tumbuh** in the GitHub list and click **Import**.
   (If it isn't listed: **Adjust GitHub App Permissions** and allow the `tumbuh` repo.)
2. **Framework Preset: Other.** Leave Build Command, Output Directory and Install Command
   empty / not overridden, so `vercel.json` is used.
3. No environment variables are needed.
4. Click **Deploy**. You get a link like `tumbuh-xxxx.vercel.app`.
5. Open it on your phone and **Add to Home Screen** (iPhone: Safari → Share; Android: Chrome → ⋮).

Every push to `main` on GitHub redeploys automatically.

## If something goes wrong

- **404: NOT_FOUND** — the build didn't produce `dist/` (open the build log), or the Output
  Directory was overridden in Vercel → Settings → Build & Development. Clear the override.
- **Build fails at `npm install`** — check the log for the package name, and tell Claude the error.
- **Old version still showing on the phone** — close the app fully and open it again (the service
  worker fetches the new version first, then shows it).

## Custom name (optional)

Vercel → Project → Settings → **Domains** → add e.g. `tumbuh.vercel.app` if it's free, or your own domain.
