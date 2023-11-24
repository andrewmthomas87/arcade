<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { invalidate } from '$app/navigation';
  import Create from './Create.svelte';
  import Active from './Active.svelte';

  const INVALIDATE_INTERVAL_MS = 2000;

  export let data: PageData;

  onMount(() => {
    const id = setInterval(() => invalidate('verbose'), INVALIDATE_INTERVAL_MS);

    return () => clearInterval(id);
  });
</script>

<main>
  <div><span class="game-tag">verbose</span></div>
  {#if data.game.verbose === null}
    <Create />
  {:else}
    <Active players={data.game.players} player={data.player} round={data.game.verbose.rounds[0]} />
  {/if}
</main>

<style>
  span.game-tag {
    color: var(--pink700);
    padding: 2px 4px;
    background-color: var(--pink100);
    font-size: 0.75em;
    font-weight: 400;
  }
</style>
