<script>
  import { inertia } from '@inertiajs/svelte'
  import { Toaster } from '~/lib/components/ui/sonner/index.js'
  import Navbar from '../mollecules/navbar.svelte'

  let { children } = $props()

  const hideNavbarRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

  const showNavbar = !hideNavbarRoutes.includes(window.location.pathname)
</script>

<main class={`min-h-screen mx-auto bg-white max-w-md`}>
  <Toaster />

  {@render children()}

  {#if showNavbar}
    <Navbar />
  {/if}
</main>
