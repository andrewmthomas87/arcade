<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { invalidate } from '$app/navigation';

  const INVALIDATE_INTERVAL_MS = 2000;

  export let data: PageData;

  onMount(() => {
    const id = setInterval(() => invalidate('lobby'), INVALIDATE_INTERVAL_MS);

    return () => clearInterval(id);
  });
</script>

<main>
  <div class="header">
    <h1>Lobby</h1>
    <span class="code">{data.lobby.code}</span>
  </div>

  <h2>Players</h2>
  <ul>
    {#each data.lobby.players as player (player.id)}
      <li>{player.name}</li>
    {/each}
  </ul>
</main>

<style>
  div.header {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  h1 {
    flex: 1;
    color: var(--blue600);
    font-size: 3em;
  }

  span.code {
    padding: 0 12px;
    background-color: var(--green500);
    font-size: 3em;
    font-weight: 700;
  }
</style>
