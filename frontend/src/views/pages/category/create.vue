<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import swal from 'sweetalert2';
import ApiService from '@/core/services/ApiService';
import { useCategoryStore } from '@/core/stores/category';


const categoryStore = useCategoryStore();
const router = useRouter();

const categoryName = ref('');
const isSubmitting = ref(false);





async function addCategory() {
    try {
        // Payload
        const payload = {
            name: categoryName.value,
        };

        console.log("PRINT PAYLOAD")
        console.log(payload)

        // Panggil fungsi addCategory dari store
        await categoryStore.addCategory(payload);

        // Tampilkan notifikasi sukses
        await swal.fire('Berhasil', 'Kategori baru berhasil ditambahkan!', 'success');

        // Reset form
        categoryName.value = '';

        window.location.href = '/kategori-produk';
    } catch (error) {
        await swal.fire('Error', error.message || 'Gagal menambahkan kategori.', 'error');
    }
}
</script>

<template>
    <div class="w-full">
        <!-- Card Formulir Tambah Kategori -->
        <div class="card flex flex-col gap-4">
            <div class="font-semibold text-xl">Tambah Kategori</div>

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

            <Button
                :disabled="isSubmitting"
                icon="pi pi-plus"
                label="Tambah Kategori"
                class="mt-2"
                @click="addCategory"
            />
        </div>
    </div>
</template>

<style scoped>
/* Tambahkan styling opsional jika dibutuhkan */
</style>
