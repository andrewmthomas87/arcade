<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/codenames/game';
  import Board from './Board.svelte';

  export let state: RoundState;
  export let team: 'blue' | 'red';
  export let isClueGiver: boolean;

  if (state.step !== 'clue') {
    throw new Error('expected clue step');
  }

  $: isActiveClueGiver = isClueGiver && state.turn === team;
  $: uncoveredCount = state.covered.flat().filter((c) => !c).length;
</script>

{#if isActiveClueGiver}
  <h1>You're up</h1>
  <br />

  <section>
    <form action="?/clue" method="POST" use:enhance>
      <label for="clue">Clue</label>
      <input id="clue" type="text" name="clue" />

      <label for="count">Count</label>
      <select id="count" name="count" value="empty">
        <option value="empty" disabled>Select a count</option>
        <option value="null">None</option>
        {#each Array.from(Array(uncoveredCount)) as _, i}
          <option value={i + 1}>{i + 1}</option>
        {/each}
      </select>

      <button type="submit">Submit</button>
    </form>
  </section>
{:else}
  <h1>Waiting for {state.turn} clue</h1>
{/if}

<Board board={state.board} covered={state.covered} {isClueGiver} />

<style>
  section {
    margin-bottom: 1em;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
