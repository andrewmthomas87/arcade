<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/codenames/game';
  import Board from './Board.svelte';

  export let state: RoundState;

  if (state.step !== 'end') {
    throw new Error('expected end step');
  }
</script>

<h1>Game over</h1>
<h2>{state.winner} team wins!</h2>

<section>
  <form action="?/play-again" method="POST" use:enhance>
    <button type="submit">Play again</button>
  </form>
  <br />
  <form action="?/lobby" method="POST" use:enhance>
    <button type="submit">Back to lobby</button>
  </form>
</section>

<Board board={state.board} covered={state.covered} isClueGiver />

<style>
  section {
    margin-bottom: 1em;
  }
</style>
