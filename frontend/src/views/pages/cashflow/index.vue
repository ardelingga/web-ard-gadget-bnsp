<script setup>
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import { useCashflowStore } from '@/core/stores/cashflow';

const cashflowStore = useCashflowStore();



onMounted(async () => {
    await cashflowStore.fetchCashflows();

    console.log('PRINT CATEGORIES ', cashflowStore.cashflows);
});

onBeforeMount(() => {

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


async function handleDeleteCashflow(id) {
    try {
        await cashflowStore.deleteCashflow(id);
    } catch (error) {
        console.error('Gagal menghapus product:', error);
    }
}
</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl">Arus Kas Toko</div>
        <router-link to="/arus-kas/create">
            <Button icon="pi pi-plus" class="mt-5 mb-4" label="Tambah" />
        </router-link>
        <DataTable :value="cashflowStore.cashflows" :responsiveLayout="'scroll'" :paginator="true" :rows="10">
            <!-- Incremental Row Number -->
            <Column header="No">
                <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                </template>
            </Column>



            <Column header="Tanggal">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.date) }}
                </template>
            </Column>
            <Column header="Jumlah" sortable>
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.value) }}
                </template>
            </Column>
            <Column field="type" header="Tipe" sortable></Column>
            <Column field="description" header="Keterangan" sortable></Column>


            <Column header="Action">
                <template #body="slotProps">
                    <router-link :to="`/arus-kas/edit/${slotProps.data.id}`">
                        <Button icon="pi pi-pencil" class="p-button p-component p-button-icon-only p-button-info p-button-rounded mr-2" />
                    </router-link>
                    <Button @click="handleDeleteCashflow(slotProps.data.id)"
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
