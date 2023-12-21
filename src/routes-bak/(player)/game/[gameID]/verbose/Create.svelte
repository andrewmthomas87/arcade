<script>
  import { enhance } from '$app/forms';
</script>

<section>
  <h1>Create</h1>
  <p>Setup the game</p>
</section>
<br />

<section>
  <form action="?/create" method="POST" use:enhance>
    <button type="submit">Create</button>
  </form>
</section>
