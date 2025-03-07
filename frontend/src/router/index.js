import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import JwtService from '@/core/services/JwtService';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    meta: { requiresAuth: true },
                    component: () => import('@/views/pages/dashboard/index.vue')
                },
                {
                    path: '/transaksi',
                    name: 'transaksi',
                    component: () => import('@/views/pages/transaction/index.vue')
                },
                {
                    path: '/arus-kas',
                    name: 'arus-kas',
                    component: () => import('@/views/pages/cashflow/index.vue')
                },
                {
                    path: '/arus-kas/create',
                    name: 'create-arus-kas',
                    component: () => import('@/views/pages/cashflow/create.vue')
                },
                {
                    path: '/arus-kas/edit/:id',
                    name: 'update-arus-kas',
                    component: () => import('@/views/pages/cashflow/update.vue')
                },
                {
                    path: '/kategori-produk',
                    name: 'category',
                    component: () => import('@/views/pages/category/index.vue')
                },
                {
                    path: '/kategori-produk/create',
                    name: 'create-category',
                    component: () => import('@/views/pages/category/create.vue')
                },
                {
                    path: '/kategori-produk/edit/:id',
                    name: 'update-category',
                    component: () => import('@/views/pages/category/update.vue')
                },
                {
                    path: '/daftar-produk',
                    name: 'product',
                    component: () => import('@/views/pages/products/index.vue')
                },
                {
                    path: '/daftar-produk/create',
                    name: 'create-product',
                    component: () => import('@/views/pages/products/create.vue')
                },
                {
                    path: '/daftar-produk/edit/:id',
                    name: 'update-product',
                    component: () => import('@/views/pages/products/update.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/others/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/others/Crud.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/others/Documentation.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/others/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/others/NotFound.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!JwtService.getToken();

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
    } else {
        next();
    }
});

export default router;
