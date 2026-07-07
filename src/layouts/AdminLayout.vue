<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ── Top Header ─────────────────────────────────────────────────────── -->
    <q-header elevated class="admin-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Toggle Menu"
          @click="drawerOpen = !drawerOpen"
          class="q-mr-sm"
        />

        <q-avatar size="32px" color="primary" text-color="dark" icon="bolt" class="q-mr-sm" />
        <div class="q-mr-md">
          <div class="text-subtitle1 text-weight-bold" style="line-height: 1.1">Portfolio Admin</div>
          <div class="text-caption text-grey-5" style="line-height: 1">AAB Dashboard</div>
        </div>

        <q-space />

        <div class="row q-gutter-sm items-center q-mr-md gt-sm">
          <q-chip dense color="negative" text-color="white" icon="mail"
            :label="`${store.unreadCount} Unread`" />
          <q-chip dense color="positive" text-color="white" icon="mark_email_read"
            :label="`${store.readCount} Read`" />
          <q-chip dense color="grey-7" text-color="white" icon="archive"
            :label="`${store.archivedCount} Archived`" />
        </div>

        <q-btn flat dense round icon="refresh" :loading="store.loading"
          @click="store.fetchAll()" title="Refresh">
          <q-tooltip>Refresh data</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ── Left Drawer ────────────────────────────────────────────────────── -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      :width="240"
      :breakpoint="1024"
      bordered
      dark
      class="admin-drawer"
    >
      <div class="column full-height">
        <!-- Drawer header -->
        <div class="drawer-header q-pa-lg">
          <div class="text-h6 text-weight-bold text-primary">Navigation</div>
          <div class="text-caption text-grey-5">Portfolio Management</div>
        </div>

        <q-separator dark />

        <!-- Nav items -->
        <q-list padding class="q-mt-sm col">
          <q-item
            clickable
            v-ripple
            :to="{ name: 'Queries' }"
            active-class="nav-item-active"
            class="nav-item q-mb-xs"
            rounded
          >
            <q-item-section avatar>
              <q-icon name="inbox" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Inquiries</q-item-label>
              <q-item-label caption>All contact queries</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                v-if="store.unreadCount > 0"
                color="negative"
                :label="store.unreadCount"
                rounded
              />
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Drawer footer -->
        <div class="q-pa-md">
          <q-separator dark class="q-mb-md" />
          <div class="text-caption text-grey-6 text-center">Backend: Cloudflare Worker</div>
          <div class="text-caption text-grey-7 text-center q-mt-xs">Portfolio Admin v1.0.0</div>
        </div>
      </div>
    </q-drawer>

    <!-- ── Main Content ───────────────────────────────────────────────────── -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQueriesStore } from '../stores/queries'

const store      = useQueriesStore()
const drawerOpen = ref(true)

onMounted(() => {
  store.fetchAll()
})
</script>

<style lang="scss" scoped>
.admin-header {
  background: linear-gradient(135deg, #1a1f2e 0%, #0d1526 100%);
  border-bottom: 1px solid rgba(16, 185, 129, 0.15);
}

.admin-drawer {
  background: #0f1623 !important;
  border-right: 1px solid rgba(30, 41, 59, 0.8);
}

.drawer-header {
  background: rgba(16, 185, 129, 0.05);
}

.nav-item {
  color: #94a3b8;
  margin: 0 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(16, 185, 129, 0.08);
    color: #f1f5f9;
  }
}

.nav-item-active {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #10b981 !important;
  border-left: 3px solid #10b981;
}
</style>
