<script lang="ts">
  import Canvas from './Canvas.svelte';
  import Colors from './Colors.svelte';
  import Weights from './Weights.svelte';
  import { WEIGHTS, type Path, COLORS } from './canvas';

  export let size: number;
  export let unit: number;
  export let paths: Path[] = [];

  let color = COLORS[0];
  let weight = WEIGHTS[0];
  let dropdown: 'none' | 'color' | 'weight' = 'none';

  function handleUndo() {
    if (paths.length === 0) {
      return;
    }

    paths = paths.slice(0, paths.length - 1);
  }

  function handleClear() {
    paths = [];
  }
</script>

<div class="mb-2">
  <div class="level is-mobile">
    <div class="level-left">
      <div class="level-item">
        <button
          class="button is-small"
          on:click={() => (dropdown = dropdown === 'color' ? 'none' : 'color')}>Color</button
        >
      </div>
      <div class="level-item">
        <button
          class="button is-small"
          on:click={() => (dropdown = dropdown === 'weight' ? 'none' : 'weight')}>Weight</button
        >
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <button class="button is-small" disabled={paths.length === 0} on:click={handleUndo}
          >Undo</button
        >
      </div>
      <div class="level-item">
        <button class="button is-small" on:click={handleClear}>Clear</button>
      </div>
    </div>
  </div>
</div>

<div class="container has-background-black">
  {#if dropdown === 'color'}
    <Colors
      on:select={(e) => {
        color = e.detail;
        dropdown = 'none';
      }}
    />
  {:else if dropdown === 'weight'}
    <Weights
      on:select={(e) => {
        weight = e.detail;
        dropdown = 'none';
      }}
    />
  {/if}

  <div class:is-hidden={dropdown !== 'none'}>
    <Canvas {size} {unit} {color} {weight} bind:paths />
  </div>
</div>

<style>
  .container {
    aspect-ratio: 1;
    line-height: 0;
  }
</style>
