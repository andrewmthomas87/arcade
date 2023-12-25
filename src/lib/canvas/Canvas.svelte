<script lang="ts">
  import simplify from 'simplify-js';
  import { onMount } from 'svelte';
  import {
    type Path,
    type Coord,
    type Color,
    type Weight,
    SIMPLIFY_TOLERANCE,
    drawPaths,
  } from './canvas';

  export let size: number;
  export let unit: number;
  export let color: Color;
  export let weight: Weight;
  export let paths: Path[] = [];

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let activePath: Path | null = null;

  $: {
    if (ctx) {
      const allPaths = paths.slice();
      if (activePath !== null) {
        allPaths.push(activePath);
      }

      drawPaths(ctx, size, unit, allPaths);
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
  });

  function calculateCanvasCoord(coord: { x: number; y: number }): { x: number; y: number } | null {
    const r = canvas.getBoundingClientRect();

    const x = Math.trunc(size * ((coord.x - r.left) / r.width));
    const y = Math.trunc(size * ((coord.y - r.top) / r.height));
    if (x < 0 || x >= size || y < 0 || y >= size) {
      return null;
    }

    return { x, y };
  }

  function startPath(coord: Coord) {
    activePath = { color, weight, coords: [coord] };
  }

  function pushCoord(coord: Coord) {
    if (!activePath) {
      return;
    }

    const prevCoord = activePath.coords.at(-1);
    if (prevCoord && coord.x === prevCoord.x && coord.y === prevCoord.y) {
      return;
    }

    const coords = activePath.coords.concat(coord);
    activePath = { ...activePath, coords };
  }

  function handleMouseDown(e: MouseEvent) {
    const coord = calculateCanvasCoord({ x: e.clientX, y: e.clientY });
    if (!coord) {
      return;
    }

    startPath(coord);
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    const coord = calculateCanvasCoord({ x: touch.clientX, y: touch.clientY });
    if (!coord) {
      return;
    }

    startPath(coord);
  }

  function handleCancel() {
    if (!activePath) {
      return;
    }

    const coords = simplify(activePath.coords, SIMPLIFY_TOLERANCE, true);
    paths = [...paths, { ...activePath, coords }];
    activePath = null;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!activePath) {
      return;
    }

    const coord = calculateCanvasCoord({ x: e.clientX, y: e.clientY });
    if (!coord) {
      return;
    }

    pushCoord(coord);
  }

  function handleTouchMove(e: TouchEvent) {
    if (!activePath || e.touches.length === 0) {
      return;
    }

    const touch = e.touches[0];
    const coord = calculateCanvasCoord({ x: touch.clientX, y: touch.clientY });
    if (!coord) {
      return;
    }

    pushCoord(coord);
  }
</script>

<svelte:body on:mouseup={handleCancel} on:touchcancel={handleCancel} />

<canvas
  bind:this={canvas}
  class="has-background-black"
  width={size * unit}
  height={size * unit}
  on:mousedown|preventDefault={handleMouseDown}
  on:mousemove|preventDefault={handleMouseMove}
  on:touchstart|preventDefault={handleTouchStart}
  on:touchmove|preventDefault={handleTouchMove}
  on:touchend|preventDefault={handleCancel}
/>

<style>
  canvas {
    width: 100%;
  }
</style>
