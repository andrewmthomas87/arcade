<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<main>
  <h1>Join</h1>

  <form method="POST" use:enhance>
    <label for="code">Code</label>
    <input id="code" type="text" name="code" />

    <button type="submit">Join</button>

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
