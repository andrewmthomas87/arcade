<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  const INVALIDATE_INTERVAL_MS = 2000;

  onMount(() => {
    const id = setInterval(() => {
      invalidate('verbose');
      invalidate('game');
    }, INVALIDATE_INTERVAL_MS);

    return () => clearInterval(id);
  });
</script>

<slot />

<style>
  :global(body) {
    background-image: url(/verbose-bg-a5cc49ddc0addcdb55accbf88532b738.png);
  }
</style>
