<script>
  /** @type {string} */
  export let value;
</script>

Well, hello there, {value}!

<label>
  Your name:
  <input type="text" bind:value />
</label>

<style>
  input {
    border: 2px solid maroon;
    border-radius: 4px;
  }

  label {
    margin-top: 0.5rem;
    display: block;
  }
</style>
