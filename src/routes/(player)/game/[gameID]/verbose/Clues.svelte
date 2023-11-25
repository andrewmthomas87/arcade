<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PlayerCookie } from '$lib/cookies';
  import type { RoundState } from '$lib/games/verbose/game';
  import type { Player } from '@prisma/client';

  export let players: Player[];
  export let player: PlayerCookie;
  export let state: RoundState;
  export let isGuesser: boolean;

  $: guesser = players.find((p) => p.id === state.guesserID);
  $: word = state.words[state.round - 1];
  $: hasSubmittedClue = !isGuesser && state.clues[state.round - 1][player.id] !== undefined;
</script>

{#if isGuesser}
  <section>
    <h1>Waiting for clues...</h1>
  </section>
{:else if hasSubmittedClue}
  <h1>Submitted! Waiting for other clues...</h1>
{:else}
  <section>
    <h1>You're up</h1>
  </section>

  <section>
    <p>
      <span class="guesser">{guesser?.name}</span> is trying to guess<br />
      <span class="word">{word}</span>
    </p>
  </section>

  <section>
    <form action="?/clue" method="POST" use:enhance>
      <label for="clue">Enter a one word clue</label>
      <input id="clue" type="text" name="clue" autocomplete="off" />

      <button type="submit">Submit</button>
    </form>
  </section>
{/if}

<style>
  section {
    margin-bottom: 1.5em;
  }

  .word {
    padding: 0.25em;
    background-color: var(--cyan500);
    font-size: 2.5em;
    font-weight: 700;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
</style>
