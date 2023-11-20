<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/codenames/game';
  import Board from './Board.svelte';

  export let state: RoundState;
  export let isClueGiver: boolean;

  if (state.step !== 'result') {
    throw new Error('expected result step');
  }

  $: uncoveredCards = state.board.flatMap((row, y) => row.filter((_, x) => !state.covered[y][x]));
  $: uncoveredBlueCardCount = uncoveredCards.filter((c) => c.assignment === 'blue').length;
  $: uncoveredRedCardCount = uncoveredCards.filter((c) => c.assignment === 'red').length;
</script>

<h1>Here's where things stand</h1>

<p>
  Blue cards left: {uncoveredBlueCardCount}<br />
  Red cards left: {uncoveredRedCardCount}<br />
  Next up: {state.turn === 'blue' ? 'red' : 'blue'} team
</p>

<form action="?/result-continue" method="POST" use:enhance>
  <button type="submit">Continue</button>
</form>

<Board board={state.board} covered={state.covered} {isClueGiver} />
