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
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <article
        class="message is-light is-medium is-clickable"
        class:is-success={selected === i}
        on:click={() => (selected = i)}
      >
        <div class="message-body">{option}</div>
      </article>
    </div>
  {/each}

  <input type="hidden" {name} value={selected} />
</div>
