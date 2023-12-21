<script lang="ts">
  import createBtnImg from '$lib/assets/create-btn.gif';
  import joinBtnImg from '$lib/assets/join-btn.gif';
</script>

<main>
  <section>
    <h2>welcome to the</h2>
    <h1>arcade</h1>

    <ul>
      <li><a href="/join"><img src={joinBtnImg} alt="Join" /></a></li>
      <li><a href="/create"><img src={createBtnImg} alt="Create" /></a></li>
    </ul>
  </section>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
    text-align: center;
  }

  section {
    padding: 4em 0;
  }

  h2 {
    color: var(--foreground);
    margin-bottom: -0.333em;
    font-size: 1.2em;
  }

  h1 {
    color: var(--foreground);
    font-size: 3em;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 12px;
  }

  a {
    display: inline-block;
  }

  img {
    width: 380px;
    image-rendering: pixelated;
  }
</style>
