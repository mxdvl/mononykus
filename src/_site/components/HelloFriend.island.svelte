<script>
  /** @type {string} */
  export let value;
</script>

<p>
  Well, hello there, {value}!
</p>

<input type="text" bind:value />

<em>(try changing this name)</em>

<style>
  input {
    border: 2px solid maroon;
    border-radius: 4px;
  }
</style>
