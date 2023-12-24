<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { WEIGHTS, type Weight } from './canvas';

  const dispatch = createEventDispatcher<{ select: Weight }>();
</script>

<div class="weights">
  {#each WEIGHTS as weight}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div role="button" tabindex="0" class="weight" on:click={() => dispatch('select', weight)}>
      {weight}
    </div>
  {/each}
</div>

<style>
  .weights {
    padding: 8px;
    line-height: 1.5;
  }

  .weight {
    padding: 0.5em 1.5em;
    border-bottom: 1px solid #333;
    font-size: 1.75em;
    cursor: pointer;
  }

  .weight:last-child {
    border-bottom: none;
  }
</style>
