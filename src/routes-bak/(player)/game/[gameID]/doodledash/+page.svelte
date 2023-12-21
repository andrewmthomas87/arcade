<script>
  import Canvas from '$lib/canvas/Canvas.svelte';
</script>

<main>
  <div><span class="game-tag">doodledash</span></div>

  <Canvas />
</main>

<style>
  span.game-tag {
    color: var(--pink700);
    padding: 2px 4px;
    background-color: var(--pink100);
    font-size: 0.75em;
    font-weight: 400;
  }
</style>
