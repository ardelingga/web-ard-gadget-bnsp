<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import swal from 'sweetalert2';
import { useProductStore } from '@/core/stores/product';
import { useCategoryStore } from '@/core/stores/category';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const router = useRouter();
const route = useRoute();

const product = ref(null);
const name = ref('');
const price = ref('');
const profit = ref('');
const categoryId = ref('');
const stock = ref('');
const imageFile = ref(null);
const previewUrl = ref(null);
const isSubmitting = ref(false);

// Memuat product ID dari URL
const productId = route.params.id;

// Fungsi untuk memuat data produk berdasarkan ID
async function fetchProductData() {
    // Ambil data produk dari store (simulasi dari backend)
    product.value = await productStore.fetchProductDetail(productId);

    // Isi form dengan data produk yang ada
    if (product.value) {
        name.value = product.value.name;
        price.value = product.value.price;
        profit.value = product.value.profit;
        categoryId.value = product.value.category_id;
        stock.value = product.value.stock;
        previewUrl.value = product.value.image_url; // URL gambar dari backend
    }
}

// Memuat kategori (jika data kategori digunakan)
onMounted(async () => {
    await categoryStore.fetchCategories();
    await fetchProductData();
    if (product.value) {
        categoryId.value = product.value.category.id;
    }


});

// Fungsi untuk mengupdate produk
async function updateProduct() {
    try {
        isSubmitting.value = true;

        const payload = {
            name: name.value,
            price: price.value,
            profit: profit.value,
            category_id: categoryId.value,
            stock: stock.value,
            ...(imageFile.value && { image_file: imageFile.value }) // Tambahkan gambar hanya jika ada file baru
        };

        // Panggil fungsi `updateProduct` di store
        await productStore.updateProduct(productId, payload);

        // Redirect ke halaman daftar produk
        router.push('/daftar-produk');
    } catch (error) {
        console.error(error);
        await swal.fire('Error', error.message || 'Gagal memperbarui produk.', 'error');
    } finally {
        isSubmitting.value = false;
    }
}

// Fungsi menangani input file
function handleFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        imageFile.value = file;
        previewUrl.value = URL.createObjectURL(file);
    } else {
        alert('Harap unggah file gambar saja.');
        clearImage();
    }
}

// Fungsi drag and drop
function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
        imageFile.value = file;
        previewUrl.value = URL.createObjectURL(file);
    } else {
        alert('Harap unggah file gambar saja.');
        clearImage();
    }
}

// Fungsi untuk menghapus file
function clearImage() {
    imageFile.value = null;
    previewUrl.value = null;
}

function handleDragOver(event) {
    event.preventDefault();
}
</script>

<template>
    <div class="w-full">
        <!-- Card Formulir Update Produk -->
        <div class="card flex flex-col gap-4">
            <div class="font-semibold text-xl">Update Produk</div>

            <!-- Upload Gambar Produk -->
            <div class="mt-4">
                <!-- Container Drag and Drop -->
                <div class="drag-drop-container border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer" @click="$refs.imageInput.click()" @dragover="handleDragOver" @drop="handleDrop">
                    <!-- Elemen Teks (Hanya Tampil Jika Tidak Ada Preview Gambar) -->
                    <p v-if="!previewUrl" class="text-gray-500 text-sm">Drag & Drop atau klik untuk memilih gambar</p>

                    <!-- Preview Gambar -->
                    <div v-if="previewUrl" class="mt-4">
                        <img :src="previewUrl" class="mx-auto w-40 h-40 object-cover rounded shadow" alt="Image Preview" />
                        <button @click.stop="clearImage" class="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Hapus Gambar</button>
                    </div>
                </div>

                <!-- Hidden Input File -->
                <input id="image-file" ref="imageInput" type="file" class="hidden" @change="handleFileChange" />
            </div>

            <!-- Form Inputs -->
            <div>
                <label for="name" class="block font-medium mb-2">Nama Produk</label>
                <InputText id="name" v-model="name" type="text" placeholder="Masukkan nama produk" class="input w-full" />
            </div>

            <div>
                <label for="price" class="block font-medium mb-2">Harga Produk</label>
                <InputText id="price" v-model="price" type="number" placeholder="Masukkan harga produk" class="input w-full" />
            </div>

            <div>
                <label for="profit" class="block font-medium mb-2">Profit</label>
                <InputText id="profit" v-model="profit" type="number" placeholder="Masukkan nilai keuntungan" class="input w-full" />
            </div>

            <div>
                <label for="category-id" class="block font-medium mb-2">Kategori Produk</label>
                <Dropdown
                    id="category-id"
                    v-model="categoryId"
                    :options="categoryStore.categories.map((category) => ({ label: category.name, value: category.id }))"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih kategori"
                    class="w-full"
                    :disabled="categoryStore.loading"
                />
            </div>

            <div>
                <label for="stock" class="block font-medium mb-2">Stok Produk</label>
                <InputText id="stock" v-model="stock" type="number" placeholder="Masukkan jumlah stok" class="input w-full" />
            </div>

            <!-- Tombol Update -->
            <div class="mt-4">
                <button @click="updateProduct" :disabled="isSubmitting" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                    {{ isSubmitting ? 'Updating...' : 'Update Produk' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.drag-drop-container {
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.drag-drop-container:hover {
    border-color: #4caf50; /* Border warna hijau saat hover */
}
</style>
