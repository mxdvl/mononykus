<script>
  export let name;
  export let component;
  export let props;
</script>

<island {name} props={JSON.stringify(props)}>
  <svelte:component this={component} {...props} />
</island>
