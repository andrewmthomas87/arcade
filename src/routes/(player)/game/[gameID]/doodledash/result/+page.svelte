<script>
  import { enhance } from '$app/forms';
  import { delay } from '$lib/animation';
  import AnimateOnMount from '$lib/components/AnimateOnMount.svelte';
  import { slide } from 'svelte/transition';
</script>

<main class="has-background-darkened-er">
  <AnimateOnMount>
    <section class="section" in:slide={{ delay: delay(0) }}>
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
