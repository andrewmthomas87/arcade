<script lang="ts">
  import { page } from '$app/stores';
</script>

<main>
  <section class="section">
    <div class="container is-max-desktop">
      <h1 class="title">{$page.status}</h1>
      <h2 class="subtitle">{$page.error?.message}</h2>
    </div>
  </section>
</main>
