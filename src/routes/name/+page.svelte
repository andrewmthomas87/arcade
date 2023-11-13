<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<main>
  <h1>Welcome to the arcade</h1>
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
  h1 {
    color: var(--blue600);
    font-size: 3em;
  }

  p.error {
    color: var(--red600);
    font-weight: 500;
  }
</style>
