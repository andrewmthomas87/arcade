<script lang="ts">
  import { enhance } from '$app/forms';
  import { slide } from 'svelte/transition';
  import type { ActionData } from './$types';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { delay } from '$lib/animation';

  export let form: ActionData;

  let isSubmitting = false;
</script>

<main class="has-background-darkened">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <div class="block">
          <h1 class="is-size-5 has-text-primary-dark has-text-weight-bold">
            welcome to the<br /><span class="is-size-1 has-text-primary">arcade</span>
          </h1>
          <h2 class="subtitle">What should we call you?</h2>
        </div>

        {#if form?.error}
          <div class="notification is-danger" in:slide>{form.error}</div>
        {/if}

        <div class="block">
          <form
            method="POST"
            use:enhance={() => {
              isSubmitting = true;
              return async ({ update }) => {
                await update();
                isSubmitting = false;
              };
            }}
          >
            <div class="field">
              <label class="is-sr-only" for="name">Name</label>
              <input
                id="name"
                class="input"
                type="text"
                name="name"
                placeholder="Nickname"
                autocomplete="off"
              />
            </div>
            <div class="field">
              <div class="control">
                <button class="button is-link" class:is-loading={isSubmitting}>Save</button>
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

  h1 {
    line-height: 1.875em;
  }
</style>
