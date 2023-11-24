<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/verbose/game';
  import type { Player } from '@prisma/client';

  export let players: Player[];
  export let state: RoundState;

  $: guesser = players.find((p) => p.id === state.guesserID);
  $: word = state.words[state.round - 1];
  $: clues = Object.entries(state.clues[state.round - 1]).map(([id, clue]) => ({
    ...clue,
    player: players.find((p) => p.id === Number(id)),
  }));
  $: uniqueClues = clues.filter((clue) => !clue.isDuplicate);
  $: duplicateClues = clues.filter((clue) => clue.isDuplicate);
  $: guess = state.guesses[state.round - 1];
</script>

<section>
  {#if guess.isCorrect}
    <h1>Wooooooo!</h1>
  {:else}
    <h1>Womp womp...</h1>
  {/if}
</section>

<section>
  <p>
    <span class="guesser">{guesser?.name}</span>
    {#if guess.word === null}
      passed
    {:else}
      guessed<br />
      <span class={`guess ${guess.isCorrect ? 'correct' : 'incorrect'}`}>{guess.word}</span><br />
      {#if guess.isCorrect}
        Correct!
      {:else}
        Incorrect
      {/if}
    {/if}
  </p>
</section>

{#if !guess.isCorrect}
  <section>
    <p>The word was</p>
    <div><span class="word">{word}</span></div>
  </section>
{/if}

<section>
  <h2>unique clues</h2>
  {#if uniqueClues.length > 0}
    <ul class="uniques">
      {#each uniqueClues as clue}
        <li>{clue.word} &middot; {clue.player?.name}</li>
      {/each}
    </ul>
  {:else}
    <p>There's nothing here</p>
  {/if}
</section>

<section>
  <h2>duplicate clues</h2>
  {#if duplicateClues.length > 0}
    <ul class="duplicates">
      {#each duplicateClues as clue}
        <li>{clue.word} &middot; {clue.player?.name}</li>
      {/each}
    </ul>
  {:else}
    <p>There's nothing here</p>
  {/if}
</section>

<section>
  <form action="?/continue" method="POST" use:enhance>
    <button type="submit">Continue</button>
  </form>
</section>

<style>
  section {
    margin-bottom: 1.5em;
  }

  .guesser {
    color: var(--blue700);
    font-weight: 700;
  }

  .guess {
    padding: 0.25em;
    font-size: 2.5em;
    font-weight: 700;
  }

  .guess.correct {
    background-color: var(--green500);
  }

  .guess.incorrect {
    background-color: var(--red500);
  }

  .word {
    padding: 0.25em;
    background-color: var(--cyan500);
    font-size: 2.5em;
    font-weight: 700;
  }

  .uniques {
    color: var(--blue700);
  }

  .duplicates {
    color: var(--red700);
  }
</style>
