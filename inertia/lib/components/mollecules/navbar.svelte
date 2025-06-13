<script lang="ts">
  import { Home, Package, User } from '@lucide/svelte'

  function isActive(path: string) {
    if (path === '/') {
      return window.location.pathname === '/'
    }
    
    return window.location.pathname.includes(path)
  }
</script>

<div class="fixed bottom-0 z-50 w-full max-w-md rounded-md border-t bg-white px-2 py-1">
  <div class="flex items-center justify-around">
    <a href="/" class="flex flex-col items-center py-1">
      <div
        class={`rounded-full p-1.5 ${isActive('/') ? 'bg-sky-100 text-sky-600' : 'text-gray-500'}`}
      >
        <Home class="h-5 w-5" />
      </div>
      <span
        class={`mt-0.5 text-xs ${isActive('/') ? 'font-medium text-sky-600' : 'text-gray-500'}`}
      >
        Beranda
      </span>
    </a>

    <a href="/orders" class="flex flex-col items-center py-1">
      <div
        class={`rounded-full p-1.5 ${isActive('/order') ? 'bg-sky-100 text-sky-600' : 'text-gray-500'}`}
      >
        <Package class="h-5 w-5" />
      </div>
      <span
        class={`mt-0.5 text-xs ${isActive('/order') ? 'font-medium text-sky-600' : 'text-gray-500'}`}
      >
        Pesanan
      </span>
    </a>

    <a href="login" class="flex flex-col items-center border-0 bg-transparent py-1">
      <div
        class={`rounded-full p-1.5 ${isActive('/profile') ? 'bg-sky-100 text-sky-600' : 'text-gray-500'}`}
      >
        <User class="h-5 w-5" />
      </div>
      <span
        class={`mt-0.5 text-xs ${isActive('/profile') ? 'font-medium text-sky-600' : 'text-gray-500'}`}
      >
        Akun
      </span>
    </a>
  </div>
</div>
