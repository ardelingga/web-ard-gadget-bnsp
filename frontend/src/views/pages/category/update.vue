<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import swal from 'sweetalert2';
import ApiService from '@/core/services/ApiService'; // Untuk API request
import { useCategoryStore } from '@/core/stores/category'; // Import Store

// Store
const categoryStore = useCategoryStore();
const router = useRouter();
const route = useRoute();

// State untuk Form
const categoryName = ref('');
const isSubmitting = ref(false);
const categoryId = ref(null);


async function fetchCategoryById() {
    try {
        categoryId.value = route.params.id;
        const response = await ApiService.get(`/api/categories/${categoryId.value}`);
        categoryName.value = response.data.data.name;
    } catch (error) {
        console.error('Error fetching category:', error);
        await swal.fire('Error', error.message || 'Gagal mendapatkan data kategori.', 'error');
    }
}

async function updateCategory() {
    try {
        const payload = {
            name: categoryName.value,
        };

        // Panggil fungsi updateCategory dari store
        await categoryStore.updateCategory(categoryId.value, payload);

        // Navigasi kembali ke halaman daftar kategori
        router.push('/kategori-produk');
    } catch (error) {
        await swal.fire('Error', error.message || 'Gagal memperbarui kategori.', 'error');
    }
}


// Panggil fungsi fetch data saat komponen dimuat
onMounted(() => {
    fetchCategoryById();
});
</script>

<template>
    <div class="w-full">
        <!-- Card Formulir Edit Kategori -->
        <div class="card flex flex-col gap-4">
            <div class="font-semibold text-xl">Edit Kategori</div>

            <!-- Input Nama Kategori -->
            <div>
                <label for="category-name" class="block font-semibold mb-2">Nama Kategori</label>
                <InputText
                    id="category-name"
                    class="h-12 w-full"
                    v-model="categoryName"
                    type="text"
                    placeholder="Masukkan nama kategori"
                    :disabled="isSubmitting"
                />
            </div>

            <!-- Tombol Update -->
            <Button
                :disabled="isSubmitting"
                icon="pi pi-save"
                label="Simpan Perubahan"
                class="mt-2"
                @click="updateCategory"
            />
        </div>
    </div>
</template>

<style scoped>
/* Tambahkan styling opsional jika dibutuhkan */
</style>
