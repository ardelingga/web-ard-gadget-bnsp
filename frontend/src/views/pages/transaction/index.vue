<script setup>
import { onMounted, ref, computed } from 'vue';
import { useProductStore } from '@/core/stores/product';
import Swal from 'sweetalert2';
import ApiService from '@/core/services/ApiService';
import { useTransactionStore } from '@/core/stores/transaction';
import { useRouter } from 'vue-router';

// Store untuk data produk
const transactionStore = useTransactionStore();
const productStore = useProductStore();
const router = useRouter();

const cart = ref([]);

// State lainnya
const layout = ref('grid');
const options = ref(['grid', 'list']);

// Fetch data produk
onMounted(async () => {
    await productStore.fetchProducts();
});

// Data produk yang diambil dari store
const products = computed(() => productStore.products);

// Fungsi untuk menambah produk ke keranjang
function addToCart(product) {
    const existingProduct = cart.value.find((item) => item.id === product.id);
    if (existingProduct) {
        // Jika produk sudah ada di keranjang, tambahkan quantity
        existingProduct.quantity += 1;
    } else {
        // Jika produk belum ada, tambahkan ke keranjang
        cart.value.push({ ...product, quantity: 1 });
    }
}

// Fungsi untuk menghapus produk dari keranjang
function removeFromCart(product) {
    cart.value = cart.value.filter((item) => item.id !== product.id);
}

// Fungsi untuk menambah atau mengurangi jumlah produk di keranjang
function updateCartQuantity(product, qty) {
    const existingProduct = cart.value.find((item) => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += qty;
        if (existingProduct.quantity <= 0) {
            removeFromCart(product);
        }
    }
}

function formatCurrency(value) {
    return value.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Hitung total harga dalam keranjang
const cartTotal = computed(() => cart.value.reduce((total, item) => total + item.price * item.quantity, 0));

// Fungsi uang pembayaran
const cash = ref(0); // Nilai uang yang diberikan pelanggan
const moneys = [2000, 5000, 10000, 20000, 50000, 100000]; // Tombol nominal uang

function updateCash(value) {
    cash.value = parseInt(value.replace(/[^\d]/g, '')) || 0; // Pastikan input hanya angka
}

function addCash(amount) {
    cash.value += amount; // Tambah nominal ke cash pelanggan
}

// Hitung kembalian
const change = computed(() => {
    return cash.value - cartTotal.value; // Kembalian = Cash - Total Belanja
});

function clearCash() {
    cash.value = 0; // Mengatur ulang nilai cash menjadi 0
}

function handleCashInput(event) {
    const value = event.target.value.replace(/[^\d]/g, ''); // Hanya angka
    cash.value = parseInt(value) || 0; // Konversi ke angka, default 0 jika kosong
}

// Fungsi Menampilkan Preview Transaksi
function previewTransaction() {
    // Buat konten untuk tabel pesanan di SweetAlert
    const cartHtml = cart.value
        .map(
            (item) =>
                `<tr style="padding: 8px 0;">
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name} x${item.quantity}</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${formatCurrency(item.price * item.quantity)}</td>
                </tr>`
        )
        .join('');

    // SweetAlert untuk Preview Transaksi
    Swal.fire({
        title: 'Preview Transaksi',
        html: `
            <div style="text-align: left; padding: 10px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding-bottom: 8px;">Item</th>
                            <th style="text-align: right; padding-bottom: 8px;">Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cartHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="text-align: left; font-weight: bold; border-top: 2px solid #ddd; padding-top: 8px;">Total:</td>
                            <td style="text-align: right; font-weight: bold; border-top: 2px solid #ddd; padding-top: 8px;">${formatCurrency(cartTotal.value)}</td>
                        </tr>
                        <tr>
                            <td style="text-align: left; font-weight: bold; padding-top: 8px;">Total Bayar:</td>
                            <td style="text-align: right; font-weight: bold; padding-top: 8px;">${formatCurrency(cash.value)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top: 50px; text-align: left;">
                    <label for="customerName" style="font-weight: bold; margin-bottom: 5px;">Nama Pelanggan:</label>
                    <input id="customerName" type="text" placeholder="Masukkan nama pelanggan" style="width: 100%; padding: 8px; margin-top: 8px; border: 1px solid #ddd; border-radius: 5px;" />

                    <div id="changeDisplay" style="margin-top: 15px; font-weight: bold;"></div>
                </div>

            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Proses Transaksi',
        cancelButtonText: 'Batal',
        focusConfirm: false,
        customClass: {
            popup: 'swal-wide',
            confirmButton: 'bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200',
            cancelButton: 'bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200'
        },
        preConfirm: () => {
            const customerName = document.getElementById('customerName').value;

            return customerName;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const customerName = result.value;
            const totalPayment = cash.value;

            console.log("PRINT CUSTOMER NAME :");
            console.log(customerName);

            console.log("TOTAL PAYMENT :");
            console.log(totalPayment);

            const detailTransactions = cart.value.map(item => ({
                product_id: item.id, // ID produk diambil dari cart.value
                quantity: item.quantity // Quantity produk diambil dari cart.value
            }));

            // Buat payload JSON
            const payload = {
                customer_name: customerName,
                total_payment: totalPayment,
                detail_transactions: detailTransactions
            };

            console.log("PAYLOAD JSON :");
            console.log(payload);
            processTransaction(payload);
        }
    });
}

// Fungsi Proses Transaksi
async function processTransaction(payload) {
    try {
        await transactionStore.addTransaction(payload);
        await router.push('/');
    } catch (error) {
        // Jika terjadi kesalahan, tampilkan pesan error
        Swal.fire({
            title: 'Terjadi Kesalahan',
            text: 'Gagal memproses transaksi!',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}
</script>

<template>
    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Bagian untuk daftar produk -->
        <div class="lg:w-2/3">
            <div class="card">
                <div class="font-semibold text-xl">Tambah Transaksi</div>
                <div class="font-semibold text-md mt-7">Daftar Produk</div>

                <!-- Menubar untuk filter dan layout -->
                <Menubar class="mt-3">
                    <template #start>
                        <InputText type="text" placeholder="Search" />
                    </template>
                    <template #end>
                        <SelectButton v-model="layout" :options="options">
                            <template #option="{ option }">
                                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
                            </template>
                        </SelectButton>
                    </template>
                </Menubar>

                <!-- Tampilan daftar produk -->
                <DataView :value="products" :layout="layout">
                    <template #list="slotProps">
                        <div class="flex flex-col">
                            <div v-for="(item, index) in slotProps.items" :key="index" class="flex items-center gap-4 p-4 border-b">
                                <img :src="`${item.image_url}`" alt="Product Image" class="w-16 h-16 rounded" />
                                <div class="flex-1">
                                    <div class="text-lg font-medium">{{ item.name }}</div>
                                    <div class="text-sm text-gray-500">
                                        Kategori: <br />
                                        {{ item.category.name }}
                                    </div>
                                    <div class="text-sm font-semibold mt-3">{{ formatCurrency(item.price) }}</div>
                                </div>
                                <Button icon="pi pi-shopping-cart" label="Add to Cart" @click="addToCart(item)" :disabled="item.inventoryStatus === 'OUTOFSTOCK'" class="p-button-sm" />
                            </div>
                        </div>
                    </template>
                    <template #grid="slotProps">
                        <div class="grid grid-cols-12 gap-4">
                            <div v-for="(item, index) in slotProps.items" :key="index" class="col-span-12 sm:col-span-6 lg:col-span-4 p-2">
                                <div class="p-4 border border-surface-200 rounded bg-white shadow flex flex-col">
                                    <div class="bg-neutral-100 flex justify-center rounded p-4">
                                        <img :src="item.image_url" :alt="item.name" class="w-40 rounded" />
                                    </div>
                                    <div class="text-lg text-black mt-4">{{ item.name }}</div>
                                    <div class="text-sm text-gray-500 mt-1">
                                        {{ item.category.name }}
                                    </div>
                                    <div class="mt-4 text-lg font-semibold">
                                        {{ formatCurrency(item.price) }}
                                    </div>
                                    <Button label="Add to Cart" icon="pi pi-shopping-cart" class="mt-4" @click="addToCart(item)" />
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
            </div>
        </div>

        <!-- Bagian untuk keranjang -->
        <div class="lg:w-1/3">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Keranjang</div>
                <div v-if="cart.length > 0">
                    <!-- Tampilkan produk dalam keranjang -->
                    <div v-for="(item, index) in cart" :key="index" class="flex items-center gap-4 py-2 border-b">
                        <img :src="`${item.image_url}`" alt="Product Image" class="w-12 h-12 rounded" />
                        <div class="flex-1">
                            <div class="text-lg font-medium">{{ item.name }}</div>
                            <div class="text-sm">Quantity: {{ item.quantity }}</div>
                            <div class="text-sm font-semibold">{{ formatCurrency(item.price * item.quantity) }}</div>
                        </div>
                        <div class="flex gap-2">
                            <Button icon="pi pi-minus" outlined @click="updateCartQuantity(item, -1)" />
                            <Button icon="pi pi-plus" outlined @click="updateCartQuantity(item, 1)" />
                            <Button icon="pi pi-trash" class="p-button-danger" outlined @click="removeFromCart(item)" />
                        </div>
                    </div>

                    <!-- Total Harga -->
                    <div class="text-xl font-semibold mt-4">Total: {{ formatCurrency(cartTotal) }}</div>

                    <!-- Input Cash -->
                    <div class="mb-3 text-blue-gray-700 px-3 pt-2 pb-3 rounded-lg bg-blue-gray-50 mt-6">
                        <div class="flex text-lg font-semibold">
                            <div class="flex-grow text-left">CASH</div>
                            <div class="flex text-right">
                                <input :value="formatCurrency(cash)" @input="handleCashInput" type="text" class="w-28 text-right bg-white shadow rounded-lg focus:bg-white focus:shadow-lg px-2 focus:outline-none" />
                                <Button icon="pi pi-times" @click="clearCash" class="ml-2 p-button p-component p-button-icon-only p-button-danger p-button-rounded" />
                            </div>
                        </div>
                        <hr class="my-2" />

                        <!-- Tombol Nominal Uang -->
                        <div class="grid grid-cols-3 gap-2 mt-2">
                            <button v-for="money in moneys" :key="money" @click="addCash(money)" class="bg-white rounded-lg shadow hover:shadow-lg focus:outline-none inline-block px-2 py-1 text-sm">+{{ formatCurrency(money) }}</button>
                        </div>
                    </div>

                    <!-- Info Kembalian -->
                    <div v-if="change >= 0" class="flex mb-3 text-lg font-semibold bg-cyan-50 text-blue-gray-700 rounded-lg py-2 px-3">
                        <div class="text-cyan-800">CHANGE</div>
                        <div class="text-right flex-grow text-cyan-600">{{ formatCurrency(change) }}</div>
                    </div>
                    <div v-else class="flex mb-3 text-lg font-semibold bg-pink-100 text-blue-gray-700 rounded-lg py-2 px-3">
                        <div class="text-pink-600">Uang Kurang!</div>
                        <div class="text-right flex-grow text-pink-600">{{ formatCurrency(change) }}</div>
                    </div>

                    <!-- Tombol Checkout -->
                    <button @click="previewTransaction()" class="bg-green-500 text-white px-4 py-2 mt-3 w-full rounded-lg hover:bg-green-600 transition duration-200">Checkout</button>
                </div>
                <div v-else class="text-center text-gray-500 py-8">Keranjang Kosong</div>
            </div>
        </div>
    </div>
</template>

<style>
/* Untuk transisi modal */
.modal-overlay {
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease-in-out;
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* Untuk kontrol tombol */
button {
    cursor: pointer;
}

/* Modal responsif & shadow */
.box-shadow {
    box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.1);
}

.rounded-xl {
    border-radius: 12px;
}
</style>
