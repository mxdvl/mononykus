<script>
  import Counter from "../shared/Counter.svelte";
  import Name from "../shared/Name.svelte";

  /** @type {keyof islands} */
  export let name;
  /** @type {Record<string, string | number | boolean | null>} */
  export let props;

  /** @TODO This should be auto-generated */
  const islands = {
    Counter,
    Name,
  };
</script>

<one-claw {name} props={JSON.stringify(props)}>
  <svelte:component this={islands[name]} {...props} />
</one-claw>
