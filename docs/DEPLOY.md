# Putting Tumbuh online (GitHub + Vercel + Firebase)

The same set-up as Veyra. GitHub holds the code, Vercel hosts the app (every push to `main` updates it),
Firebase gives parents an account so every child's data is backed up and the same on all their phones.

| What | Cost | Where |
|---|---|---|
| GitHub repo (`mickeymouseaaco-cmyk/tumbuh`) | free | github.com — already done |
| Vercel (hosts the app) | free (Hobby) | vercel.com — already done |
| Firebase project (sign-in + cloud data) | free (Spark plan is enough) | console.firebase.google.com |

Without Firebase the app still works fully; data just stays on that phone and the cloud button is hidden.

---

## 1. Create the Firebase project

1. console.firebase.google.com → **Add project** → name it `tumbuh` (Google Analytics: off is fine).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
3. **Build → Firestore Database → Create database** → **Production mode** → location **`asia-southeast1` (Singapore)**.
   This can't be changed later.
4. Firestore → **Rules** tab → replace everything with [`firebase/firestore.rules`](../firebase/firestore.rules) → **Publish**.
5. **Project settings (⚙️) → General → Your apps → Web (`</>`)** → nickname `tumbuh-web` → **Register app**
   (no Hosting). Copy the `const firebaseConfig = { … };` snippet it shows.

## 2. Give Vercel the Firebase settings

1. vercel.com → project **tumbuh** → **Settings → Environment Variables** → add (all environments):

   | Name | Value |
   |---|---|
   | `FIREBASE_CONFIG` | the whole snippet from step 1.5, pasted as is |

2. **Deployments → ⋯ on the latest → Redeploy.**
3. Check `https://tumbuh-phi.vercel.app/api/config` — `firebase` should no longer be `null`.

## 3. Allow the Vercel address in Firebase

Firebase → **Authentication → Settings → Authorized domains → Add domain** → `tumbuh-phi.vercel.app`
(and your own domain if you add one later).

## 4. Make your account

Open the app → tap the **cloud** button at the top → **Daftar** (create account).
Everything already on this phone is uploaded to your account.

## 5. Other phones

Open the app on the other phone → **Sudah ada akaun? Log masuk** on the welcome screen (or the cloud button)
→ sign in. All the children come down. Changes on one phone show on the other within seconds.

If a phone already has its own data when you sign in, the app asks which copy to keep.

## 6. Optional: GitHub uploads the rules for you

`.github/workflows/firebase.yml` tests the rules on every change and, once set up, uploads them to Firebase.

1. Google Cloud console (same project) → **IAM & Admin → Service accounts → Create service account**
   → name `github-deploy` → role **Firebase Rules Admin** → Done.
2. Open it → **Keys → Add key → JSON** → download.
3. GitHub repo → **Settings → Secrets and variables → Actions**:
   - **Secrets** → New: `FIREBASE_SERVICE_ACCOUNT` = the whole JSON file.
   - **Variables** → New: `FIREBASE_PROJECT_ID` = your project ID (Firebase → Project settings).
4. GitHub → **Actions → Firebase rules → Run workflow.** Step 2 should say the rules deployed.

Delete the downloaded JSON file afterwards.

---

### What is stored

One document per parent: `users/{uid}` = `{ json, updated }` — every child's name, age, gender, teeth,
routine ticks, fluoride dates, Learn progress, brushing times and language. Only that parent can read
or change it (see the rules). The temporary Masalah/Belajar editing tools are not synced.

### If something goes wrong

- **No cloud button:** `FIREBASE_CONFIG` is missing or wrong in Vercel. Fix it and redeploy (step 2).
- **Sign-in says "Ada masalah":** Email/Password isn't enabled (1.2) or the domain isn't authorised (3).
- **Cloud shows a yellow dot / data doesn't save:** the Firestore rules weren't published (1.4) or the
  database wasn't created (1.3).
- **404: NOT_FOUND on the site:** the build didn't produce `dist/` (open the Vercel build log), or the Output
  Directory was overridden in Vercel → Settings → Build & Development. Clear the override (`vercel.json` sets it).
- **Old version still showing on the phone:** close the app fully and open it again (maybe twice).

### Re-creating the Vercel project from scratch

vercel.com → **Add New → Project** → import **tumbuh** → Framework Preset **Other**, leave Build/Output/Install
empty so `vercel.json` is used → add `FIREBASE_CONFIG` (step 2) → **Deploy**.
