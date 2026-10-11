# AGENTS.md

Notes for AI coding agents working in this repo.

- This is the NeonKit docs site (Next.js 16, React 19, Tailwind 4) and the component registry it publishes.
- Components live in `src/components/ui/<slug>.tsx`. Each one is copied into user projects, so follow every rule in [CONTRIBUTING.md](./CONTRIBUTING.md): only the declared imports, color through `--neon`, classes that compile on Tailwind 3.4 and 4, no site theme tokens.
- Registering a component means an entry in `src/registry/registry.json`, docs in `src/registry/docs/<slug>.tsx`, examples in `src/registry/examples/<slug>/`, and a line in `src/registry/docs/index.ts`.
- Before you finish: `npm run type-check && npm run lint && npm test && npm run build`. The build fails if a component imports something its registry entry doesn't list.

Using NeonKit in another project? Read https://get-neonkit.vercel.app/llms.txt instead.
