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

<form action="?/play-again" method="POST" use:enhance>
  <button type="submit">Play again</button>
</form>
<form action="?/lobby" method="POST" use:enhance>
  <button type="submit">Back to lobby</button>
</form>

<Board board={state.board} isClueGiver />
