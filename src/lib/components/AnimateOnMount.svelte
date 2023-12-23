<script lang="ts">
  import { onMount } from 'svelte';

  let isMounted = false;

  onMount(() => {
    isMounted = true;
  });
</script>

{#if isMounted}
  <slot />
{/if}
