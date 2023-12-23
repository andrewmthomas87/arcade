<script lang="ts">
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { scale, slide } from 'svelte/transition';
  import type { PageData } from './$types';
  import { delay } from '$lib/animation';

  export let data: PageData;
</script>

<main>
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Sit tight</h1>
        <h2 class="subtitle">Waiting for clues from:</h2>

        <div class="tags are-large">
          {#each data.waiting as player (player.id)}
            <span class="tag is-dark" transition:scale>{player.name}</span>
          {/each}
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>
