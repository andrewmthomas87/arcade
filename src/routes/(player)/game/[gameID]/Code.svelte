<script lang="ts">
  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { scale } from 'svelte/transition';

  export let code: string;

  let isCopied = false;
  let isCopiedTimeout: ReturnType<typeof setTimeout> | null = null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${PUBLIC_BASE_URL}/join/${code}`);

      isCopied = true;

      if (isCopiedTimeout) {
        clearTimeout(isCopiedTimeout);
        isCopiedTimeout = null;
      }
      isCopiedTimeout = setTimeout(() => {
        isCopied = false;
        isCopiedTimeout = null;
      }, 2000);
    } catch (ex) {
      alert('Failed to copy URL to clipboard');
    }
  }
</script>

<button class="button is-info is-small is-size-3 has-text-weight-bold" on:click={handleCopy}
  >{code}</button
>
{#if isCopied}
  <p class="mt-2 is-size-7 has-text-success" in:scale>URL copied!</p>
{:else}
  <p class="mt-2 is-size-7" in:scale>Click to copy URL</p>
{/if}
