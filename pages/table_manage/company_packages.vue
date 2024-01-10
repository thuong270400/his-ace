<template>
  <CompanyServicePacks />
</template>
<script>
import CompanyServicePacks from "~/components/data_tables/CompanyServicePacks.vue";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";

export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
    };
  },
  name: "HomePage",
  components: {
    CompanyServicePacks,
  },
});
</script>

<style scoped>
.background_style {
}
</style>