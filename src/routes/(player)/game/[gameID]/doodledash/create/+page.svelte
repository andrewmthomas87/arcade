<script lang="ts">
  import { enhance } from '$app/forms';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { ActionData } from './$types';
  import { delay } from '$lib/animation';

  export let form: ActionData;

  let drawTime = 120;
  let answerTime = 60;
  let guessTime = 45;

  function handleDefault() {
    drawTime = 120;
    answerTime = 60;
    guessTime = 45;
  }

  function handleSlow() {
    drawTime = 240;
    answerTime = 120;
    guessTime = 60;
  }

  function handleFast() {
    drawTime = 45;
    answerTime = 30;
    guessTime = 20;
  }
</script>

<main class="has-background-darkened-er">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Create</h1>
        <h2 class="subtitle">Setup the game</h2>

        {#if form?.error}
          <div class="notification is-danger" in:slide>{form.error}</div>
        {/if}

        <div class="block">
          <form method="POST" use:enhance>
            <p>Presets:</p>
            <div class="buttons">
              <button type="button" class="button" on:click={handleDefault}>Default</button>
              <button type="button" class="button" on:click={handleSlow}>Slow</button>
              <button type="button" class="button" on:click={handleFast}>Fast</button>
            </div>

            <div class="field">
              <label class="label" for="draw-time">Time to draw (seconds)</label>
              <div class="control">
                <input
                  id="draw-time"
                  class="input"
                  name="draw-time"
                  type="number"
                  bind:value={drawTime}
                />
              </div>
            </div>
            <div class="field">
              <label class="label" for="answer-time">Time to answer (seconds)</label>
              <div class="control">
                <input
                  id="answer-time"
                  class="input"
                  name="answer-time"
                  type="number"
                  bind:value={answerTime}
                />
              </div>
            </div>
            <div class="field">
              <label class="label" for="guess-time">Time to guess (seconds)</label>
              <div class="control">
                <input
                  id="guess-time"
                  class="input"
                  name="guess-time"
                  type="number"
                  bind:value={guessTime}
                />
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button class="button is-link" type="submit">Create</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>
