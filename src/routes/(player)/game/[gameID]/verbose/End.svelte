<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/verbose/game';

  export let state: RoundState;
</script>

<section>
  <h1>Game over</h1>
  <p class="score">score: {state.score}</p>
</section>

<section>
  <form action="?/play-again" method="POST" use:enhance>
    <button type="submit">Play again</button>
  </form>
  <br />
  <form action="?/lobby" method="POST" use:enhance>
    <button type="submit">Back to lobby</button>
  </form>
</section>

<style>
  section {
    margin-bottom: 1.5em;
  }

  .score {
    color: var(--blue700);
  }
</style>
