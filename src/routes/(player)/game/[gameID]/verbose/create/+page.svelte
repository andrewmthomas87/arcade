<script lang="ts">
  import { enhance } from '$app/forms';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { ActionData } from './$types';
  import { delay } from '$lib/animation';

  export let form: ActionData;
</script>

<main>
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <h1 class="title">Create</h1>
        <h2 class="subtitle">Setup the game</h2>

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
