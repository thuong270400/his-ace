<!-- components/CenteredText.vue -->

<template>
  <v-container class="fill-height">
    <v-row>
      <v-col cols="auto">
        <v-card
          class="d-flex align-center justify-center"
          width="15vw"
          height="15vw"
        >
          <div class="text-center">
            <v-progress-circular
              :rotate="360"
              :size="200"
              :width="30"
              :model-value="value"
              color="rgb(39, 220, 159)"
            >
              <template v-slot:default> {{ value }} % </template>
            </v-progress-circular>
          </div>
        </v-card>
      </v-col>
      <v-col cols="auto">
        <v-card width="50vw" height="15vw" class="pa-2 custom-card">
          <v-card flat>
            <div>
              <div class="pa-2">
                <v-progress-linear
                  indeterminate
                  color="yellow-darken-2"
                ></v-progress-linear>
                <br />
                <v-progress-linear
                  indeterminate
                  reverse
                  color="green"
                ></v-progress-linear>
                <br />
                <v-progress-linear
                  indeterminate
                  reverse
                  color="yellow"
                ></v-progress-linear>
                <br />
                <v-progress-linear
                  indeterminate
                  color="teal"
                ></v-progress-linear>
                <br />
                <v-progress-linear
                  indeterminate
                  reverse
                  color="cyan"
                ></v-progress-linear>
                <br />
                <v-progress-linear
                  indeterminate
                  reverse
                  color="purple"
                ></v-progress-linear>
                <br />
                <v-progress-linear
                  indeterminate
                  color="primary"
                ></v-progress-linear>
              </div>
            </div>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto" class="text-center">
        <v-card
          width="25vw"
          height="20vw"
          class="d-flex align-center justify-center"
        >
          <v-skeleton-loader
            class="mx-auto border"
            width="100%"
            height="100%"
            type="card-avatar, actions"
          ></v-skeleton-loader>
        </v-card>
      </v-col>

      <v-col cols="auto" class="text-center">
        <v-card
          width="25vw"
          height="20vw"
          class="d-flex align-center justify-center"
        >
          <v-row justify="center">
            <v-col>
              <v-btn class="text-none" stacked>
                <v-badge dot color="success">
                  <v-icon>mdi-home-outline</v-icon>
                </v-badge>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn class="text-none" stacked>
                <v-icon>mdi-account-multiple-outline</v-icon>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn class="text-none" stacked>
                <v-badge content="9+" color="error">
                  <v-icon>mdi-store-outline</v-icon>
                </v-badge>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn class="text-none" stacked>
                <v-badge content="2" color="error">
                  <v-icon>mdi-bell-outline</v-icon>
                </v-badge>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn class="text-none" stacked>
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn class="text-none" stacked>
                <v-badge content="3" color="primary">
                  <v-icon>mdi-package-variant-closed</v-icon>
                </v-badge>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn class="text-none" stacked>
                <v-badge dot color="success">
                  <v-icon>mdi-comment-processing-outline</v-icon>
                </v-badge>
              </v-btn>
            </v-col>
            <v-col>
              <v-btn class="text-none" stacked>
                <v-icon>mdi-cloud</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="auto" class="text-center">
        <v-card class="pa-2" width="15vw" height="40vw">
          <v-card class="ma-2">
            <div class="text-center">
              <v-rating
                v-model="rating"
                color="orange-lighten-1"
                active-color="blue"
                density="comfortable"
              ></v-rating>
            </div>
          </v-card>

          <v-card class="ma-2">
            <div class="text-center">
              <v-rating
                v-model="rating"
                color="orange-lighten-1"
                active-color="blue"
                density="comfortable"
              ></v-rating>
            </div>
          </v-card>

          <v-card class="ma-2">
            <div class="text-center">
              <v-rating
                v-model="rating"
                color="orange-lighten-1"
                active-color="blue"
                density="comfortable"
              ></v-rating>
            </div>
          </v-card>

          <v-card class="ma-2">
            <div class="text-center">
              <v-rating
                v-model="rating"
                color="orange-lighten-1"
                active-color="blue"
                density="comfortable"
              ></v-rating>
            </div>
          </v-card>

          <v-card class="ma-2">
            <div class="text-center">
              <v-rating
                v-model="rating"
                color="orange-lighten-1"
                active-color="blue"
                density="comfortable"
              ></v-rating>
            </div>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "CenteredText",
  data() {
    return {
      interval: -1,
      value: 0,
      rating: 5,
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.value === 100) {
        return (this.value = 0);
      }
      this.value += 10;
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
.custom-card {
  display: flex;
  justify-content: center;
  align-items: center;
}
.fill-height {
  min-height: 90vh; /* Chiều cao tối thiểu là 100% của viewport height */
}
.hello {
  color: rgb(39, 220, 159);
  font-size: 10vh;
}
.v-progress-circular {
  margin: 1rem;
}
.v-progress-linear {
  width: 50vw;
}
</style>
