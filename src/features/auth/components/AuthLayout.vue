<script setup lang="ts">
import Brand from '@/shared/ui/Brand.vue'
import TowerArtwork from '@/shared/ui/TowerArtwork.vue'
</script>
<template>
  <div class="auth-page">
    <header class="app-header">
      <Brand /><span class="eyebrow">Monitoring, made clear.</span>
    </header>
    <main class="auth-content">
      <div class="w-full max-w-md">
        <p class="eyebrow">Your watch starts here</p>
        <slot />
      </div>
      <aside class="auth-art">
        <TowerArtwork />
        <h2>Quiet when it works.<br />Clear when it doesn’t.</h2>
        <p class="text-muted">HTTP, HTTPS, TCP and ICMP.<br />One place to see what’s up.</p>
      </aside>
    </main>
    <footer class="app-footer">
      <span>PingTower · A little peace of mind.</span><span>HTTP / HTTPS / TCP / ICMP</span>
    </footer>
  </div>
</template>
