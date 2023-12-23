<script lang="ts">
  import { scale, slide } from 'svelte/transition';
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { delay } from '$lib/animation';

  export let data: PageData;
  export let form: ActionData;
</script>

<main>
  {#if data.hasSubmittedClue}
    <AnimateOnMount>
      <section class="section" in:slide={{ delay: delay(0) }}>
        <div class="container is-max-desktop">
          <h1 class="title">Submitted!</h1>
          <h2 class="subtitle">Waiting for clues from:</h2>

          <div class="tags are-large">
            {#each data.waiting as player (player.id)}
              <span class="tag is-dark" transition:scale>{player.name}</span>
            {/each}
          </div>
        </div>
      </section>
    </AnimateOnMount>
  {:else}
    <AnimateOnMount>
      <section class="section" in:slide={{ delay: delay(0) }}>
        <div class="container is-max-desktop">
          <h1 class="title">Time to give a clue!</h1>
          <h2 class="subtitle">
            <span class="has-underline is-info">{data.guesser?.name}</span> is trying to guess
            <span class="tag is-primary is-large" in:scale={{ delay: delay(1) }}>{data.word}</span>
          </h2>

          {#if form?.error}
            <div class="notification is-danger" in:slide>{form.error}</div>
          {/if}

          <div class="block">
            <form method="POST" use:enhance>
              <div class="field">
                <label class="label" for="clue">Enter a one word clue</label>
                <div class="control">
                  <input id="clue" class="input" type="text" name="clue" autocomplete="off" />
                </div>
              </div>

              <div class="field">
                <div class="control">
                  <button class="button is-link">Submit</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </AnimateOnMount>
  {/if}
</main>
