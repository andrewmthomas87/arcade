<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { invalidate } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { GAME_TYPES } from '$lib/games';

  const INVALIDATE_INTERVAL_MS = 2000;

  export let data: PageData;

  $: isLocked = data.lobby.activeGame !== null;

  onMount(() => {
    const id = setInterval(() => invalidate('lobby'), INVALIDATE_INTERVAL_MS);

    return () => clearInterval(id);
  });
</script>

<main>
  <section class="header">
    <h1>Lobby</h1>
    <span class="code">{data.lobby.code}</span>
  </section>

  {#if isLocked}
    <section>
      <h2>Hold tight</h2>
      <p>There's a game in progress...</p>
    </section>
  {:else}
    <section>
      <h2>Players</h2>
      <ul>
        {#each data.lobby.players as player (player.id)}
          <li>{player.name}</li>
        {/each}
      </ul>
    </section>

    <section>
      <h2>Play game</h2>

      <form method="POST" use:enhance>
        <label for="game">Game</label>
        <select id="game" name="type" value="empty">
          <option value="empty" disabled>Select a game</option>
          {#each GAME_TYPES as type}
            <option value={type}>{type}</option>
          {/each}
        </select>

        <button type="submit">Go</button>
      </form>
    </section>
  {/if}
</main>

<style>
  section {
    margin-bottom: 16px;
  }

  section.header {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  h1 {
    flex: 1;
    color: var(--cyan700);
    font-size: 3em;
  }

  span.code {
    padding: 0 12px;
    background-color: var(--green500);
    font-size: 3em;
    font-weight: 700;
  }
</style>
