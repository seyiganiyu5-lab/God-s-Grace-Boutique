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
import { Separator } from '@/components/ui/separator'
import { useLangStore } from '@/store/lang'
import { translations } from '@/lib/i18n'

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
  ArrowLeft,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Sparkles,
  Heart,
  Clock,
  Globe,
  LogOut,
  Lock,
  User,
  AlertCircle,
  Upload,
  X as XIcon,
  Loader2,
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

interface AdminDashboardProps {
  onBackToStore: () => void
}

export default function AdminDashboard({ onBackToStore }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Language
  const { lang, toggleLang } = useLangStore()
  const t = translations[lang]

  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)

  // ─── Auth Check ─────────────────────────────────────────────────────────

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/verify')
        if (res.ok) {
          const data = await res.json()
          setIsAuthenticated(data.authenticated === true)
        } else {
          setIsAuthenticated(false)
        }
      } catch {
        setIsAuthenticated(false)
      } finally {
        setAuthChecking(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      if (res.ok) {
        setIsAuthenticated(true)
        toast.success(lang === 'fr' ? 'Connexion réussie!' : 'Login successful!')
      } else {
        const data = await res.json()
        setLoginError(data.error || (lang === 'fr' ? 'Identifiants invalides' : 'Invalid credentials'))
      }
    } catch {
      setLoginError(lang === 'fr' ? 'Erreur de connexion' : 'Connection error')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      toast.success(lang === 'fr' ? 'Déconnexion réussie' : 'Logged out successfully')
    } catch {
      toast.error(lang === 'fr' ? 'Erreur de déconnexion' : 'Logout failed')
    }
  }

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

  // Upload state
  const [productUploading, setProductUploading] = useState(false)
  const [categoryUploading, setCategoryUploading] = useState(false)

  // Image upload handler
  const handleImageUpload = async (file: File, target: 'product' | 'category') => {
    if (!file) return
    const setUploading = target === 'product' ? setProductUploading : setCategoryUploading
    const setForm = target === 'product' ? setProductForm : setCategoryForm

    // Validate
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm((prev: any) => ({ ...prev, image: data.url }))
        toast.success('Image uploaded successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) { toast.success(`Order marked as ${status}`); fetchOrders() }
      else { toast.error('Failed to update order status') }
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
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length
  const inStockProducts = products.filter(p => p.inStock).length
  const featuredProducts = products.filter(p => p.featured).length
  const approvedTestimonies = testimonies.filter(t => t.approved).length

  // ─── Sidebar Navigation Items ────────────────────────────────────────────

  const navItems: { key: ActiveSection; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" />, description: 'Overview & stats' },
    { key: 'products', label: 'Products', icon: <Package className="size-4" />, description: `${products.length} items` },
    { key: 'categories', label: 'Categories', icon: <FolderOpen className="size-4" />, description: `${categories.length} groups` },
    { key: 'orders', label: 'Orders', icon: <ShoppingCart className="size-4" />, description: `${orders.length} total` },
    { key: 'testimonies', label: 'Testimonies', icon: <MessageSquareHeart className="size-4" />, description: `${testimonies.length} reviews` },
  ]

  // ─── Sidebar Content ─────────────────────────────────────────────────────

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
            <span className="text-primary-foreground font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="font-handwriting text-primary text-xl leading-tight">God&apos;s Grace</h1>
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">Boutique Admin</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Navigation</p>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => { setActiveSection(item.key); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              activeSection === item.key
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                : 'text-foreground/70 hover:bg-accent hover:text-foreground'
            }`}
          >
            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
              activeSection === item.key ? 'bg-primary-foreground/20' : 'bg-muted'
            }`}>
              {item.icon}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-medium leading-tight">{item.label}</p>
              <p className={`text-[10px] leading-tight ${activeSection === item.key ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {item.description}
              </p>
            </div>
            {activeSection === item.key && <ChevronRight className="size-4 shrink-0" />}
          </button>
        ))}
      </nav>

      <Separator />

      {/* Back to Store + Logout */}
      <div className="p-3 space-y-1">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
        >
          <ArrowLeft className="size-4" />
          <span>{lang === 'fr' ? 'Retour à la Boutique' : 'Back to Store'}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="size-4" />
          <span>{lang === 'fr' ? 'Déconnexion' : 'Logout'}</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <p className="text-[10px] text-muted-foreground text-center font-handwriting">God&apos;s Grace Boutique &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  )

  // ─── Section Title Helper ────────────────────────────────────────────────

  const sectionTitles: Record<ActiveSection, { title: string; subtitle: string; icon: React.ReactNode }> = {
    dashboard: { title: lang === 'fr' ? 'Tableau de bord' : 'Dashboard', subtitle: lang === 'fr' ? "Vue d'ensemble de votre boutique" : "Welcome back! Here's your store overview.", icon: <LayoutDashboard className="size-5" /> },
    products: { title: lang === 'fr' ? 'Produits' : 'Products', subtitle: lang === 'fr' ? 'Gérer votre catalogue' : 'Manage your product catalog', icon: <Package className="size-5" /> },
    categories: { title: lang === 'fr' ? 'Catégories' : 'Categories', subtitle: lang === 'fr' ? 'Organiser vos produits' : 'Organize your products', icon: <FolderOpen className="size-5" /> },
    orders: { title: lang === 'fr' ? 'Commandes' : 'Orders', subtitle: lang === 'fr' ? 'Suivre et gérer les commandes' : 'Track and manage customer orders', icon: <ShoppingCart className="size-5" /> },
    testimonies: { title: lang === 'fr' ? 'Témoignages' : 'Testimonies', subtitle: lang === 'fr' ? 'Examiner les avis clients' : 'Review customer feedback', icon: <MessageSquareHeart className="size-5" /> },
  }

  // ─── Auth Checking State ──────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium">{lang === 'fr' ? 'Vérification...' : 'Verifying...'}</p>
            <p className="text-xs text-muted-foreground mt-1 font-handwriting">God&apos;s Grace Boutique</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Login Page ───────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-center text-primary-foreground">
              <div className="size-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="size-8 text-primary-foreground" />
              </div>
              <h1 className="font-handwriting text-2xl mb-1">God&apos;s Grace</h1>
              <p className="text-primary-foreground/80 text-sm">{lang === 'fr' ? 'Administration Boutique' : 'Boutique Administration'}</p>
            </div>

            {/* Form */}
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">{lang === 'fr' ? 'Nom d\'utilisateur' : 'Username'}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(f => ({ ...f, username: e.target.value }))}
                      placeholder={lang === 'fr' ? 'Entrez votre nom d\'utilisateur' : 'Enter your username'}
                      className="pl-9"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{lang === 'fr' ? 'Mot de passe' : 'Password'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      placeholder={lang === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
                      className="pl-9"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full shadow-md shadow-primary/20"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'fr' ? 'Connexion...' : 'Signing in...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="size-4" />
                      <span>{lang === 'fr' ? 'Se connecter' : 'Sign In'}</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={onBackToStore}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" />
                  {lang === 'fr' ? 'Retour à la Boutique' : 'Back to Store'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Language Toggle Below Login */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Globe className="size-3.5" />
              {lang === 'en' ? 'Français' : 'English'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render Dashboard ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-card">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="size-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {sectionTitles[activeSection].icon}
                </div>
                <div>
                  <h2 className="font-semibold text-base font-elegant leading-tight">{sectionTitles[activeSection].title}</h2>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">{sectionTitles[activeSection].subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs gap-1 hidden sm:flex">
                <Package className="size-3" /> {products.length} {lang === 'fr' ? 'Produits' : 'Products'}
              </Badge>
              {pendingOrders > 0 && (
                <Badge className="text-xs gap-1">
                  <Clock className="size-3" /> {pendingOrders} {lang === 'fr' ? 'En attente' : 'Pending'}
                </Badge>
              )}
              {/* Language Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLang}
                className="gap-1.5 text-xs font-semibold h-8"
              >
                <Globe className="size-3.5" />
                {lang === 'en' ? 'FR' : 'EN'}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="size-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium">Loading dashboard...</p>
                  <p className="text-xs text-muted-foreground mt-1 font-handwriting">God&apos;s Grace Boutique</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ════════════════════ Dashboard Section ════════════════════ */}
              {activeSection === 'dashboard' && (
                <div className="space-y-6">
                  {/* Welcome Banner */}
                  <Card className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <CardContent className="p-6 lg:p-8 relative">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="font-handwriting text-2xl lg:text-3xl mb-1">Welcome to God&apos;s Grace</h2>
                          <p className="text-primary-foreground/80 text-sm">Boutique Admin Dashboard — Where Elegance Meets Faith</p>
                        </div>
                        <Sparkles className="size-10 text-primary-foreground/30 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <Card className="overflow-hidden">
                      <CardContent className="p-4 lg:p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Products</p>
                            <p className="text-2xl lg:text-3xl font-bold mt-1">{products.length}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{inStockProducts} in stock</p>
                          </div>
                          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="size-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardContent className="p-4 lg:p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Categories</p>
                            <p className="text-2xl lg:text-3xl font-bold mt-1">{categories.length}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">Active groups</p>
                          </div>
                          <div className="size-10 rounded-xl bg-chart-3/10 flex items-center justify-center shrink-0">
                            <FolderOpen className="size-5 text-chart-3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardContent className="p-4 lg:p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Orders</p>
                            <p className="text-2xl lg:text-3xl font-bold mt-1">{orders.length}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{pendingOrders} pending</p>
                          </div>
                          <div className="size-10 rounded-xl bg-chart-2/10 flex items-center justify-center shrink-0">
                            <ShoppingCart className="size-5 text-chart-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardContent className="p-4 lg:p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Revenue</p>
                            <p className="text-xl lg:text-2xl font-bold mt-1">{totalRevenue.toLocaleString()}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">FCFA total</p>
                          </div>
                          <div className="size-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                            <TrendingUp className="size-5 text-gold" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recent Orders */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-elegant flex items-center gap-2">
                            <ShoppingCart className="size-4 text-primary" /> Recent Orders
                          </CardTitle>
                          {orders.length > 5 && (
                            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveSection('orders')}>
                              View all <ChevronRight className="size-3" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {orders.length === 0 ? (
                          <div className="py-6 text-center">
                            <ShoppingCart className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No orders yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {orders.slice(0, 5).map(order => (
                              <div key={order.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-primary">{order.customerName.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{order.customerName}</p>
                                    <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-semibold text-sm">{order.total.toLocaleString()} <span className="text-[10px] text-muted-foreground">FCFA</span></span>
                                  <Badge
                                    variant={order.status === 'pending' ? 'outline' : order.status === 'delivered' ? 'default' : 'secondary'}
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-elegant flex items-center gap-2">
                          <BarChart3 className="size-4 text-primary" /> Store Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
                                <Sparkles className="size-4 text-chart-3" />
                              </div>
                              <span className="text-sm">Featured Products</span>
                            </div>
                            <Badge>{featuredProducts}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
                                <CheckCircle2 className="size-4 text-chart-2" />
                              </div>
                              <span className="text-sm">Delivered Orders</span>
                            </div>
                            <Badge variant="secondary">{deliveredOrders}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-gold/10 flex items-center justify-center">
                                <Heart className="size-4 text-gold" />
                              </div>
                              <span className="text-sm">Approved Testimonies</span>
                            </div>
                            <Badge variant="outline">{approvedTestimonies}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Clock className="size-4 text-primary" />
                              </div>
                              <span className="text-sm">Pending Testimonies</span>
                            </div>
                            <Badge variant="outline">{testimonies.length - approvedTestimonies}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-elegant flex items-center gap-2">
                        <FolderOpen className="size-4 text-primary" /> Products by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categories.length === 0 ? (
                        <div className="py-6 text-center">
                          <FolderOpen className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No categories yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer" onClick={() => setActiveSection('products')}>
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="size-10 rounded-lg object-cover bg-muted shrink-0" />
                              ) : (
                                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <FolderOpen className="size-4 text-primary" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{cat.name}</p>
                                <p className="text-[11px] text-muted-foreground">{cat.products?.length || 0} items</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ════════════════════ Products Section ════════════════════ */}
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
                      className="gap-2 shadow-md shadow-primary/20"
                    >
                      <Plus className="size-4" /> Add Product
                    </Button>
                  </div>

                  {/* Products - Desktop Table */}
                  {filteredProducts.length === 0 ? (
                    <Card>
                      <CardContent className="py-16 text-center">
                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Package className="size-8 text-primary/50" />
                        </div>
                        <p className="font-medium text-muted-foreground">No products found</p>
                        <p className="text-xs text-muted-foreground mt-1">Add your first product to get started</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Mobile: Card Layout */}
                      <div className="lg:hidden space-y-3">
                        {filteredProducts.map(product => (
                          <Card key={product.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="size-16 rounded-lg object-cover bg-muted shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png' }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">{product.name}</p>
                                      <p className="text-[11px] text-muted-foreground truncate">{product.nameFr}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button variant="ghost" size="icon" className="size-7" onClick={() => openEditProduct(product)}>
                                        <Pencil className="size-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => confirmDelete('product', product.id, product.name)}>
                                        <Trash2 className="size-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="font-semibold text-sm">{product.price.toLocaleString()} FCFA</span>
                                    {product.category && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{product.category.name}</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                      <Switch checked={product.inStock} onCheckedChange={() => toggleProductStock(product)} className="scale-75" />
                                      <span className={product.inStock ? 'text-green-600' : 'text-muted-foreground'}>Stock</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                      <Switch checked={product.featured} onCheckedChange={() => toggleProductFeatured(product)} className="scale-75" />
                                      <span className={product.featured ? 'text-gold' : 'text-muted-foreground'}>Featured</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Desktop: Table Layout */}
                      <Card className="hidden lg:block">
                        <CardContent className="p-0">
                          <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-14">Image</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Stock</TableHead>
                                  <TableHead>Featured</TableHead>
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
                                        className="size-10 rounded-lg object-cover bg-muted"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png' }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="min-w-0">
                                        <p className="font-medium text-sm truncate max-w-[200px]">{product.name}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.nameFr}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-xs">{product.category?.name || 'N/A'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <span className="font-semibold text-sm">{product.price.toLocaleString()} FCFA</span>
                                    </TableCell>
                                    <TableCell>
                                      <Switch
                                        checked={product.inStock}
                                        onCheckedChange={() => toggleProductStock(product)}
                                      />
                                    </TableCell>
                                    <TableCell>
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
                    </>
                  )}
                </div>
              )}

              {/* ════════════════════ Categories Section ════════════════════ */}
              {activeSection === 'categories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{categories.length} categories</p>
                    <Button onClick={() => { setCategoryForm({ name: '', nameFr: '', slug: '', image: '' }); setCategoryDialogOpen(true) }} className="gap-2 shadow-md shadow-primary/20">
                      <Plus className="size-4" /> Add Category
                    </Button>
                  </div>

                  {categories.length === 0 ? (
                    <Card>
                      <CardContent className="py-16 text-center">
                        <div className="size-16 rounded-2xl bg-chart-3/10 flex items-center justify-center mx-auto mb-4">
                          <FolderOpen className="size-8 text-chart-3/50" />
                        </div>
                        <p className="font-medium text-muted-foreground">No categories yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Add your first category to organize products</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {categories.map(cat => (
                        <Card key={cat.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-0">
                            {/* Category Image Banner */}
                            <div className="h-28 bg-gradient-to-br from-primary/5 to-chart-3/5 relative overflow-hidden">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <FolderOpen className="size-8 text-primary/20" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                              <div className="absolute bottom-2 left-3 right-3">
                                <p className="font-semibold text-sm text-white drop-shadow-md truncate">{cat.name}</p>
                              </div>
                              {/* Delete button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 size-7 bg-background/60 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => confirmDelete('category', cat.id, cat.name)}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                            {/* Category Info */}
                            <div className="p-3">
                              <p className="text-xs text-muted-foreground truncate">{cat.nameFr}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  /{cat.slug}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {cat.products?.length || 0} items
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ════════════════════ Orders Section ════════════════════ */}
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
                      <CardContent className="py-16 text-center">
                        <div className="size-16 rounded-2xl bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
                          <ShoppingCart className="size-8 text-chart-2/50" />
                        </div>
                        <p className="font-medium text-muted-foreground">No orders found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Mobile: Card Layout */}
                      <div className="lg:hidden space-y-3">
                        {filteredOrders.map(order => (
                          <Card key={order.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-primary">{order.customerName.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{order.customerName}</p>
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                      <Phone className="size-2.5" /> {order.customerPhone || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    order.status === 'delivered' ? 'default' :
                                    order.status === 'pending' ? 'outline' :
                                    order.status === 'cancelled' ? 'destructive' : 'secondary'
                                  }
                                  className="text-[10px] capitalize shrink-0"
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <Separator className="my-3" />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-sm">{order.total.toLocaleString()} FCFA</span>
                                  <Badge variant="outline" className="text-[10px] capitalize">{order.paymentMethod}</Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="size-7" onClick={() => { setSelectedOrder(order); setOrderDetailOpen(true) }}>
                                    <Eye className="size-3" />
                                  </Button>
                                  {order.status === 'pending' && (
                                    <Button variant="ghost" size="icon" className="size-7 text-green-600 hover:text-green-700" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                                      <CheckCircle2 className="size-3" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => confirmDelete('order', order.id, order.customerName)}>
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Desktop: Table Layout */}
                      <Card className="hidden lg:block">
                        <CardContent className="p-0">
                          <div className="max-h-[calc(100vh-14rem)] overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Customer</TableHead>
                                  <TableHead>Phone</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Payment</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredOrders.map(order => (
                                  <TableRow key={order.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                          <span className="text-[10px] font-bold text-primary">{order.customerName.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span className="font-medium text-sm">{order.customerName}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Phone className="size-3" /> {order.customerPhone || 'N/A'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className="font-semibold text-sm">{order.total.toLocaleString()} FCFA</span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-xs capitalize">{order.paymentMethod}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        value={order.status}
                                        onValueChange={(val) => updateOrderStatus(order.id, val)}
                                      >
                                        <SelectTrigger className={`h-7 text-xs capitalize w-[110px] ${
                                          order.status === 'delivered' ? 'border-green-500/50 text-green-600' :
                                          order.status === 'pending' ? 'border-yellow-500/50 text-yellow-600' :
                                          order.status === 'cancelled' ? 'border-red-500/50 text-red-600' : ''
                                        }`}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="processing">Processing</SelectItem>
                                          <SelectItem value="delivered">Delivered</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell>
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
                    </>
                  )}
                </div>
              )}

              {/* ════════════════════ Testimonies Section ════════════════════ */}
              {activeSection === 'testimonies' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {testimonies.length} testimonies ({approvedTestimonies} approved)
                    </p>
                  </div>

                  {testimonies.length === 0 ? (
                    <Card>
                      <CardContent className="py-16 text-center">
                        <div className="size-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                          <MessageSquareHeart className="size-8 text-gold/50" />
                        </div>
                        <p className="font-medium text-muted-foreground">No testimonies yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {testimonies.map(testimony => (
                        <Card key={testimony.id} className={`group overflow-hidden transition-all duration-300 ${testimony.approved ? 'ring-1 ring-green-500/20' : 'ring-1 ring-yellow-500/20'}`}>
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <div className={`size-11 rounded-full flex items-center justify-center shrink-0 ${
                                testimony.approved ? 'bg-green-500/10' : 'bg-yellow-500/10'
                              }`}>
                                <span className={`text-sm font-bold ${testimony.approved ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {testimony.name.charAt(0).toUpperCase()}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Name & Rating */}
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm">{testimony.name}</h3>
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`size-3 ${i < testimony.rating ? 'text-gold fill-gold' : 'text-muted-foreground/20'}`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Message */}
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{testimony.message}</p>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={testimony.approved ? 'default' : 'outline'}
                                      className={`text-[10px] gap-1 ${testimony.approved ? 'bg-green-600 hover:bg-green-700' : 'border-yellow-500/50 text-yellow-600'}`}
                                    >
                                      {testimony.approved ? (
                                        <><CheckCircle2 className="size-2.5" /> Approved</>
                                      ) : (
                                        <><Clock className="size-2.5" /> Pending</>
                                      )}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(testimony.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant={testimony.approved ? 'outline' : 'default'}
                                      size="sm"
                                      className={`text-[11px] gap-1 h-7 ${!testimony.approved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                      onClick={() => toggleTestimonyApproval(testimony)}
                                    >
                                      {testimony.approved ? <><StarOff className="size-3" /> Unapprove</> : <><CheckCircle2 className="size-3" /> Approve</>}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-[11px] gap-1 h-7 text-destructive hover:text-destructive"
                                      onClick={() => confirmDelete('testimony', testimony.id, testimony.name)}
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>
                                </div>
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

      {/* ════════════════════ Product Dialog ════════════════════ */}
      <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) resetProductForm() }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-elegant text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
              <Label>Product Image *</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-2 h-10 relative overflow-hidden"
                    disabled={productUploading}
                    onClick={() => document.getElementById('prod-file-input')?.click()}
                  >
                    {productUploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="h-4 w-4" /> Choose Image from Device</>
                    )}
                  </Button>
                  <input
                    id="prod-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'product')
                      e.target.value = ''
                    }}
                  />
                </div>
                <div className="relative">
                  <Input
                    value={productForm.image}
                    onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="Or paste image URL..."
                    className="pr-8"
                  />
                  {productForm.image && (
                    <button
                      type="button"
                      onClick={() => setProductForm(f => ({ ...f, image: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
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
            <div className="border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Image Preview</p>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive hover:text-destructive" onClick={() => setProductForm(f => ({ ...f, image: '' }))}>
                  <XIcon className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
              <img src={productForm.image} alt="Preview" className="h-32 w-auto rounded-lg object-cover bg-muted" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setProductDialogOpen(false); resetProductForm() }}>Cancel</Button>
            <Button onClick={handleProductSubmit} className="shadow-md shadow-primary/20">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Category Dialog ════════════════════ */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-elegant text-lg">Add New Category</DialogTitle>
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
              <Label>Category Image</Label>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10"
                  disabled={categoryUploading}
                  onClick={() => document.getElementById('cat-file-input')?.click()}
                >
                  {categoryUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Choose Image from Device</>
                  )}
                </Button>
                <input
                  id="cat-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'category')
                    e.target.value = ''
                  }}
                />
                <div className="relative">
                  <Input
                    value={categoryForm.image}
                    onChange={e => setCategoryForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="Or paste image URL..."
                    className="pr-8"
                  />
                  {categoryForm.image && (
                    <button
                      type="button"
                      onClick={() => setCategoryForm(f => ({ ...f, image: '' }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {categoryForm.image && (
                <div className="mt-2 rounded-lg overflow-hidden border bg-muted/30 p-2">
                  <img src={categoryForm.image} alt="Preview" className="h-24 w-auto rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCategorySubmit} className="shadow-md shadow-primary/20">Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Order Detail Dialog ════════════════════ */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-elegant text-lg">Order Details</DialogTitle>
            <DialogDescription>Viewing order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Customer Info Header */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{selectedOrder.customerName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3" /> {selectedOrder.customerPhone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Payment</p>
                  <Badge variant="outline" className="capitalize mt-1">{selectedOrder.paymentMethod}</Badge>
                </div>
                <div className="p-3 rounded-xl bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Status</p>
                  <Badge
                    variant={selectedOrder.status === 'pending' ? 'outline' : selectedOrder.status === 'delivered' ? 'default' : 'secondary'}
                    className="capitalize mt-1"
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Order Items</p>
                <div className="bg-muted/40 rounded-xl p-3 max-h-48 overflow-y-auto">
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

              {/* Total */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg text-primary">{selectedOrder.total.toLocaleString()} FCFA</span>
              </div>

              {/* Date */}
              <p className="text-[11px] text-muted-foreground">
                Ordered on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════ Delete Confirmation Dialog ════════════════════ */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Deletion</DialogTitle>
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
