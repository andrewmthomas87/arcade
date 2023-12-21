<script lang="ts">
  import createImg from '$lib/assets/create.png';
  import joinImg from '$lib/assets/join.png';
  import { onMount } from 'svelte';
  import { fade, scale, slide } from 'svelte/transition';

  let isMounted = false;

  onMount(() => {
    isMounted = true;
  });
</script>

{#if isMounted}
  <main class="has-background-darkened" in:fade={{ delay: 750 }}>
    <section class="section" in:slide={{ delay: 1000 }}>
      <div class="container is-max-desktop">
        <div class="block">
          <h1 class="is-size-5 has-text-primary-dark has-text-weight-bold">
            welcome to the<br /><span class="is-size-1 has-text-primary">arcade</span>
          </h1>
        </div>

        <div class="columns" in:scale={{ delay: 1500 }}>
          <div class="column"><a href="/join"><img src={joinImg} alt="Join" /></a></div>
          <div class="column"><a href="/create"><img src={createImg} alt="Create" /></a></div>
        </div>
      </div>
    </section>
  </main>
{/if}

<style>
  :global(html) {
    background-image: url(/vector-wallpaper-d53764a5a540a2d890e3a0d85f94e122.png);
  }

  h1 {
    line-height: 1.875em;
    text-align: center;
  }

  .columns {
    max-width: 1536px;
    max-height: 1536px;
    margin: auto;
  }

  img {
    border-radius: 4px;
  }
</style>
