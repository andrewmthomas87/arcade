<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { LayoutData } from './$types';
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';

  export let data: LayoutData;
</script>

{#if data.status}
  <AnimateOnMount>
    <section class="hero is-small" in:fade={{ delay: delay(0) }}>
      <div class="hero-body">
        <div class="container is-max-desktop">
          <p class="is-size-7">
            Score: {data.status.score} &middot; Round: {data.status.round + 1} &middot; Remaining rounds:
            {data.status.remainingRounds}
          </p>
        </div>
      </div>
    </section>
  </AnimateOnMount>
{/if}

<slot />
