<script lang="ts">
  import cardImg from '$lib/assets/codenames-card.png';
  import type { Card } from '$lib/games/codenames/game';

  export let board: Card[][];
  export let covered: boolean[][];
  export let isClueGiver: boolean;
</script>

<div class="board" style="--card-image-url: url({cardImg})">
  {#each board as row, y}
    <div class="row">
      {#each row as card, x}
        <div class="card">
          <span class="word">{card.word}</span>
          {#if isClueGiver}<span class="assignment {card.assignment}" />{/if}
          {#if covered[y][x]}<span class="cover {card.assignment}" />{/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  div.board {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  div.row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }

  div.card {
    flex: 1;
    position: relative;
    aspect-ratio: 1.655;
    background-image: var(--card-image-url);
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    image-rendering: pixelated;
  }

  span.word {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 27.5%;
    color: #000;
    text-align: center;
  }

  span.assignment {
    position: absolute;
    top: 14%;
    left: 10%;
    width: 3em;
    height: 1.5em;
    border: 4px solid #000;
  }

  span.cover {
    position: absolute;
    top: 14%;
    left: 10%;
    right: 10%;
    bottom: 14%;
    border: 4px solid #000;
  }

  span.red {
    background-color: var(--red500);
  }

  span.blue {
    background-color: var(--blue500);
  }

  span.neutral {
    background-color: var(--orange800);
  }

  span.bad {
    background-color: #000;
  }
</style>
