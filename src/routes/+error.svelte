<script lang="ts">
  import { page } from '$app/stores';
</script>

<main>
  <h1>{$page.status}</h1>
  <p>{$page.error?.message}</p>
</main>

<style>
  h1 {
    color: var(--blue600);
    font-size: 3em;
  }
</style>
