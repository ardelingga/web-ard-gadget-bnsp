<script setup>
import { onMounted } from 'vue';
import { useDashboardStore } from '@/core/stores/dashboard';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';

// Gunakan store dashboard
const dashboardStore = useDashboardStore();

// Fetch data saat komponen dimuat
onMounted(async () => {
    await dashboardStore.fetchDashboardData();
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <!-- Total Transactions -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Transaksi</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ dashboardStore.totalTransactions }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-cart-plus text-blue-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total Profit -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Keuntungan</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            Rp. {{ dashboardStore.totalProfit.toLocaleString('id-ID') }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-chart-line text-orange-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total Income -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Pendapatan</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            Rp. {{ dashboardStore.totalIncome.toLocaleString('id-ID') }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-cyan-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Total Expense -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Pengeluaran</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            Rp. {{ dashboardStore.totalExpense.toLocaleString('id-ID') }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-credit-card text-purple-500 !text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Revenue Stream Widget -->
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
        </div>
    </div>
</template>
