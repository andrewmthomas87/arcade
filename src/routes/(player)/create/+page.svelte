<script lang="ts">
  import { enhance } from '$app/forms';
  import { slide } from 'svelte/transition';
  import type { ActionData } from './$types';
  import createImg from '$lib/assets/create.png';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { delay } from '$lib/animation';

  export let form: ActionData;
</script>

<main class="has-background-darkened">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <div class="banner block">
          <figure class="image is-16by9">
            <img src={createImg} alt="Create" />
          </figure>
        </div>
        <h2 class="subtitle">Create a new arcade lobby. You'll be the host.</h2>

        {#if form?.error}
          <div class="notification is-danger" in:slide>{form.error}</div>
        {/if}

        <div class="block">
          <form method="POST" use:enhance>
            <div class="field">
              <div class="control">
                <button class="button is-link" type="submit">Create</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>

<style>
  :global(html) {
    background-image: url(/vector-wallpaper-d53764a5a540a2d890e3a0d85f94e122.png);
  }

  .banner {
    max-width: 384px;
  }

  .banner img {
    object-fit: cover;
    border-radius: 4px;
  }
</style>
