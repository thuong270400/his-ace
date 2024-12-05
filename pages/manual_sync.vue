<template>
  <ManualSync />
</template>

<script>
import ManualSync from "~/components/data_tables/ManualSync.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  name: "ManualSyncPage",
  components: {
    ManualSync,
  },
});
</script>

<style>
</style>