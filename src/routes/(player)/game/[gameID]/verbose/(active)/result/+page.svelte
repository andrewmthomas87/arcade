<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import { delay } from '$lib/animation';

  const SCORE_LABELS = {
    1: 'Distant guess',
    2: 'Vague similarity',
    3: 'Moderate resemblance',
    4: 'Broadly accurate',
    5: 'Significantly close',
  } as Record<number, string>;

  export let data: PageData;
  export let form: ActionData;
</script>

<main>
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        {#if data.guess.isCorrect}
          <h1 class="title">Wooooooo!</h1>
        {:else if data.guess.score > 0}
          <h1 class="title">So near, yet so far</h1>
        {:else}
          <h1 class="title">Womp womp...</h1>
        {/if}

        <h2 class="subtitle">
          <span class="has-underline is-info">{data.guesser?.name}</span>
          {#if data.guess.word === null}passed{:else}guessed <span
              class="tag is-large {data.guess.isCorrect
                ? 'is-success'
                : data.guess.score > 0
                ? 'is-warning'
                : 'is-danger'}">{data.guess.word}</span
            >{/if}
        </h2>

        <p class="block">
          {#if data.guess.word === null}0 points{:else if data.guess.isCorrect}<span
              class="has-underline is-success">Correct</span
            >!
            {data.guess.score} points!{:else if data.guess.score > 0}<span
              class="has-underline is-warning">{SCORE_LABELS[data.guess.score]}</span
            >. {data.guess.score} point{data.guess.score !== 1 ? 's' : ''}!{:else}<span
              class="has-underline is-danger">Incorrect</span
            >. 0 points aaannd you lose a round...{/if}
        </p>

        {#if !data.guess.isCorrect}
          <p class="block">
            The word was <span class="tag is-primary is-large">{data.word}</span>
          </p>
        {/if}
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
            <span class="has-underline is-danger">{data.duplicateClues.length}</span> duplicate clue{data
              .duplicateClues.length !== 1
              ? 's'
              : ''}
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

    <section class="section" in:slide={{ delay: delay(2) }}>
      <div class="container is-max-desktop">
        {#if form?.error}
          <div class="notification is-danger" in:slide>{form.error}</div>
        {/if}

        <div class="block">
          <form method="POST" use:enhance>
            <div class="field">
              <div class="control">
                <button type="submit" class="button is-link">Continue</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>
