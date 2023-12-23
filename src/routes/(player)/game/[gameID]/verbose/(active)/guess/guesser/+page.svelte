<script lang="ts">
  import { enhance } from '$app/forms';
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;
</script>

<main>
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Time to guess!</h1>
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(1) }}>
      <div class="container is-max-desktop">
        <h1 class="title is-4">Clues</h1>
        <div class="content">
          {#if data.uniqueClues.length > 0}
            <ul>
              {#each data.uniqueClues as clue}
                <li>{clue.word} &middot; <span class="tag is-dark">{clue.player?.name}</span></li>
              {/each}
            </ul>
          {:else}
            <p>There's nothing here</p>
          {/if}
        </div>

        {#if data.duplicateClueCount > 0}
          <p class="block has-text-danger">
            {data.duplicateClueCount} duplicate clue{data.duplicateClueCount !== 1 ? 's' : ''} hidden
          </p>
        {/if}
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(2) }}>
      <div class="container is-max-desktop">
        {#if form?.error}
          <div class="notification is-danger" in:slide>{form.error}</div>
        {/if}

        <div class="block">
          <form action="?/guess" method="POST" use:enhance>
            <div class="field">
              <label class="label" for="guess">Guess the word based on the clues</label>
              <div class="control">
                <input id="guess" class="input" type="text" name="guess" autocomplete="off" />
              </div>
            </div>

            <div class="field">
              <div class="control">
                <button type="submit" class="button is-link">Submit</button>
              </div>
            </div>
          </form>
        </div>

        <p class="block is-size-7">
          The penalty for an incorrect guess is losing an additional round. Passing won't get you
          any points, but you won't lose a round.
        </p>

        <div class="block">
          <form action="?/pass" method="POST" use:enhance>
            <div class="field">
              <div class="control">
                <button type="submit" class="button is-link">Pass</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>
