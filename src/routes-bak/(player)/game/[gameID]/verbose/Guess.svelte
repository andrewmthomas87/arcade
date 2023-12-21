<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/verbose/game';
  import type { Player } from '@prisma/client';

  export let players: Player[];
  export let state: RoundState;
  export let isGuesser: boolean;

  $: guesser = players.find((p) => p.id === state.guesserID);
  $: word = state.words[state.round - 1];
  $: clues = Object.entries(state.clues[state.round - 1]).map(([id, clue]) => ({
    ...clue,
    player: players.find((p) => p.id === Number(id)),
  }));
  $: uniqueClues = clues.filter((clue) => !clue.isDuplicate);
  $: duplicateClues = clues.filter((clue) => clue.isDuplicate);
</script>

{#if isGuesser}
  <section>
    <h1>You're up</h1>
  </section>

  <section>
    <form action="?/guess" method="POST" use:enhance>
      <label for="guess">Guess the word based on the clues</label>
      <input id="guess" type="text" name="guess" autocomplete="off" />

      <button type="submit">Submit</button>
    </form>

    <form action="?/pass" method="POST" use:enhance>
      <button type="submit">Pass</button>
    </form>
  </section>

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
      <p class="duplicates">
        {duplicateClues.length} duplicate clue{duplicateClues.length !== 1 ? 's' : ''} hidden
      </p>
    {:else}
      <p>There's nothing here</p>
    {/if}
  </section>
{:else}
  <section>
    <h1>Waiting for guesser...</h1>
  </section>

  <section>
    <p>
      <span class="guesser">{guesser?.name}</span> is trying to guess<br />
      <span class="word">{word}</span>
    </p>
  </section>

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
{/if}

<style>
  section {
    margin-bottom: 1.5em;
  }

  .guesser {
    color: var(--blue700);
    font-weight: 700;
  }

  .word {
    padding: 0.25em;
    background-color: var(--cyan500);
    font-size: 2.5em;
    font-weight: 700;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .uniques {
    color: var(--blue700);
  }

  .duplicates {
    color: var(--red700);
  }
</style>
