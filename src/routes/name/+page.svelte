<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<main>
  <h2>welcome to the</h2>
  <h1>arcade</h1>

  <p>What should we call you?</p>
  <br />

  <form method="POST" use:enhance>
    <label for="name">Name</label>
    <input id="name" type="text" name="name" />

    <button type="submit">Save</button>

    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}
  </form>
</main>

<style>
  main {
    text-align: center;
  }

  h2 {
    color: var(--foreground);
    margin-bottom: -0.333em;
    font-size: 1.2em;
  }

  h1 {
    color: var(--foreground);
    font-size: 3em;
  }

  p.error {
    color: var(--red700);
    font-weight: 500;
  }
</style>
