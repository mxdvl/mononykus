<script>
  import Images from "../shared/Images.svelte";

  /** @type {keyof islands} */
  export let name;
  /** @type {Record<string, string | number | boolean | null>} */
  export let props;

  /** @TODO This should be auto-generated */
  const islands = {
    Images,
  };
</script>

<one-claw {name} props={JSON.stringify(props)}>
  <svelte:component this={islands[name]} {...props} />
</one-claw>
