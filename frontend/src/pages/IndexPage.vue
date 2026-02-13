<template>
  <div class="container">
    <h1>Api Demo</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="content">
      <p><strong>Message:</strong> {{ data.message }}</p>
      <div class="info-box">
        <h3>Backend Info:</h3>
        <p><strong>Git Commit:</strong> {{ data.data?.git }}</p>
        <p><strong>Docker Version:</strong> {{ data.data?.docker }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const data = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log('Fetching from:', `${apiUrl}/api/demo`);
    const response = await axios.get(`${apiUrl}/api/demo`);
    data.value = response.data;
  } catch (err) {
    error.value = 'Failed to fetch data: ' + (err.response?.data?.message || err.message);
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  text-align: center;
}

.error {
  color: red;
  font-weight: bold;
}

.info-box {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: left;
  display: inline-block;
}

.content {
  margin-top: 2rem;
}
</style>
