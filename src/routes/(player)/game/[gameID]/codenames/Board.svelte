<script lang="ts">
  import type { Card } from '$lib/games/codenames/game';

  export let board: Card[][];
  export let isClueGiver: boolean;
</script>

<table>
  <tbody>
    {#each board as row}
      <tr>
        {#each row as card}
          <td>
            {card.word}
            {#if isClueGiver}
              ({card.assignment})
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
