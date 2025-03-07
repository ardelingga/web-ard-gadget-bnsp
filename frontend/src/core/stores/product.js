import { defineStore } from 'pinia';
import { ref } from 'vue';
import ApiService from '@/core/services/ApiService';
import swal from 'sweetalert2';

export const useProductStore = defineStore('product', () => {
    const products = ref([]);
    const loading = ref(true);
    const isSubmitting = ref(false);

    async function fetchProducts() {
        const queryParams = {
            sortBy: 'created_at',
            sortOrder: 'desc'
        };

        await ApiService.get('/api/products', queryParams).then((response) => {
            products.value = response.data.data.products;
            loading.value = false;
        });
    }

    // Get detail product
    async function fetchProductDetail(id) {
        try {
            loading.value = true;
            const response = await ApiService.get(`/api/products/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching product detail:', error);
            throw new Error('Gagal mengambil detail produk');
        } finally {
            loading.value = false;
        }
    }

    // Add new product
    async function addProduct(payload) {
        try {
            isSubmitting.value = true;
            // Gunakan FormData untuk mengirim image_file dan data lain sesuai curl
            const formData = new FormData();
            formData.append('image_file', payload.image_file);
            formData.append('name', payload.name);
            formData.append('price', payload.price);
            formData.append('profit', payload.profit);
            formData.append('category_id', payload.category_id);
            formData.append('stock', payload.stock);

            // Kirim request POST untuk membuat produk baru
            const response = await ApiService.post('/api/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Tambahkan produk baru ke daftar lokal
            products.value.push(response.data.data);

            // Tampilkan notifikasi sukses
            await swal.fire('Berhasil', 'Produk berhasil ditambahkan', 'success');
        } catch (error) {
            console.error('Error adding product:', error);
            throw new Error('Gagal menambahkan produk');
        } finally {
            isSubmitting.value = false;
        }
    }

    // Update product
    async function updateProduct(id, payload) {
        try {
            isSubmitting.value = true;

            // Gunakan FormData untuk mengirim data update produk
            const formData = new FormData();
            if (payload.image_file) {
                formData.append('image_file', payload.image_file);
            }
            formData.append('name', payload.name);
            formData.append('price', payload.price);
            formData.append('profit', payload.profit);
            formData.append('category_id', payload.category_id);
            formData.append('stock', payload.stock);

            // Kirim request PATCH untuk memperbarui produk
            const response = await ApiService.patch(`/api/products/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Perbarui produk di daftar lokal
            const index = products.value.findIndex((product) => product.id === id);
            if (index !== -1) {
                products.value[index] = response.data.data;
            }

            // Tampilkan notifikasi sukses
            await swal.fire('Berhasil', 'Produk berhasil diperbarui', 'success');
        } catch (error) {
            console.error('Error updating product:', error);
            throw new Error('Gagal memperbarui produk');
        } finally {
            isSubmitting.value = false;
        }
    }

    // Delete product
    async function deleteProduct(id) {
        try {
            // Konfirmasi penghapusan
            const result = await swal.fire({
                title: 'Apakah Anda yakin?',
                text: 'Produk yang dihapus tidak dapat dikembalikan!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, hapus produk!',
                cancelButtonText: 'Batal'
            });

            if (result.isConfirmed) {
                // Kirim request DELETE untuk menghapus produk
                await ApiService.delete(`/api/products/${id}`);

                // Hapus produk dari daftar lokal
                products.value = products.value.filter((product) => product.id !== id);

                // Tampilkan notifikasi sukses
                await swal.fire('Berhasil', 'Produk berhasil dihapus', 'success');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            await swal.fire('Gagal', 'Gagal menghapus produk', 'error');
        }
    }

    return {
        products,
        loading,
        isSubmitting,
        fetchProducts,
        fetchProductDetail,
        addProduct,
        updateProduct,
        deleteProduct
    };
});
