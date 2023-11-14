<script lang="ts">
  import createBtnImg from '$lib/assets/create-btn.gif';
  import joinBtnImg from '$lib/assets/join-btn.gif';
</script>

<main>
  <h2>welcome to the</h2>
  <h1>arcade</h1>

  <ul>
    <li><a href="/join"><img src={joinBtnImg} alt="Join" /></a></li>
    <li><a href="/create"><img src={createBtnImg} alt="Create" /></a></li>
  </ul>
</main>

<style>
  main {
    text-align: center;
  }

  h2 {
    color: var(--pink700);
    margin-bottom: -0.333em;
    font-size: 1.2em;
  }

  h1 {
    color: var(--cyan700);
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
