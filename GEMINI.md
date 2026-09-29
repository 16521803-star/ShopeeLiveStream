# Project Rules & Session Memory Directives

## 🧠 Session Memory Rule (`session.md`)
1. **Always Read `session.md` First**:
   At the beginning of any task or debugging session, read `session.md` in the project root to understand the overall architecture, recent code changes, cross-tab sync mechanisms, and active guidelines.

2. **Always Keep `session.md` Updated**:
   After modifying, refactoring, fixing bugs, or adding new features to the codebase, update `session.md` to record:
   - Summary of code changes made.
   - Any new bugs fixed or optimizations added.
   - Updated architecture or state management details if applicable.

3. **Keep `session.md` Local**:
   Do NOT remove `session.md` from `.gitignore`. It must remain local to this machine/repository.

---

## 🛠️ Codebase Guidelines
- **Build Verification**: Always run `cmd /c npm run build` before claiming completion or pushing commits to verify that there are no bundling or syntax errors.
- **Cross-Tab Synchronization**: Any changes affecting products, scripts, or video sources must be synced to the OBS overlay tab (`?obs=true`) via `studioSyncChannel` (BroadcastChannel).
- **IndexedDB for Videos**: Videos must be cached in `videoCacheDB` (IndexedDB) as Blobs, using `idb:` reference flags in localStorage/catalog objects to avoid heavy base64 data transfer over BroadcastChannel.
