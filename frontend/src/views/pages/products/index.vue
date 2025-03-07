<script setup>
import { CustomerService } from '@/core/services/CustomerService';
import { ProductService } from '@/core/services/ProductService';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import { useProductStore } from '@/core/stores/product';

const productStore = useProductStore();


onMounted(async () => {
    await productStore.fetchProducts();

    console.log('PRINT CATEGORIES ', productStore.categories);

    // CustomerService.getCustomersLarge().then((data) => {
    //     customers1.value = data;
    //
    //
    //     console.log('PRINT CUSTOMER DATA', data);
    //     // loading1.value = false;
    //     customers1.value.forEach((customer) => (customer.date = new Date(customer.date)));
    // });
});

onBeforeMount(() => {
    // categoryStore.fetchCategories();

    // const categories = categoryStore.categories;
    // categoryStore.fetchCategories().then((response) => {
    //     console.log('PRINT RESPONSE FETCH PRODUCTS', response);
    //     // customers1.value = data;
    // });

    // ProductService.getProductsWithOrdersSmall().then((data) => (products.value = data));
    // CustomerService.getCustomersLarge().then((data) => {
    //     customers1.value = data;
    //
    //
    //     console.log('PRINT CUSTOMER DATA', data);
    //
    //     loading1.value = false;
    //     customers1.value.forEach((customer) => (customer.date = new Date(customer.date)));
    // });
    // CustomerService.getCustomersLarge().then((data) => (customers2.value = data));
    // CustomerService.getCustomersMedium().then((data) => (customers3.value = data));
});

function formatCurrency(value) {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}


function formatDate(dateString) {
    if (!dateString) return 'N/A'; // Handle empty date
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short', // Short month format ("Jan", "Feb", etc.)
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24-hour format
    });
}


async function handleDeleteProduct(id) {
    try {
        await productStore.deleteProduct(id);
    } catch (error) {
        console.error('Gagal menghapus product:', error);
    }
}
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl">Daftar Produk</div>
        <router-link to="/daftar-produk/create">
            <Button icon="pi pi-plus" class="mt-5 mb-4" label="Tambah" />
        </router-link>
        <DataTable :value="productStore.products" :responsiveLayout="'scroll'" :paginator="true" :rows="10">
            <!-- Incremental Row Number -->
            <Column header="No">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>

            <Column header="Thumbnail" sortable>
                <template #body="slotProps">
                    <img
                        :src="slotProps.data.image_url"
                        alt="Product Thumbnail"
                        class="w-16 h-16 object-cover rounded-md"
                    />
                </template>
            </Column>
            <Column field="category.name" header="Kategory" sortable></Column>
            <Column field="name" header="Nama Produk" sortable></Column>
            <Column field="code" header="Kode Produk" sortable></Column>
            <Column header="Harga" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.price) }}
                </template>
            </Column>
            <Column field="profit" header="Profit" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.profit) }}
                </template>
            </Column>
            <Column field="stock" header="Stok" sortable></Column>

            <!-- Formatter untuk Created At -->
            <Column header="Created At">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.created_at) }}
                </template>
            </Column>

            <!--            Action Column-->
            <Column header="Action">
                <template #body="slotProps">
                    <router-link :to="`/daftar-produk/edit/${slotProps.data.id}`">
                        <Button icon="pi pi-pencil" class="p-button p-component p-button-icon-only p-button-info p-button-rounded mr-2" />
                    </router-link>
                    <Button @click="handleDeleteProduct(slotProps.data.id)"
                            icon="pi pi-trash" class="p-button p-component p-button-icon-only p-button-danger p-button-rounded" />
                </template>
            </Column>
        </DataTable>


    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
