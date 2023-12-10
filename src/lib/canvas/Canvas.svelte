<script lang="ts">
  import { onMount } from 'svelte';
  import { COLORS, WEIGHTS, type Path, type Coord, type Color, type Weight } from './canvas';
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let color = COLORS[0];
  let weight = WEIGHTS[0];
  let isDrawing = false;
  let paths: Path[] = [];
  let dropdown: 'none' | 'color' | 'weight' = 'none';

  $: {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const path of paths) {
        ctx.beginPath();
        ctx.moveTo(path.coords[0].x, path.coords[0].y);
        for (let i = 1; i < path.coords.length; i++) {
          ctx.lineTo(path.coords[i].x, path.coords[i].y);
        }

        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.weight;
        ctx.stroke();
      }
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
  });

  function calculateCanvasCoord(coord: { x: number; y: number }): { x: number; y: number } | null {
    const x = Math.trunc((canvas.width * (coord.x - canvas.offsetLeft)) / canvas.offsetWidth);
    const y = Math.trunc((canvas.height * (coord.y - canvas.offsetTop)) / canvas.offsetHeight);
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return null;
    }

    return { x, y };
  }

  function startPath(coord: Coord) {
    isDrawing = true;
    paths.push({ color, weight, coords: [coord] });
  }

  function pushCoord(coord: Coord) {
    const path = paths.at(-1);
    if (!path) {
      return;
    }

    const prevCoord = path.coords.at(-1);
    if (prevCoord && coord.x === prevCoord.x && coord.y === prevCoord.y) {
      return;
    }

    paths[paths.length - 1] = { ...path, coords: path.coords.concat(coord) };
  }

  function handleMouseDown(e: MouseEvent) {
    const coord = calculateCanvasCoord({ x: e.pageX, y: e.pageY });
    if (!coord) {
      return;
    }

    startPath(coord);
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    const coord = calculateCanvasCoord({ x: touch.pageX, y: touch.pageY });
    if (!coord) {
      return;
    }

    startPath(coord);
  }

  function handleCancel() {
    isDrawing = false;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDrawing) {
      return;
    }

    const coord = calculateCanvasCoord({ x: e.pageX, y: e.pageY });
    if (!coord) {
      return;
    }

    pushCoord(coord);
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDrawing) {
      return;
    } else if (e.touches.length === 0) {
      return;
    }

    const touch = e.touches[0];
    const coord = calculateCanvasCoord({ x: touch.pageX, y: touch.pageY });
    if (!coord) {
      return;
    }

    pushCoord(coord);
  }

  function handleToggleColor() {
    dropdown = dropdown === 'color' ? 'none' : 'color';
  }

  function handleSelectColor(selected: Color) {
    color = selected;
    dropdown = 'none';
  }

  function handleToggleWeight() {
    dropdown = dropdown === 'weight' ? 'none' : 'weight';
  }

  function handleSelectWeight(selected: Weight) {
    weight = selected;
    dropdown = 'none';
  }

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

<svelte:body on:mouseup={handleCancel} on:touchcancel={handleCancel} />

<div class="controls">
  <div>
    <button on:click={handleToggleColor}>Color</button>
    <button on:click={handleToggleWeight}>Weight</button>
  </div>
  <div>
    <button disabled={paths.length === 0} on:click={handleUndo}>Undo</button>
    <button on:click={handleClear}>Clear</button>
  </div>
</div>

{#if dropdown === 'color'}
  <div class="dropdown">
    <div class="colors">
      {#each COLORS as color}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div role="button" tabindex="0" class="color" on:click={() => handleSelectColor(color)}>
          <div style="background-color: {color};" />
        </div>
      {/each}
    </div>
  </div>
{:else if dropdown === 'weight'}
  <div class="dropdown">
    <div class="weights">
      {#each WEIGHTS as weight}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div role="button" tabindex="0" class="weight" on:click={() => handleSelectWeight(weight)}>
          {weight}px
        </div>
      {/each}
    </div>
  </div>
{/if}

<canvas
  bind:this={canvas}
  width="128"
  height="128"
  class:hidden={dropdown !== 'none'}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleCancel}
/>

<style>
  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .controls > div:first-child {
    flex: 1;
  }

  canvas {
    width: 100%;
    aspect-ratio: 1;
    background-color: #111;
  }

  canvas.hidden {
    display: none;
  }

  .dropdown {
    padding: 8px;
    background-color: #111;
  }

  .colors {
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

  .weight {
    font-size: 1.5em;
    padding: 16px 24px;
    cursor: pointer;
    border-bottom: 1px solid #333;
  }

  .weight:last-child {
    border-bottom: none;
  }
</style>
