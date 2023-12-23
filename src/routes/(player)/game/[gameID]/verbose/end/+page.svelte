<script lang="ts">
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';

  export let data: PageData;
</script>

<main>
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Game over</h1>
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(1) }}>
      <div class="container is-max-desktop">
        <h2 class="subtitle">Final score:</h2>
        <p class="is-size-1">{data.status?.score}</p>
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(2) }}>
      <div class="container is-max-desktop">
        <div class="block">
          <form action="?/play-again" method="POST" use:enhance>
            <div class="field">
              <div class="control">
                <button type="submit" class="button is-link">Play again</button>
              </div>
            </div>
          </form>
        </div>
        <div class="block">
          <form action="?/lobby" method="POST" use:enhance>
            <div class="field">
              <div class="control">
                <button type="submit" class="button is-link">Back to lobby</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>
