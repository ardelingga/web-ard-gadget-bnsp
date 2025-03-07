<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import swal from 'sweetalert2';
import { useProductStore } from '@/core/stores/product';
import { useCategoryStore } from '@/core/stores/category';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const router = useRouter();

const name = ref('');
const price = ref('');
const profit = ref('');
const categoryId = ref('');
const stock = ref('');
const imageFile = ref(null);
const previewUrl = ref(null);
const isSubmitting = ref(false);

// Fetch categories (opsional, jika kategori diperlukan dari store)
// await categoryStore.fetchCategories();

console.log('PRINT DATA CATEGORY');
console.log(categoryStore.categories);

onMounted(async () => {
    await categoryStore.fetchCategories();
});

// Fungsi Tambah Produk
async function addProduct() {
    try {
        isSubmitting.value = true;

        const payload = {
            name: name.value,
            price: price.value,
            profit: profit.value,
            category_id: categoryId.value,
            stock: stock.value,
            image_file: imageFile.value
        };

        console.log('PRINT IMAGE FILE:');
        console.log(imageFile.value);

        // Panggil fungsi addProduct dari store
        await productStore.addProduct(payload);

        // Reset Form
        name.value = '';
        price.value = '';
        profit.value = '';
        categoryId.value = '';
        stock.value = '';
        imageFile.value = null;

        // Redirect ke halaman daftar produk
        router.push('/daftar-produk');
    } catch (error) {
        console.error(error);
        await swal.fire('Error', error.message || 'Gagal menambahkan produk.', 'error');
    } finally {
        isSubmitting.value = false;
    }
}

function handleFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        imageFile.value = file;
        previewUrl.value = URL.createObjectURL(file); // Membuat URL untuk preview
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
        <!-- Card Formulir Tambah Produk -->
        <div class="card flex flex-col gap-4">
            <div class="font-semibold text-xl">Tambah Produk</div>

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
                <input id="image-file" ref="imageInput" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
            </div>

            <!-- Input Nama Produk -->
            <div>
                <label for="product-name" class="block font-medium mb-2">Nama Produk</label>
                <InputText id="product-name" v-model="name" class="w-full h-12" type="text" placeholder="Masukkan nama produk" :disabled="isSubmitting" />
            </div>

            <!-- Input Harga Produk -->
            <div>
                <label for="price" class="block font-medium mb-2">Harga Produk</label>
                <InputText id="price" v-model="price" class="w-full h-12" type="number" placeholder="Masukkan harga produk" :disabled="isSubmitting" />
            </div>

            <!-- Input Profit -->
            <div>
                <label for="profit" class="block font-medium mb-2">Profit</label>
                <InputText id="profit" v-model="profit" class="w-full h-12" type="number" placeholder="Masukkan profit produk" :disabled="isSubmitting" />
            </div>

            <!-- Input Kategori Produk -->
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
                    :disabled="isSubmitting || categoryStore.loading"
                />
            </div>

            <!-- Input Stok Produk -->
            <div>
                <label for="stock" class="block font-medium mb-2">Stok Produk</label>
                <InputText id="stock" v-model="stock" class="w-full h-12" type="number" placeholder="Masukkan jumlah stok" :disabled="isSubmitting" />
            </div>

            <!-- Tombol Tambah Produk -->
            <Button :disabled="isSubmitting" icon="pi pi-plus" label="Tambah Produk" class="mt-2" @click="addProduct" />
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
