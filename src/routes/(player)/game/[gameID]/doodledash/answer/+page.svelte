<script lang="ts">
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { PageData } from './$types';
  import { delay } from '$lib/animation';
  import ViewCanvas from '$lib/canvas/ViewCanvas.svelte';
  import { enhance } from '$app/forms';

  export let data: PageData;
</script>

<main class="has-background-darkened-er">
  {#if data.isMe}
    <AnimateOnMount>
      <section class="section" in:slide={{ delay: delay(0) }}>
        <div class="container is-max-desktop">
          <h1 class="title">Here's your drawing</h1>

          <div class="block canvas">
            <ViewCanvas size={128} unit={2} paths={data.activeDrawing} animationDuration={3750} />
          </div>

          <h2 class="subtitle">Sit tight until the guesses are in</h2>
        </div>
      </section>
    </AnimateOnMount>
  {:else}
    <AnimateOnMount>
      <section class="section" in:slide={{ delay: delay(0) }}>
        <div class="container is-max-desktop">
          <h1 class="title">
            Here's <span class="has-underline is-info">{data.activePlayer.name}</span>'s drawing
          </h1>

          <div class="block canvas">
            <ViewCanvas size={128} unit={2} paths={data.activeDrawing} animationDuration={3750} />
          </div>

          {#if data.submittedAnswer}
            <h2 class="subtitle">Submitted! You guessed:</h2>
            <div class="block">
              <article class="message is-light is-medium">
                <div class="message-body">{data.submittedAnswer}</div>
              </article>
            </div>
          {:else}
            <h2 class="subtitle">What did they draw?</h2>

            <div class="block">
              <form method="POST" use:enhance>
                <div class="field">
                  <label class="label" for="answer">Guess</label>
                  <div class="control">
                    <input id="answer" class="input" type="text" name="answer" autocomplete="off" />
                  </div>
                </div>
                <div class="field">
                  <div class="control">
                    <button class="button is-link" type="submit">Submit</button>
                  </div>
                </div>
              </form>
            </div>
          {/if}
        </div>
      </section>
    </AnimateOnMount>
  {/if}
</main>

<style>
  .canvas {
    max-width: 768px;
  }
</style>