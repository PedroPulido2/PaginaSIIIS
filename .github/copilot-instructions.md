**Repository Overview**

- **Project Type**: Vite + React 18 single-page app (SPA).
- **Entry Points**: `index.html` and `src/main.jsx` (mounts `UserProvider` + `BrowserRouter`).
- **Routing**: Routes defined in `src/App.jsx`. Route protection uses `src/components/RequireAuth.jsx` and `RequireAuthAdmin.jsx`.

**Where Logic Lives**
- **UI components**: `src/components/` (e.g. `Navbar.jsx`, `Footer.jsx`, `ProjectCard.jsx`).
- **Pages / Routes**: `src/routes/` (e.g. `Home.jsx`, `Article.jsx`, `Project.jsx`, `Profile.jsx`).
- **Auth / Context**: `src/context/UserProvider.jsx` (central user state; `user === false` means still-loading).
- **Data layer / hooks**: `src/hooks/` contains Firestore adapters (`useFirestore.js`, `useFirestoreArticles.js`, `useFirestoreProjects.js`, `useFirestoreReviews.js`). Add new Firestore logic as a hook in this folder and follow existing hook signatures.

**Integrations & External Services**
- **Firebase**: configured in `src/Firebase.js`. Uses Vite env vars `VITE_FIREBASE_*` (e.g. `VITE_FIREBASE_API_KEY`). Always read secrets from `import.meta.env` and do not hard-code keys.
- **Email**: `@emailjs/browser` is used for contact email flows.
- **Rich text editor**: TinyMCE via `@tinymce/tinymce-react` used by `src/components/Editor.jsx` and `EditorProject.jsx`.
- **Styling**: Tailwind CSS + Flowbite. Config files: `tailwind.config.js`, `postcss.config.js`, styles in `src/index.css`.

**Common Patterns & Conventions**
- Forms use `react-hook-form` with shared input components (`FormInput.jsx`, `FormInputProfile.jsx`, `FormInputEditor.jsx`) and validation helpers in `utils/FormValidate.js`.
- Centralized Firebase error mapping lives in `utils/ErrorsFirebase.js` — use it when surface errors to users.
- Firestore access is wrapped in custom hooks (see `useFirestore*.js`). Reuse those hooks instead of calling Firestore directly in components.
- Editor content is sanitized with `dompurify` before rendering.

**Build / Dev / Preview**
- Install: `npm install`
- Dev server: `npm run dev` (starts Vite)
- Production build: `npm run build`
- Preview build locally: `npm run preview`

**Important Details for Changes**
- Auth loading: `UserProvider` may set `user` to `false` while initializing — components should handle this state (see `src/App.jsx` initial loader).
- Protected routes: wrap pages with `RequireAuth` or `RequireAuthAdmin` rather than conditional checks throughout components.
- Environment vars: add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID` to a local `.env` or CI secrets. Use `import.meta.env.VITE_...`.
- Reuse existing hooks for Firestore paging/filtering to keep behavior consistent across lists and carousels (see `useFirestoreProjects.js` and `ProjectCarousel.jsx`).

**Quick File References (examples to open first)**
- `src/main.jsx` — app bootstrap (context + router)
- `src/App.jsx` — routes and layout
- `src/context/UserProvider.jsx` — auth state management
- `src/Firebase.js` — firebase initialization and `auth` export
- `src/hooks/useFirestoreProjects.js` — canonical Firestore hook pattern
- `src/components/FormInput*.jsx` and `utils/FormValidate.js` — form patterns

**What I will not assume**
- No CI or test runner detected — don’t add test frameworks without checking with maintainers.
- No README or existing agent docs found; this file is the primary starting point for AI agents.

**How to extend this guidance**
- If you add a new cross-cutting concern (new provider, logger, i18n), place initialization in `src/main.jsx` and document it here.

If anything above is unclear or you'd like more examples (component-level patterns, data hook signatures, or environment examples), tell me which area to expand.
