<script lang="ts">
  import type { PlayerCookie } from '$lib/cookies';
  import type { RoundState } from '$lib/games/codenames/game';
  import type { CodenamesRound } from '@prisma/client';
  import Clue from './Clue.svelte';
  import Guess from './Guess.svelte';
  import GuessResult from './GuessResult.svelte';
  import Result from './Result.svelte';
  import End from './End.svelte';

  export let player: PlayerCookie;
  export let round: CodenamesRound;

  $: state = JSON.parse(round.stateJSON) as RoundState;
  let team: 'blue' | 'red';
  $: team = state.blueIDs.includes(player.id) ? 'blue' : 'red';
  $: isClueGiver = state.blueClueGiverID === player.id || state.redClueGiverID === player.id;
</script>

<p>
  You are
  {#if isClueGiver}
    the {team} clue giver
  {:else}
    a {team} guesser
  {/if}
</p>

{#if state.step === 'clue'}
  <Clue {state} {team} {isClueGiver} />
{:else if state.step === 'guess'}
  <Guess {state} {team} {isClueGiver} />
{:else if state.step === 'guessResult'}
  <GuessResult {state} {team} {isClueGiver} />
{:else if state.step === 'result'}
  <Result {state} {isClueGiver} />
{:else if state.step === 'end'}
  <End {state} />
{/if}
