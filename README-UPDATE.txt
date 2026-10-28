KINGS: bring the repo up to date with the server code
=====================================================
This zip holds ONLY the files that are new or changed on the server.
Folder layout = repo layout (kings-main/).

1) Unzip this over your repo folder, say "yes" to replace files.
2) Do NOT touch package.json, package-lock.json or src/routes/api/login.ts (see notes).
3) In the repo folder:
     npm run typecheck
     npm run dev        (check home page, /financing, /curator, /curator/quick-add)
4) git add -A && git commit -m "Sync with server: financing, quick add, edit vehicle, realistic Earth map" && git push

NOTES
- src/components/globe-map.tsx is the NEW realistic Earth (not the dotted one that was on the server).
  Put the same file on the server too, so both are identical.
- The dotted-globe leftovers (src/data/globe-data.ts, scripts/make-globe-data.mjs, src/types/world-atlas.d.ts,
  and the d3-geo / topojson-client / world-atlas packages) are NOT needed any more. Leave them out of the repo.
- login.ts: the server version removed the NODE_ENV==="production" check on the login cookie. That was a
  server-only change. Keep the repo's login.ts.
- public/videos exists only in the repo. Keep it.
- Never commit: .vercel, .tanstack, .output, *.bak files, node_modules.
