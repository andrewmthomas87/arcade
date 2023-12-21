<script lang="ts">
  import { enhance } from '$app/forms';
  import { CODE_LENGTH } from '$lib/code';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { ActionData } from './$types';
  import joinImg from '$lib/assets/join.png';
  import { page } from '$app/stores';

  export let form: ActionData;

  let isMounted = false;
  let code = $page.params['code'] || '';

  $: code = code.toUpperCase().slice(0, CODE_LENGTH);

  onMount(() => {
    isMounted = true;
  });
</script>

<main class="has-background-darkened">
  {#if isMounted}
    <section class="section" in:slide={{ delay: 250 }}>
      <div class="container is-max-desktop">
        <div class="banner block">
          <figure class="image is-16by9">
            <img src={joinImg} alt="Join" />
          </figure>
        </div>
        <h2 class="subtitle">Join an arcade lobby. You'll need the code.</h2>

        {#if form?.error}
          <div class="notification is-danger" in:slide>{form.error}</div>
        {/if}

        <div class="block">
          <form method="POST" use:enhance>
            <div class="field">
              <label class="label" for="code">Code</label>
              <div class="control">
                <input
                  id="code"
                  class="input is-large"
                  type="text"
                  name="code"
                  bind:value={code}
                  autocomplete="off"
                />
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button class="button is-link">Join</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  {/if}
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
