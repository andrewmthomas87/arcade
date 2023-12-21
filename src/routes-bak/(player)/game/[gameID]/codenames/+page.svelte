<script lang="ts">
  import { onMount } from 'svelte';
  import Create from './Create.svelte';
  import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';
  import Active from './Active.svelte';

  const INVALIDATE_INTERVAL_MS = 2000;

  export let data: PageData;

  onMount(() => {
    const id = setInterval(() => invalidate('codenames'), INVALIDATE_INTERVAL_MS);

    return () => clearInterval(id);
  });
</script>

<main>
  <div><span class="game-tag">codenames</span></div>
  {#if data.game.codenames === null}
    <Create players={data.game.players} />
  {:else}
    <Active player={data.player} round={data.game.codenames.rounds[0]} />
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
