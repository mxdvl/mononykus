<script>
  export let component;
  export let name;
</script>

<island {name} props={JSON.stringify($$props)}>
  <svelte:component this={component} />
</island>
