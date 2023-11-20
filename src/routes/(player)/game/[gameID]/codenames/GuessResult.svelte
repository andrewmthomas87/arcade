<script lang="ts">
  import { enhance } from '$app/forms';
  import type { RoundState } from '$lib/games/codenames/game';
  import Board from './Board.svelte';

  export let state: RoundState;
  export let team: 'blue' | 'red';
  export let isClueGiver: boolean;

  if (state.step !== 'guessResult') {
    throw new Error('expected guessResult step');
  }

  $: isActiveGuesser = state.turn === team && !isClueGiver;
  $: uncoveredCards = state.board.flatMap((row, y) => row.filter((_, x) => !state.covered[y][x]));
  $: uncoveredCardCount = uncoveredCards.filter((c) => c.assignment === state.turn).length;
  $: clue =
    state.turn === 'blue' ? state.blueClues[state.round - 1] : state.redClues[state.round - 1];
  $: guesses =
    state.turn === 'blue' ? state.blueGuesses[state.round - 1] : state.redGuesses[state.round - 1];
  $: guess = guesses[guesses.length - 1];
  $: canGuessAgain =
    uncoveredCardCount > 0 && (clue.count === null || guesses.length <= clue.count);
  $: card = state.board[guess.y][guess.x];
</script>

<h1>{state.turn} guessed {card.word}</h1>
<p>
  {card.word} is
  {#if guess.status === 'correct'}
    {card.assignment} - correct!
  {:else if guess.status === 'incorrect'}
    {card.assignment} - incorrect!
  {:else if guess.status === 'neutral'}
    {card.assignment} - oops.
  {:else if guess.status === 'bad'}
    the bad card - oh no!
  {/if}
</p>

{#if isActiveGuesser}
  {#if guess.status === 'correct'}
    {#if canGuessAgain}
      <form action="?/guess-again" method="POST" use:enhance>
        <button type="submit">Guess again</button>
      </form>
    {/if}
    <form action="?/end-guess" method="POST" use:enhance>
      <button type="submit">End turn</button>
    </form>
  {:else}
    <form action="?/end-guess" method="POST" use:enhance>
      <button type="submit">Continue</button>
    </form>
  {/if}
{/if}

<Board board={state.board} {isClueGiver} />
