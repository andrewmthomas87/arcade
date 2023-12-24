<script lang="ts">
  import { onMount } from 'svelte';
  import { drawPaths, type Path } from './canvas';

  export let size: number;
  export let unit: number;
  export let paths: Path[] = [];
  export let animationDuration = 1000;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let animateI = 0;
  let animateIntervalID: ReturnType<typeof setInterval> | null = null;

  $: animateSteps = paths.map((p) => p.coords).flat().length;

  $: {
    if (ctx) {
      drawPaths(ctx, size, unit, paths, animateI);
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;

    const id = setTimeout(animate, 500);

    return () => {
      clearTimeout(id);

      if (animateIntervalID) {
        clearInterval(animateIntervalID);
      }
    };
  });

  function animate() {
    if (animateIntervalID) {
      clearInterval(animateIntervalID);
      animateIntervalID = null;
    }

    animateI = 0;
    animateIntervalID = setInterval(step, animationDuration / animateSteps);
  }

  function step() {
    animateI++;

    if (animateI >= animateSteps && animateIntervalID) {
      clearInterval(animateIntervalID);
    }
  }
</script>

<canvas
  bind:this={canvas}
  class="has-background-black"
  width={size * unit}
  height={size * unit}
  on:click={animate}
/>

<p class="help">Click to replay</p>

<style>
  canvas {
    width: 100%;
  }
</style>
