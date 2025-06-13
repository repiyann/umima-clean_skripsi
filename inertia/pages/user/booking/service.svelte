<script lang="ts">
  import { Button } from '~/lib/components/ui/button/index.js'
  import { Card, CardContent } from '~/lib/components/ui/card'
  import { Label } from '~/lib/components/ui/label/index.js'
  import { serviceGroups } from '~/lib/constants/booking.js'
  import type { CartItem, OrderServiceFormData } from '~/lib/types/booking.js'
  import { formatPrice } from '~/lib/utils.js'
  import { onDestroy, onMount } from 'svelte'
  import IntersectionObserver from 'svelte-intersection-observer'
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
  } from '~/lib/components/ui/dialog'
  import { Clock, MapPin, ShoppingCart } from '@lucide/svelte'
  import image from '~/lib/assets/image.png'

  // State variables
  let cartItems: CartItem[] = $state([])
  let formData: OrderServiceFormData = $state({ service: '', quantity: 0 })
  let activeTab: string = $state(serviceGroups[0]?.id ?? '')
  let intersecting: boolean = $state(false)
  let scrolled: number = $state(0)
  let sectionRefs: Record<string, HTMLElement | null> = $state({})

  // Initialize component and restore session data
  onMount(() => {
    const stored = sessionStorage.getItem('serviceData')
    if (stored) {
      const parsedData = JSON.parse(stored)
      if (parsedData.serviceData) {
        formData = parsedData.serviceData
      }

      if (parsedData.cartItems) {
        cartItems = parsedData.cartItems
      }
    }

    // Handle scroll for sticky header
    const handleScroll = () => (scrolled = window.scrollY)
    window.addEventListener('scroll', handleScroll)

    onDestroy(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  })

  // Auto-save cart state to session storage whenever cart changes
  $effect(() => {
    const serviceData = {
      cartItems,
      totalPrice,
      totalItems,
    }

    sessionStorage.setItem('serviceData', JSON.stringify(serviceData))
  })

  // Scroll to specific section with offset for sticky header
  function scrollToSection(id: string) {
    const el = sectionRefs[id]
    if (el) {
      const yOffset = -120
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Update active tab when section comes into view
  function handleIntersection(event: CustomEvent) {
    const { target, isIntersecting } = event.detail
    if (isIntersecting && target) {
      const sectionId = target.id
      if (sectionId) {
        activeTab = sectionId
      }
    }
  }

  // Find service option by ID
  function getServiceOption(id: string) {
    return serviceGroups.flatMap((group) => group.options).find((option) => option.value === id)
  }

  // Add item to cart or increase quantity
  function addToCart(id: string) {
    const existing = cartItems.find((item) => item.id === id)
    if (existing) {
      cartItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      cartItems = [...cartItems, { id, quantity: 1 }]
    }

    formData = { ...formData, service: id }
  }

  // Remove item from cart or decrease quantity
  function removeFromCart(id: string) {
    const existing = cartItems.find((item) => item.id === id)
    if (existing && existing.quantity > 1) {
      cartItems = cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
    } else {
      cartItems = cartItems.filter((item) => item.id !== id)
      if (formData.service === id) {
        formData = { ...formData, service: '' }
      }
    }
  }

  // Get quantity of specific item in cart
  function getItemQuantity(id: string) {
    return cartItems.find((item) => item.id === id)?.quantity || 0
  }

  // Handle service selection
  function handleSelectService(id: string) {
    const quantity = getItemQuantity(id) || 1
    formData = { service: id, quantity }

    if (!cartItems.find((item) => item.id === id)) {
      cartItems = [...cartItems, { id, quantity: 1 }]
    }
  }

  // Toggle addon for cart item
  function toggleAddon(id: string, addon: string, checked: boolean) {
    cartItems = cartItems.map((item) => {
      if (item.id === id) {
        const selected = item.selectedAddons || []
        return {
          ...item,
          selectedAddons: checked ? [...selected, addon] : selected.filter((a) => a !== addon),
        }
      }

      return item
    })
  }

  // Calculate total items in cart
  let totalItems = $derived(cartItems.reduce((acc, item) => acc + item.quantity, 0))

  // Calculate total price including addons
  let totalPrice = $derived(
    cartItems.reduce((total, item) => {
      const option = getServiceOption(item.id)
      if (!option) return total

      let itemTotal = option.basePrice ?? option.price
      if (item.selectedAddons && option.additionalCosts) {
        for (const addonName of item.selectedAddons) {
          const addon = option.additionalCosts.find((a) => a.name === addonName)
          if (addon) itemTotal += addon.price
        }
      }

      return total + itemTotal * item.quantity
    }, 0)
  )

  // Calculate total for individual cart item
  function getItemTotal(item: { id: string; quantity: number; selectedAddons?: string[] }) {
    const service = getServiceOption(item.id)
    if (!service) return 0

    let itemTotal = service.price * item.quantity

    if (item.selectedAddons && service.additionalCosts) {
      service.additionalCosts.forEach((addon) => {
        if (item.selectedAddons?.includes(addon.name)) {
          itemTotal += addon.price * item.quantity
        }
      })
    }

    return itemTotal
  }

  // Continue to next page
  function handleContinue() {
    sessionStorage.setItem(
      'serviceData',
      JSON.stringify({
        cartItems,
        totalPrice,
        totalItems,
      })
    )
  }
</script>

<div>
  <div class="relative h-48">
    <img src={image} alt="CleanPro Storefront" class="w-full object-cover" />
  </div>
  <div class="bg-white mt-12 rounded-lg relative p-2 shadow-sm">
    <div class="flex items-center justify-center gap-3 mb-2">
      <h1 class="text-xl font-bold">Umima Clean</h1>
    </div>

    <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border mb-1">
      <MapPin class="w-5 h-5 text-gray-600" />
      <span class="text-gray-800">
        Jl. Margacinta No. 132, Margasari, Kec. Buahbatu, Kota Bandung
      </span>
    </div>

    <div class="flex items-center gap-2 p-2 bg-gray-50 border rounded-lg">
      <Clock class="w-5 h-5 text-gray-600" />
      <span class="text-gray-800">Buka setiap hari 10:00 - 20:00</span>
    </div>
  </div>
</div>

<!-- Main container -->
<div class="p-4">
  <!-- Sticky navbar with navigation tabs -->
  <div
    class="sticky z-50 p-1 bg-white my-3 border rounded-lg border-gray-200 {scrolled > 0
      ? 'top-4'
      : 'top-0'}"
  >
    <!-- Navbar title -->
    <div class="px-4 py-2">
      <div class="flex items-center justify-center">
        <h1 class="text-lg font-semibold text-gray-900">Pilih Layanan</h1>
      </div>
    </div>

    <!-- Service category tabs -->
    <div
      class="space-x-1 bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[2px]"
    >
      {#each serviceGroups as group}
        <button
          onclick={() => scrollToSection(group.id)}
          class="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 {activeTab ===
          group.id
            ? 'bg-background'
            : ''}"
        >
          {group.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Service sections with extra padding if cart has items -->
  <div class="space-y-4 {totalItems > 0 ? 'pb-32' : 'pb-16'}">
    {#each serviceGroups as group}
      <!-- Intersection observer for auto tab switching -->
      <IntersectionObserver
        element={sectionRefs[group.id]}
        bind:intersecting
        on:intersect={handleIntersection}
      >
        <!-- Service group section -->
        <section id={group.id} bind:this={sectionRefs[group.id]}>
          <h3 class="mb-1 text-base font-semibold text-black">{group.label}</h3>
          <div class="space-y-2">
            {#each group.options as option}
              <!-- Service option card -->
              <Card
                class="cursor-pointer py-4 bg-white {formData.service === option.value
                  ? 'ring-2 ring-black'
                  : ''}"
                onclick={() => handleSelectService(option.value)}
              >
                <CardContent class="px-4 flex space-x-3">
                  <!-- Service info -->
                  <div class="flex-1">
                    <Label class="text-base font-medium text-black">{option.title}</Label>
                    <p class="text-sm text-gray-500">{option.desc}</p>
                    <p class="mt-1 font-medium text-black">
                      {option.basePrice
                        ? `Mulai dari ${formatPrice(option.basePrice)}`
                        : formatPrice(option.price)}
                    </p>

                    <!-- Show addons if item is in cart -->
                    {#if getItemQuantity(option.value) > 0 && option.additionalCosts}
                      <div class="mt-2 space-y-2">
                        {#each option.additionalCosts as addon}
                          <div class="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={cartItems
                                .find((i) => i.id === option.value)
                                ?.selectedAddons?.includes(addon.name) || false}
                              onchange={(e) => {
                                const target = e.target as HTMLInputElement
                                toggleAddon(option.value, addon.name, target.checked)
                                e.stopPropagation()
                              }}
                            />
                            <Label class="text-sm text-gray-600">
                              {addon.name} (+{formatPrice(addon.price)})
                            </Label>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <!-- Quantity controls -->
                  {#if getItemQuantity(option.value) > 0}
                    <!-- Show quantity controls if item is in cart -->
                    <div class="mt-2 flex items-center justify-end">
                      <button
                        onclick={(e) => {
                          e.stopPropagation()
                          removeFromCart(option.value)
                        }}
                        class="h-8 w-8 border border-black text-black rounded-md hover:bg-gray-100"
                        >-</button
                      >

                      <span class="mx-4 font-medium text-black"
                        >{getItemQuantity(option.value)}</span
                      >

                      <button
                        onclick={(e) => {
                          e.stopPropagation()
                          addToCart(option.value)
                        }}
                        class="h-8 w-8 bg-black text-white rounded-md hover:bg-gray-800">+</button
                      >
                    </div>
                  {:else}
                    <!-- Show add button if item is not in cart -->
                    <div class="mt-2 flex items-center justify-end">
                      <button
                        onclick={(e) => {
                          e.stopPropagation()
                          addToCart(option.value)
                        }}
                        class="h-8 w-8 bg-black text-white rounded-md hover:bg-gray-800">+</button
                      >
                    </div>
                  {/if}
                </CardContent>
              </Card>
            {/each}
          </div>
        </section>
      </IntersectionObserver>
    {/each}
  </div>

  <!-- Fixed bottom cart section - only show if cart has items -->
  {#if totalItems > 0}
    <div
      class="fixed p-2 bottom-20 left-0 right-0 z-50 mx-auto max-w-[412px] bg-white rounded-lg shadow-lg"
    >
      <div class="flex items-center justify-between">
        <div class="flex">
          <!-- Cart dialog trigger -->
          <Dialog>
            <DialogTrigger
              class="flex items-center space-x-2 rounded-md px-2 hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart class="h-5 w-5 text-gray-700" />
            </DialogTrigger>

            <!-- Cart details dialog -->
            <DialogContent class="max-w-screen-sm">
              <DialogHeader>
                <DialogTitle class="flex items-center space-x-2">
                  <ShoppingCart class="h-5 w-5" />
                  <span>Detail Pesanan</span>
                </DialogTitle>
              </DialogHeader>

              <!-- Cart items list -->
              <div class="space-y-4">
                {#each cartItems as item (item.id)}
                  {@const service = getServiceOption(item.id)}
                  {#if service}
                    <div class="border-b pb-4 last:border-b-0">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <!-- Service details -->
                          <h4 class="font-medium text-black">{service.title}</h4>
                          <p class="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p class="text-sm font-medium text-black">
                            {formatPrice(service.price)} x {item.quantity} = {formatPrice(
                              service.price * item.quantity
                            )}
                          </p>

                          <!-- Show selected addons -->
                          {#if item.selectedAddons && item.selectedAddons.length > 0}
                            <div class="mt-2 space-y-1">
                              <p class="text-xs font-medium text-gray-700">Add-ons:</p>
                              {#each item.selectedAddons as addonName}
                                {#if service.additionalCosts}
                                  {#each service.additionalCosts.filter((a) => a.name === addonName) as addon}
                                    <div class="text-xs text-gray-600">
                                      • {addon.name}: {formatPrice(addon.price)} x {item.quantity} =
                                      {formatPrice(addon.price * item.quantity)}
                                    </div>
                                  {/each}
                                {/if}
                              {/each}
                            </div>
                          {/if}

                          <!-- Item subtotal -->
                          <div class="mt-2 text-sm font-semibold text-black">
                            Subtotal: {formatPrice(getItemTotal(item))}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/if}
                {/each}

                <!-- Total price footer -->
                <DialogFooter class="border-t pt-4">
                  <div class="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <!-- Cart summary -->
          <div>
            <span class="text-sm font-medium text-gray-700">{totalItems} item(s)</span>
            <div class="text-lg font-bold text-black">{formatPrice(totalPrice)}</div>
          </div>
        </div>

        <!-- Continue button -->
        <Button
          type="button"
          class="bg-black text-white hover:bg-gray-800"
          onclick={handleContinue}
        >
          Lanjutkan
        </Button>
      </div>
    </div>
  {/if}
</div>
