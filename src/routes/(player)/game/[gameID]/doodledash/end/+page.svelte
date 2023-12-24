<script lang="ts">
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import { enhance } from '$app/forms';
</script>

<main class="has-background-darkened-er">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Game over</h1>
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(1) }}>
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
