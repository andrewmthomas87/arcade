<script>
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
</script>

<main class="has-background-darkened-er">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Sit tight</h1>
        <h2 class="subtitle">Generating prompts...</h2>

        <progress class="progress is-link" max="100">Loading...</progress>
      </div>
    </section>
  </AnimateOnMount>
</main>
