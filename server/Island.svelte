<script>
  import Counter from "../shared/Counter.svelte";
  import Name from "../shared/Name.svelte";

  export let name;
  export let props;

  /** @TODO This should be auto-generated */
  const islands = {
    Counter,
    Name,
  };
</script>

<island {name} props={JSON.stringify(props)}>
  <svelte:component this={islands[name]} {...props} />
</island>
