<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { COLORS, type Color } from './canvas';

  const dispatch = createEventDispatcher<{ select: Color }>();
</script>

<div class="colors">
  {#each COLORS as color}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div role="button" tabindex="0" class="color" on:click={() => dispatch('select', color)}>
      <div style="background-color: {color};" />
    </div>
  {/each}
</div>

<style>
  .colors {
    padding: 8px;
    line-height: 0;
  }

  .color {
    display: inline-block;
    width: 33.333%;
    aspect-ratio: 5 / 3;
    padding: 8px;
    cursor: pointer;
  }

  .color div {
    width: 100%;
    height: 100%;
  }
</style>
