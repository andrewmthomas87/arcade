<script lang="ts">
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { PageData } from './$types';
  import type { Drawing } from '$lib/games/doodledash/game';
  import { enhance } from '$app/forms';
  import ViewCanvas from '$lib/canvas/ViewCanvas.svelte';
  import CanvasAndControls from '$lib/canvas/CanvasAndControls.svelte';

  export let data: PageData;

  let drawing: Drawing = [];
</script>

<main class="has-background-darkened-er">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Time to draw!</h1>
        <h2 class="subtitle">Your prompt is:</h2>
        <div class="block">
          <article class="message is-info is-medium">
            <div class="message-body">{data.prompt}</div>
          </article>
        </div>

        {#if data.submittedDrawing}
          <h2 class="subtitle">Submitted! Here's what you drew:</h2>
          <div class="block canvas">
            <ViewCanvas
              size={128}
              unit={2}
              paths={data.submittedDrawing}
              animationDuration={3750}
            />
          </div>
        {:else}
          <div class="block canvas">
            <CanvasAndControls size={128} unit={2} bind:paths={drawing} />
          </div>

          <div class="block">
            <form method="POST" use:enhance>
              <input type="hidden" name="drawing" value={JSON.stringify(drawing)} />

              <button class="button is-link" type="submit">Submit</button>
            </form>
          </div>
        {/if}
      </div>
    </section>
  </AnimateOnMount>
</main>

<style>
  .canvas {
    max-width: 768px;
  }
</style>
