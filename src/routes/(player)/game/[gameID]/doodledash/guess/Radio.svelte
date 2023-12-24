<script lang="ts">
  export let name: string;
  export let selected: number;
  export let options: string[];
</script>

<div>
  {#each options as option, i}
    <div class="mb-2">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        class="tag is-light is-medium is-clickable"
        class:is-success={selected === i}
        on:click={() => (selected = i)}>{option}</span
      >
    </div>
  {/each}

  <input type="hidden" {name} value={selected} />
</div>
