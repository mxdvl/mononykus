# SSR + Hydration with Svelte & Deno

This project is an attempt at partial hydration using the Island pattern, using
Svelte and Deno as the underlying technologies.

Head to [mononykus.deno.dev](https://mononykus.deno.dev/) to see it in action.

---

**Warning**

This is a Work-in-progress. If you want a production framework, look at
[SvelteKit](https://kit.svelte.dev) or [Astro](https://astro.build/)

---

## Todo list

- [x] Compile Svelte components
- [x] Partial hydration
- [x] Create a logo
- [x] Serve assets with proper headers (mime, cache-control, etag, …)
- [ ] Add various hydration/foraging strategies
- [ ] Analyse performance (timings, comparison, web vitals, …)
- [x] Continuous deployment
- [x] Continuous integration
- [x] Use `<svete:head>` and a static template
- [ ] Benchmark building hundreds of pages
- [ ] Add motivations section (no partial hydration, SvelteKit & Deno, Snel,
      etc.)
- [x] Figure out how to build `Island.svelte` cleanly
- [x] Figure out how to serve `islands.js` cleanly
- [x] Handle nested islands
- [ ] Allow imports of `svelte/store`, `svelte/motion`, `svelte/transition`,
      `svelte/animate` and `svelte/easing`, but not `svelte/register`.

## About the name Mononykus

[Mononykus](https://en.wikipedia.org/wiki/Mononykus) is a svelte dinosaur of the
late Cretaceous. The show “Prehistoric Planet” has a scene demonstrating the use
of its large, singular claw to forage termite mounds. Mononykus was probably
covered in majestic feathers.
