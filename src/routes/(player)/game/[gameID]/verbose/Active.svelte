<script lang="ts">
  import type { PlayerCookie } from '$lib/cookies';
  import type { RoundState } from '$lib/games/verbose/game';
  import type { Player, VerboseRound } from '@prisma/client';
  import Clues from './Clues.svelte';
  import Guess from './Guess.svelte';
  import Result from './Result.svelte';
  import End from './End.svelte';

  export let players: Player[];
  export let player: PlayerCookie;
  export let round: VerboseRound;

  $: state = JSON.parse(round.stateJSON) as RoundState;
  $: isGuesser = state.guesserID === player.id;
</script>

{#if state.step !== 'end'}
  <section>
    <p class="status">
      score: {state.score} &middot; remaining rounds: {state.remainingRounds}
    </p>

    <p>
      You are
      {#if isGuesser}
        the guesser
      {:else}
        a clue giver
      {/if}
    </p>
  </section>
{/if}

{#if state.step === 'clues'}
  <Clues {player} {state} {isGuesser} />
{:else if state.step === 'guess'}
  <Guess {players} {state} {isGuesser} />
{:else if state.step === 'result'}
  <Result {players} {state} />
{:else if state.step === 'end'}
  <End {state} />
{/if}

<style>
  section {
    margin-bottom: 1.5em;
  }

  .status {
    color: var(--blue700);
    font-size: 0.875em;
    font-weight: 700;
  }
</style>
