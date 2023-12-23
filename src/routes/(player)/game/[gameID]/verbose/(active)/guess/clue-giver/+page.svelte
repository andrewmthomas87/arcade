<script lang="ts">
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<main>
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Sit tight</h1>
        <h2 class="subtitle">
          <span class="has-underline is-info">{data.guesser?.name}</span> is trying to guess
          <span class="tag is-primary is-large">{data.word}</span>
        </h2>
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

        {#if data.duplicateClues.length > 0}
          <p class="block has-text-danger">
            {data.duplicateClues.length} duplicate clue{data.duplicateClues.length !== 1 ? 's' : ''}
            hidden
          </p>

          <div class="content">
            <ul>
              {#each data.duplicateClues as clue}
                <li>
                  <span class="has-text-danger">{clue.word}</span> &middot;
                  <span class="tag is-dark">{clue.player?.name}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </section>
  </AnimateOnMount>
</main>
