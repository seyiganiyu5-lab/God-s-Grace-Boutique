'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  ShoppingCart,
  Package,
  FolderOpen,
  MessageSquareHeart,
  Plus,
  Trash2,
  Pencil,
  Star,
  StarOff,
  Menu,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Eye,
  Phone,
  CreditCard,
  Search,
  Image as ImageIcon,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  nameFr: string
  slug: string
  image: string | null
  createdAt: string
  products?: Product[]
}

interface Product {
  id: string
  name: string
  nameFr: string
  description: string
  descriptionFr: string
  price: number
  image: string
  categoryId: string
  inStock: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
  category?: Category
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  items: string
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

interface Testimony {
  id: string
  name: string
  message: string
  rating: number
  approved: boolean
  createdAt: string
  updatedAt: string
}

type ActiveSection = 'dashboard' | 'products' | 'categories' | 'orders' | 'testimonies'

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null)

  // Search
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')

  // Form state
  const [productForm, setProductForm] = useState({
    name: '', nameFr: '', description: '', descriptionFr: '',
    price: '', image: '', categoryId: '', inStock: true, featured: false,
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '', nameFr: '', slug: '', image: '',
  })

  // ─── Data Fetching ───────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) { const data = await res.json(); setProducts(data) }
    } catch { toast.error('Failed to fetch products') }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) { const data = await res.json(); setCategories(data) }
    } catch { toast.error('Failed to fetch categories') }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) { const data = await res.json(); setOrders(data) }
    } catch { toast.error('Failed to fetch orders') }
  }, [])

  const fetchTestimonies = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonies')
      if (res.ok) { const data = await res.json(); setTestimonies(data) }
    } catch { toast.error('Failed to fetch testimonies') }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      try {
        const [pRes, cRes, oRes, tRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/orders'),
          fetch('/api/testimonies'),
        ])
        if (!cancelled) {
          if (pRes.ok) setProducts(await pRes.json())
          if (cRes.ok) setCategories(await cRes.json())
          if (oRes.ok) setOrders(await oRes.json())
          if (tRes.ok) setTestimonies(await tRes.json())
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  // ─── Product CRUD ────────────────────────────────────────────────────────

  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.nameFr || !productForm.description || !productForm.descriptionFr || !productForm.price || !productForm.image || !productForm.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productForm.name, nameFr: productForm.nameFr,
            description: productForm.description, descriptionFr: productForm.descriptionFr,
            price: parseFloat(productForm.price), image: productForm.image,
            categoryId: productForm.categoryId,
            inStock: productForm.inStock, featured: productForm.featured,
          }),
        })
        if (res.ok) { toast.success('Product updated successfully'); setProductDialogOpen(false); setEditingProduct(null); fetchProducts() }
        else { toast.error('Failed to update product') }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productForm.name, nameFr: productForm.nameFr,
            description: productForm.description, descriptionFr: productForm.descriptionFr,
            price: productForm.price, image: productForm.image,
            categoryId: productForm.categoryId,
            inStock: productForm.inStock, featured: productForm.featured,
          }),
        })
        if (res.ok) { toast.success('Product created successfully'); setProductDialogOpen(false); resetProductForm(); fetchProducts() }
        else { const data = await res.json(); toast.error(data.error || 'Failed to create product') }
      }
    } catch { toast.error('An error occurred') }
  }

  const resetProductForm = () => {
    setProductForm({ name: '', nameFr: '', description: '', descriptionFr: '', price: '', image: '', categoryId: '', inStock: true, featured: false })
    setEditingProduct(null)
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name, nameFr: product.nameFr,
      description: product.description, descriptionFr: product.descriptionFr,
      price: product.price.toString(), image: product.image,
      categoryId: product.categoryId, inStock: product.inStock, featured: product.featured,
    })
    setProductDialogOpen(true)
  }

  const toggleProductStock = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !product.inStock }),
      })
      if (res.ok) { toast.success(`Product ${!product.inStock ? 'in stock' : 'out of stock'}`); fetchProducts() }
      else { toast.error('Failed to update stock status') }
    } catch { toast.error('An error occurred') }
  }

  const toggleProductFeatured = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured }),
      })
      if (res.ok) { toast.success(`Product ${!product.featured ? 'featured' : 'unfeatured'}`); fetchProducts() }
      else { toast.error('Failed to update featured status') }
    } catch { toast.error('An error occurred') }
  }

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Product deleted'); fetchProducts() }
      else { toast.error('Failed to delete product') }
    } catch { toast.error('An error occurred') }
  }

  // ─── Category CRUD ───────────────────────────────────────────────────────

  const handleCategorySubmit = async () => {
    if (!categoryForm.name || !categoryForm.nameFr || !categoryForm.slug) {
      toast.error('Name, French name, and slug are required')
      return
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })
      if (res.ok) { toast.success('Category created'); setCategoryDialogOpen(false); setCategoryForm({ name: '', nameFr: '', slug: '', image: '' }); fetchCategories() }
      else { const data = await res.json(); toast.error(data.error || 'Failed to create category') }
    } catch { toast.error('An error occurred') }
  }

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Category and its products deleted'); fetchCategories(); fetchProducts() }
      else { toast.error('Failed to delete category') }
    } catch { toast.error('An error occurred') }
  }

  // ─── Order Operations ────────────────────────────────────────────────────

  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Order deleted'); fetchOrders() }
      else { toast.error('Failed to delete order') }
    } catch { toast.error('An error occurred') }
  }

  // ─── Testimony Operations ────────────────────────────────────────────────

  const toggleTestimonyApproval = async (testimony: Testimony) => {
    try {
      const res = await fetch(`/api/testimonies/${testimony.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: !testimony.approved }),
      })
      if (res.ok) { toast.success(`Testimony ${!testimony.approved ? 'approved' : 'unapproved'}`); fetchTestimonies() }
      else { toast.error('Failed to update testimony') }
    } catch { toast.error('An error occurred') }
  }

  const deleteTestimony = async (id: string) => {
    try {
      const res = await fetch(`/api/testimonies/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Testimony deleted'); fetchTestimonies() }
      else { toast.error('Failed to delete testimony') }
    } catch { toast.error('An error occurred') }
  }

  // ─── Delete Confirmation ─────────────────────────────────────────────────

  const confirmDelete = (type: string, id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setDeleteConfirmOpen(true)
  }

  const executeDelete = async () => {
    if (!deleteTarget) return
    switch (deleteTarget.type) {
      case 'product': await deleteProduct(deleteTarget.id); break
      case 'category': await deleteCategory(deleteTarget.id); break
      case 'order': await deleteOrder(deleteTarget.id); break
      case 'testimony': await deleteTestimony(deleteTarget.id); break
    }
    setDeleteConfirmOpen(false)
    setDeleteTarget(null)
  }

  // ─── Computed Values ─────────────────────────────────────────────────────

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.nameFr.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(productSearch.toLowerCase())
  )

  const filteredOrders = orders.filter(o =>
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customerPhone.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearch.toLowerCase())
  )

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const inStockProducts = products.filter(p => p.inStock).length
  const featuredProducts = products.filter(p => p.featured).length
  const approvedTestimonies = testimonies.filter(t => t.approved).length

  // ─── Sidebar Navigation Items ────────────────────────────────────────────

  const navItems: { key: ActiveSection; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
    { key: 'products', label: 'Products', icon: <Package className="size-4" /> },
    { key: 'categories', label: 'Categories', icon: <FolderOpen className="size-4" /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingCart className="size-4" /> },
    { key: 'testimonies', label: 'Testimonies', icon: <MessageSquareHeart className="size-4" /> },
  ]

  // ─── Sidebar Content ─────────────────────────────────────────────────────

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground text-sm leading-tight">God&apos;s Grace</h1>
            <p className="text-xs text-muted-foreground">Boutique Admin</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => { setActiveSection(item.key); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === item.key
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">God&apos;s Grace Boutique &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  )

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar border-r border-sidebar-border">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-4 md:px-6 h-14">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="size-5" />
              </Button>
              <h2 className="font-semibold text-lg capitalize">{activeSection}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {products.length} Products
              </Badge>
              {pendingOrders > 0 && (
                <Badge className="text-xs">
                  {pendingOrders} Pending
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Dashboard Section ── */}
              {activeSection === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1.5">
                          <Package className="size-3.5" /> Total Products
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{inStockProducts} in stock, {featuredProducts} featured</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1.5">
                          <FolderOpen className="size-3.5" /> Categories
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active categories</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1.5">
                          <ShoppingCart className="size-3.5" /> Total Orders
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">{pendingOrders} pending</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1.5">
                          <CreditCard className="size-3.5" /> Revenue
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'XOF' })}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total from all orders</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Orders</CardTitle>
                        <CardDescription>Latest 5 orders</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {orders.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No orders yet</p>
                        ) : (
                          <div className="space-y-3">
                            {orders.slice(0, 5).map(order => (
                              <div key={order.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-medium truncate">{order.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-semibold">{order.total.toLocaleString()} FCFA</span>
                                  <Badge variant={order.status === 'pending' ? 'outline' : order.status === 'delivered' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                    {order.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Testimonies</CardTitle>
                        <CardDescription>Approval status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {testimonies.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">No testimonies yet</p>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Approved</span>
                              <Badge>{approvedTestimonies}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Pending Review</span>
                              <Badge variant="outline">{testimonies.length - approvedTestimonies}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Total</span>
                              <Badge variant="secondary">{testimonies.length}</Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Products by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No categories yet</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                              {cat.image && (
                                <img src={cat.image} alt={cat.name} className="size-8 rounded object-cover" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{cat.name}</p>
                                <p className="text-xs text-muted-foreground">{cat.products?.length || 0} items</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── Products Section ── */}
              {activeSection === 'products' && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button
                      onClick={() => { resetProductForm(); setProductDialogOpen(true) }}
                      className="gap-2"
                    >
                      <Plus className="size-4" /> Add Product
                    </Button>
                  </div>

                  {/* Products Table */}
                  {filteredProducts.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Package className="size-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No products found</p>
                        <p className="text-xs text-muted-foreground mt-1">Add your first product to get started</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="hidden sm:table-cell">Stock</TableHead>
                                <TableHead className="hidden lg:table-cell">Featured</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredProducts.map(product => (
                                <TableRow key={product.id}>
                                  <TableCell>
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="size-10 rounded object-cover bg-muted"
                                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate max-w-[180px]">{product.name}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{product.nameFr}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <Badge variant="outline" className="text-xs">{product.category?.name || 'N/A'}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-semibold text-sm">{product.price.toLocaleString()} FCFA</span>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <Switch
                                      checked={product.inStock}
                                      onCheckedChange={() => toggleProductStock(product)}
                                    />
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    <Switch
                                      checked={product.featured}
                                      onCheckedChange={() => toggleProductFeatured(product)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditProduct(product)}>
                                        <Pencil className="size-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => confirmDelete('product', product.id, product.name)}>
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ── Categories Section ── */}
              {activeSection === 'categories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{categories.length} categories</p>
                    <Button onClick={() => { setCategoryForm({ name: '', nameFr: '', slug: '', image: '' }); setCategoryDialogOpen(true) }} className="gap-2">
                      <Plus className="size-4" /> Add Category
                    </Button>
                  </div>

                  {categories.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FolderOpen className="size-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No categories yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Add your first category to organize products</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map(cat => (
                        <Card key={cat.id} className="group">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="size-16 rounded-lg object-cover bg-muted shrink-0" />
                              ) : (
                                <div className="size-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <ImageIcon className="size-6 text-muted-foreground/50" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">{cat.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{cat.nameFr}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    /{cat.slug}
                                  </Badge>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {cat.products?.length || 0} items
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={() => confirmDelete('category', cat.id, cat.name)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Orders Section ── */}
              {activeSection === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Search orders..."
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <ShoppingCart className="size-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No orders found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="hidden md:table-cell">Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredOrders.map(order => (
                                <TableRow key={order.id}>
                                  <TableCell>
                                    <p className="font-medium text-sm">{order.customerName}</p>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Phone className="size-3" /> {order.customerPhone || 'N/A'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-semibold text-sm">{order.total.toLocaleString()} FCFA</span>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <Badge variant="outline" className="text-xs capitalize">{order.paymentMethod}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        order.status === 'delivered' ? 'default' :
                                        order.status === 'pending' ? 'outline' :
                                        order.status === 'cancelled' ? 'destructive' : 'secondary'
                                      }
                                      className="text-xs capitalize"
                                    >
                                      {order.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setSelectedOrder(order); setOrderDetailOpen(true) }}>
                                        <Eye className="size-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => confirmDelete('order', order.id, order.customerName)}>
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ── Testimonies Section ── */}
              {activeSection === 'testimonies' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {testimonies.length} testimonies ({approvedTestimonies} approved)
                    </p>
                  </div>

                  {testimonies.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MessageSquareHeart className="size-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No testimonies yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testimonies.map(testimony => (
                        <Card key={testimony.id} className="group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-sm">{testimony.name}</h3>
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`size-3 ${i < testimony.rating ? 'text-gold fill-gold' : 'text-muted-foreground/30'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">{testimony.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={testimony.approved ? 'default' : 'outline'} className="text-xs">
                                    {testimony.approved ? (
                                      <><CheckCircle2 className="size-3 mr-1" /> Approved</>
                                    ) : (
                                      <><XCircle className="size-3 mr-1" /> Pending</>
                                    )}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(testimony.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 shrink-0">
                                <Button
                                  variant={testimony.approved ? 'outline' : 'default'}
                                  size="sm"
                                  className="text-xs gap-1"
                                  onClick={() => toggleTestimonyApproval(testimony)}
                                >
                                  {testimony.approved ? <><StarOff className="size-3" /> Unapprove</> : <><CheckCircle2 className="size-3" /> Approve</>}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs gap-1 text-destructive hover:text-destructive"
                                  onClick={() => confirmDelete('testimony', testimony.id, testimony.name)}
                                >
                                  <Trash2 className="size-3" /> Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Product Dialog ── */}
      <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) resetProductForm() }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Fill in the details to create a new product'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Name (English) *</Label>
              <Input id="prod-name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-nameFr">Name (French) *</Label>
              <Input id="prod-nameFr" value={productForm.nameFr} onChange={e => setProductForm(f => ({ ...f, nameFr: e.target.value }))} placeholder="Nom du produit" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="prod-desc">Description (English) *</Label>
              <Textarea id="prod-desc" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description" rows={3} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="prod-descFr">Description (French) *</Label>
              <Textarea id="prod-descFr" value={productForm.descriptionFr} onChange={e => setProductForm(f => ({ ...f, descriptionFr: e.target.value }))} placeholder="Description du produit" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-price">Price (FCFA) *</Label>
              <Input id="prod-price" type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="0" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-image">Image URL *</Label>
              <Input id="prod-image" value={productForm.image} onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-category">Category *</Label>
              <Select value={productForm.categoryId} onValueChange={val => setProductForm(f => ({ ...f, categoryId: val }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>In Stock</Label>
                <Switch checked={productForm.inStock} onCheckedChange={val => setProductForm(f => ({ ...f, inStock: val }))} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <Label>Featured</Label>
                <Switch checked={productForm.featured} onCheckedChange={val => setProductForm(f => ({ ...f, featured: val }))} />
              </div>
            </div>
          </div>
          {productForm.image && (
            <div className="border rounded-lg p-2">
              <p className="text-xs text-muted-foreground mb-2">Image Preview</p>
              <img src={productForm.image} alt="Preview" className="size-24 rounded object-cover bg-muted" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setProductDialogOpen(false); resetProductForm() }}>Cancel</Button>
            <Button onClick={handleProductSubmit}>{editingProduct ? 'Update Product' : 'Create Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Category Dialog ── */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name (English) *</Label>
              <Input id="cat-name" value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-nameFr">Name (French) *</Label>
              <Input id="cat-nameFr" value={categoryForm.nameFr} onChange={e => setCategoryForm(f => ({ ...f, nameFr: e.target.value }))} placeholder="Nom de la catégorie" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input id="cat-slug" value={categoryForm.slug} onChange={e => setCategoryForm(f => ({ ...f, slug: e.target.value }))} placeholder="category-slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-image">Image URL</Label>
              <Input id="cat-image" value={categoryForm.image} onChange={e => setCategoryForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCategorySubmit}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Order Detail Dialog ── */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Viewing order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium text-sm">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-sm flex items-center gap-1">
                    <Phone className="size-3" /> {selectedOrder.customerPhone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <Badge variant="outline" className="capitalize mt-0.5">{selectedOrder.paymentMethod}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={selectedOrder.status === 'pending' ? 'outline' : selectedOrder.status === 'delivered' ? 'default' : 'secondary'} className="capitalize mt-0.5">
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Order Items</p>
                <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {(() => {
                    try {
                      const items = JSON.parse(selectedOrder.items)
                      if (Array.isArray(items)) {
                        return (
                          <div className="space-y-2">
                            {items.map((item: { name?: string; price?: number; quantity?: number }, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span>{item.name || `Item ${i + 1}`} {item.quantity ? `x${item.quantity}` : ''}</span>
                                <span className="font-medium">{item.price ? `${item.price.toLocaleString()} FCFA` : ''}</span>
                              </div>
                            ))}
                          </div>
                        )
                      }
                      return <p className="text-sm">{selectedOrder.items}</p>
                    } catch {
                      return <p className="text-sm">{selectedOrder.items}</p>
                    }
                  })()}
                </div>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{selectedOrder.total.toLocaleString()} FCFA</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Order Date</p>
                <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              {deleteTarget?.type === 'category' && ' This will also delete all products in this category.'}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={executeDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
