<script lang="ts">
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
  import type { PageData } from './$types';
  import ViewCanvas from '$lib/canvas/ViewCanvas.svelte';
  import { enhance } from '$app/forms';
  import type { Player } from '@prisma/client';

  export let data: PageData;

  $: correctPlayers = data.guessesByPlayer[data.activePlayer.id].map((playerID) =>
    data.players.find((p) => p.id === playerID),
  );
  let incorrect: (readonly [Player | undefined, (Player | undefined)[]])[];
  $: {
    incorrect = Object.entries(data.guessesByPlayer)
      .map(([k, v]) => [Number(k), v] as const)
      .filter(([playerID]) => playerID !== data.activePlayer.id)
      .map(([playerID, playerIDs]) => [
        data.players.find((p) => p.id === playerID),
        playerIDs.map((playerID) => data.players.find((p) => p.id === playerID)),
      ]);
    incorrect.sort((a, b) => b[1].length - a[1].length);
  }
</script>

<main class="has-background-darkened-er">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        {#if data.isMe}
          <h1 class="title">So what did you draw?</h1>
        {:else}
          <h1 class="title">
            So what did <span class="has-underline is-info">{data.activePlayer.name}</span> draw?
          </h1>
        {/if}

        <h2 class="subtitle">¯\_(ツ)_/¯... the prompt was:</h2>
        <div class="block">
          <span class="tag is-success is-medium">{data.prompt}</span>
        </div>

        <div class="block canvas">
          <ViewCanvas size={128} unit={2} paths={data.activeDrawing} animationDuration={3750} />
        </div>
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(1) }}>
      <div class="container is-max-desktop">
        <h2 class="subtitle"><span class="has-underline is-success">Correct!</span></h2>

        <div class="block">
          <p class="is-size-5">
            {#if correctPlayers.length > 0}
              <div class="tags are-medium is-inline-block mb-0">
                {#each correctPlayers as player (player?.id)}
                  {#if player?.id === data.myID}
                    <span class="tag is-primary">you</span>
                  {:else}
                    <span class="tag is-success">{player?.name}</span>
                  {/if}
                {/each}
              </div>
            {:else}
              <span class="has-underline is-warning is-inline-block mb-2">nobody</span>
            {/if}
            guessed correctly!
          </p>
        </div>
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(2) }}>
      <div class="container is-max-desktop">
        <h2 class="subtitle"><span class="has-underline is-danger">Fooled!</span></h2>

        {#each incorrect as [player, players] (player?.id)}
          <div class="block">
            <p class="is-size-5">
              {#if players.length > 0}
                <div class="tags are-medium is-inline-block mb-0">
                  {#each players as player (player?.id)}
                    {#if player?.id === data.myID}
                      <span class="tag is-primary">you</span>
                    {:else}
                      <span class="tag is-danger">{player?.name}</span>
                    {/if}
                  {/each}
                </div>
              {:else}
                <span class="has-underline is-warning is-inline-block mb-2">nobody</span>
              {/if}
              guessed
              {#if player?.id === data.myID}
                <span class="tag is-primary is-medium">your</span>
              {:else}
                <span class="tag is-dark is-medium">{player?.name}</span>'s
              {/if}
              answer:<br />
              {#if player}
                <span class="tag is-light is-medium">{data.answers[player.id]}</span>
              {/if}
            </p>
          </div>
        {/each}
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(3) }}>
      <div class="container is-max-desktop">
        <div class="block">
          <form method="POST" use:enhance>
            <div class="field">
              <div class="control">
                <button class="button is-link" type="submit">Continue</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>

<style>
  .canvas {
    max-width: 768px;
  }
</style>
