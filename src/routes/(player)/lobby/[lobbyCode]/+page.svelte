<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { invalidate } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { GAME_TYPES } from '$lib/games';
  import { scale, slide } from 'svelte/transition';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { delay } from '$lib/animation';
  import Code from './Code.svelte';

  const INVALIDATE_INTERVAL_MS = 2000;

  export let data: PageData;

  $: isLocked = data.lobby.activeGame !== null;

  onMount(() => {
    const id = setInterval(() => invalidate('lobby'), INVALIDATE_INTERVAL_MS);

    return () => clearInterval(id);
  });
</script>

<main class="has-background-darkened">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
      <div class="container is-max-desktop">
        <div class="level">
          <div class="level-left">
            <div class="level-item">
              <h1 class="title">Lobby</h1>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <div
                class="is-flex is-flex-direction-column is-align-items-center"
                in:scale={{ delay: delay(2) }}
              >
                <Code code={data.lobby.code} />
              </div>
            </div>
          </div>
        </div>

        {#if isLocked}
          <h2 class="subtitle">Hold tight</h2>
          <p>There's a game in progress...</p>
        {:else}
          <h2 class="subtitle">Players</h2>

          <div class="tags are-large">
            {#each data.lobby.players as player (player.id)}
              <span class="tag is-dark" in:scale>{player.name}</span>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <section class="section" in:slide={{ delay: delay(1) }}>
      <div class="container is-max-desktop">
        <h2 class="subtitle">Play game</h2>

        <div class="block">
          <form method="POST" use:enhance>
            <div class="field">
              <label class="label" for="game">Game</label>
              <div class="control">
                <div class="select">
                  <select id="game" name="type" value="empty">
                    <option value="empty" disabled>Select a game</option>
                    {#each GAME_TYPES as type}
                      <option value={type}>{type}</option>
                    {/each}
                  </select>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <button class="button is-link" type="submit">Start</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AnimateOnMount>
</main>

<style>
  :global(html) {
    background-image: url(/vector-wallpaper-d53764a5a540a2d890e3a0d85f94e122.png);
  }
</style>
