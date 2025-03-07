import { defineStore } from 'pinia';
import { ref } from 'vue';
import ApiService from '@/core/services/ApiService';
import swal from 'sweetalert2';

export const useCategoryStore = defineStore('category', () => {
    const categories = ref([]);
    const loading = ref(true);
    const isSubmitting = ref(false);

    // Fetch daftar kategori
    async function fetchCategories() {
        await ApiService.get('/api/categories').then((response) => {
            categories.value = response.data.data;
            loading.value = false;
        });
    }

    // Tambah kategori baru
    async function addCategory(payload) {
        try {
            isSubmitting.value = true;

            // Kirim data kategori ke API
            const response = await ApiService.post('/api/categories', payload);

            // Perbarui daftar kategori dengan data baru
            categories.value.push(response.data.category);

            return response.data;
        } catch (error) {
            console.error('Error adding category:', error);
            throw new Error(error.response?.data?.message || 'Gagal menambah kategori.');
        } finally {
            isSubmitting.value = false;
        }
    }

    // Hapus kategori berdasarkan ID
    async function deleteCategory(id) {
        try {
            // Konfirmasi penghapusan dengan swal
            const result = await swal.fire({
                title: 'Apakah Anda yakin?',
                text: 'Kategori yang dihapus tidak dapat dikembalikan!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, hapus kategori ini!',
                cancelButtonText: 'Batal'
            });

            if (result.isConfirmed) {
                // Kirim request ke API untuk menghapus kategori
                await ApiService.delete(`/api/categories/${id}`);

                // Hapus kategori dari categories.value lokal
                categories.value = categories.value.filter((category) => category.id !== id);

                // Menampilkan notifikasi sukses
                await swal.fire('Berhasil!', 'Kategori berhasil dihapus.', 'success');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            await swal.fire('Error', error.message || 'Gagal menghapus kategori.', 'error');
        }
    }

    return {
        categories,
        loading,
        isSubmitting,
        fetchCategories,
        addCategory,
        deleteCategory
    };
});
