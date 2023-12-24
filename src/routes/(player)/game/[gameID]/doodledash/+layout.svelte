<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  const INVALIDATE_INTERVAL_MS = 2000;

  onMount(() => {
    const id = setInterval(() => {
      invalidate('doodledash');
      invalidate('game');
    }, INVALIDATE_INTERVAL_MS);

    return () => clearInterval(id);
  });
</script>

<slot />

<style>
  :global(html) {
    background-image: url(/doodledash-1cec76c28b890092a60992a91b2766cc.png);
  }
</style>
