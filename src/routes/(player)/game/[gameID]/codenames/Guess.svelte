<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/codenames/game';
  import Board from './Board.svelte';

  export let state: RoundState;
  export let team: 'blue' | 'red';
  export let isClueGiver: boolean;

  if (state.step !== 'guess') {
    throw new Error('expected guess step');
  }

  $: isActiveGuesser = state.turn === team && !isClueGiver;
  $: clue =
    state.turn === 'blue' ? state.blueClues[state.round - 1] : state.redClues[state.round - 1];
  $: uncoveredCards = state.board.flatMap((row, y) =>
    row.map((card, x) => ({ card, x, y })).filter((_, x) => !state.covered[y][x]),
  );
</script>

{#if isActiveGuesser}
  <h1>You're up</h1>
{:else}
  <h1>Waiting for {state.turn} guess</h1>
{/if}

<p>
  Clue: {clue.word}
  {#if clue.count !== null}
    ({clue.count})
  {/if}
</p>

{#if isActiveGuesser}
  <form action="?/guess" method="POST" use:enhance>
    <label for="guess">Guess</label>
    <select id="guess" name="guess" value="empty">
      <option value="empty" disabled>Select a word</option>
      {#each uncoveredCards as { card, x, y }}
        <option value={`${x},${y}`}>{card.word}</option>
      {/each}
    </select>

    <button type="submit">Submit</button>
  </form>

  <form action="?/end-guess" method="POST" use:enhance>
    <button type="submit">End turn</button>
  </form>
{/if}

<Board board={state.board} covered={state.covered} {isClueGiver} />
