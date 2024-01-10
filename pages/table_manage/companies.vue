<template>
  <Companies />
</template>
<script>
import Companies from "~/components/data_tables/Companies.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  name: "CompanyPage",
  components: {
    Companies,
  },
});
</script>

<style scoped>
.background_style {
}
</style>