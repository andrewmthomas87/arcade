<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<main>
  <h1>Join</h1>
  <p>Join an arcade lobby. You'll need the code.</p>
  <br />

  <form method="POST" use:enhance>
    <label for="code">Code</label>
    <input id="code" type="text" name="code" autocomplete="off" />

    <button type="submit">Join</button>

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
