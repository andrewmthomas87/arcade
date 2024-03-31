<script lang="ts">
  import { onMount } from 'svelte';

  export let end: number;

  let seconds = calculateSeconds(end);
  let timeout: NodeJS.Timeout | undefined = undefined;

  let str: string;
  $: {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    str = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  onMount(() => {
    update();

    return () => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    };
  });

  function update() {
    seconds = calculateSeconds(end);

    if (seconds === 0) {
      timeout = undefined;
      return;
    }

    const nextTick = (end - Date.now()) % 1000;
    timeout = setTimeout(update, nextTick);
  }

  function calculateSeconds(end: number) {
    return Math.max(0, Math.ceil((end - Date.now()) / 1000));
  }
</script>

{str}
