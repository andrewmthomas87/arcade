<script lang="ts">
  import { enhance } from '$app/forms';
  import { BOARD_SIZES, type BoardSize } from '$lib/games/codenames';

  const defaultBoardSize: BoardSize = '3x3';
</script>

<h1>Create</h1>
<p>Setup the game</p>
<br />

<form action="?/create" method="POST" use:enhance>
  <label for="board-size">Board size</label>
  <select id="board-size" name="board-size" value={defaultBoardSize}>
    {#each Object.keys(BOARD_SIZES) as key}
      <option value={key}>{key}</option>
    {/each}
  </select>

  <button type="submit">Create</button>
</form>

<style>
  h1 {
    color: var(--cyan700);
    font-size: 2em;
  }
</style>
