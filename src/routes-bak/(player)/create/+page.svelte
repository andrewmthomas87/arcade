<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<main>
  <h1>Create</h1>

  <p>Create a new arcade lobby. You'll be the host.</p>
  <br />

  <form method="POST" use:enhance>
    <button type="submit">Create</button>

    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}
  </form>
</main>

<style>
  h1 {
    color: var(--cyan700);
    font-size: 3em;
  }

  p.error {
    color: var(--red700);
    font-weight: 500;
  }
</style>
