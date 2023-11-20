<script lang="ts">
  import { enhance } from '$app/forms';
  import { BOARD_SIZES, type BoardSize } from '$lib/games/codenames/game';
  import { shuffleArrayDurstenfeld } from '$lib/utils/shuffle';
  import type { Player } from '@prisma/client';

  const defaultBoardSize: BoardSize = '3x3';

  export let players: Player[];

  let [blue, red] = shuffleTeams();

  function shuffleTeams() {
    const shuffled = players.slice();
    shuffleArrayDurstenfeld(shuffled);
    const mid = Math.trunc(shuffled.length / 2);
    const left = shuffled.slice(0, mid);
    const right = shuffled.slice(mid);
    const isBlueLeft = Math.random() < 0.5;

    return [isBlueLeft ? left : right, isBlueLeft ? right : left];
  }

  function handleShuffleTeams() {
    [blue, red] = shuffleTeams();
  }
</script>

<section>
  <h1>Create</h1>
  <p>Setup the game</p>
</section>
<br />

<section>
  <h2>Teams</h2>
  <p>Blue: {blue.map((p) => p.name).join(', ')}</p>
  <p>Red: {red.map((p) => p.name).join(', ')}</p>
  <button on:click={handleShuffleTeams}>Shuffle</button>

  <form action="?/create" method="POST" use:enhance>
    <input type="hidden" name="blue-ids" value={JSON.stringify(blue.map((p) => p.id))} />
    <input type="hidden" name="red-ids" value={JSON.stringify(red.map((p) => p.id))} />

    <label for="board-size">Board size</label>
    <select id="board-size" name="board-size" value={defaultBoardSize}>
      {#each Object.keys(BOARD_SIZES) as key}
        <option value={key}>{key}</option>
      {/each}
    </select>

    <button type="submit">Create</button>
  </form>
</section>

<style>
  h1 {
    color: var(--cyan700);
    font-size: 2em;
  }
</style>
