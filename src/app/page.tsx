'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Menu, X, Globe, Star, Trash2, Plus, Minus,
  Phone, MessageCircle, MapPin, CreditCard, ChevronRight,
  Heart, Sparkles, Eye, Filter, ShoppingBagIcon, Send, ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore, CartItem } from '@/store/cart';
import { useLangStore } from '@/store/lang';
import { translations, Language } from '@/lib/i18n';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/admin-dashboard'), {
  ssr: false,
});

interface Product {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  price: number;
  image: string;
  categoryId: string;
  inStock: boolean;
  featured: boolean;
  category: { id: string; name: string; nameFr: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  nameFr: string;
  slug: string;
  image: string | null;
}

interface Testimony {
  id: string;
  name: string;
  message: string;
  rating: number;
  approved: boolean;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const { items, addItem, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const { lang, toggleLang } = useLangStore();
  const t = translations[lang];

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes, testimoniesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/testimonies'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const testimoniesData = await testimoniesRes.json();
      setProducts(productsData);
      setCategories(categoriesData);
      setTestimonies(testimoniesData.filter((t: Testimony) => t.approved));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.categoryId === selectedCategory);

  const getCategoryName = (cat: Category) => lang === 'fr' ? cat.nameFr : cat.name;
  const getProductName = (p: Product) => lang === 'fr' ? p.nameFr : p.name;
  const getProductDesc = (p: Product) => lang === 'fr' ? p.descriptionFr : p.description;

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      nameFr: product.nameFr,
      price: product.price,
      image: product.image,
    });
    toast.success(lang === 'fr' ? 'Ajouté au panier !' : 'Added to cart!', {
      description: getProductName(product),
    });
  };

  const handleWhatsAppOrder = () => {
    if (items.length === 0) {
      toast.error(lang === 'fr' ? 'Votre panier est vide' : 'Your cart is empty');
      return;
    }
    const phoneNumber = '22575354633';
    let message = lang === 'fr' 
      ? '🛍️ *Nouvelle Commande - God\'s Grace Boutique*\n\n'
      : '🛍️ *New Order - God\'s Grace Boutique*\n\n';
    
    items.forEach((item, index) => {
      const name = lang === 'fr' ? item.nameFr : item.name;
      message += `${index + 1}. ${name} x${item.quantity} - ${item.price * item.quantity} FCFA\n`;
    });
    
    message += `\n💰 *${t.cartTotal}: ${totalPrice()} FCFA*`;
    message += `\n\n💳 ${t.paymentInfo}:`;
    message += `\n- Wave: +225 0575354633`;
    message += `\n- MTN Money: +225 0575354633`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleTestimonySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    const rating = parseInt(formData.get('rating') as string) || 5;

    try {
      const res = await fetch('/api/testimonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, rating }),
      });
      if (res.ok) {
        toast.success(lang === 'fr' ? 'Témoignage soumis pour approbation !' : 'Testimony submitted for approval!');
        (e.target as HTMLFormElement).reset();
      }
    } catch {
      toast.error(t.error);
    }
  };

  // Secret admin access: keyboard shortcut Ctrl+Shift+Alt+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowAdmin(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag-to-scroll for featured carousel
  useEffect(() => {
    const container = document.getElementById('featured-scroll');
    if (!container) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };
    const onMouseLeave = () => { isDown = false; container.style.cursor = 'grab'; };
    const onMouseUp = () => { isDown = false; container.style.cursor = 'grab'; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [isLoaded]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: t.home },
    { id: 'about', label: t.about },
    { id: 'products', label: t.products },
    { id: 'testimony', label: t.testimony },
    { id: 'contact', label: t.contact },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (showAdmin) {
    return <AdminDashboard onBackToStore={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
              <img src="/images/logo.png" alt="God's Grace Boutique" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full object-cover" />
              <div className="block sm:block">
                <h1 className="text-base sm:text-lg md:text-xl font-normal text-primary leading-tight font-handwriting">God&apos;s Grace</h1>
                <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground tracking-[0.15em] sm:tracking-[0.2em] uppercase">Boutique</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLang}
                className="gap-1.5 text-xs font-semibold"
              >
                <Globe className="h-3.5 w-3.5" />
                {lang === 'en' ? 'FR' : 'EN'}
              </Button>

              {/* Cart */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">{t.cart}</span>
                    {hasMounted && items.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground">
                        {items.reduce((s, i) => s + i.quantity, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[420px] flex flex-col p-0">
                  {/* Cart Header */}
                  <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-3 text-primary-foreground">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-lg font-elegant">{t.cartTitle}</div>
                          {items.length > 0 && (
                            <div className="text-xs text-primary-foreground/70 font-normal">
                              {items.reduce((s, i) => s + i.quantity, 0)} {lang === 'fr' ? 'article(s)' : 'item(s)'}
                            </div>
                          )}
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                  </div>

                  {/* Cart Body */}
                  <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin' }}>
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 py-12">
                        <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
                          <ShoppingBagIcon className="h-12 w-12 opacity-20" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-base text-foreground/60">{t.cartEmpty}</p>
                          <p className="text-sm mt-1 text-muted-foreground/60">
                            {lang === 'fr' ? 'Parcourez nos collections' : 'Browse our collections'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="group bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                            <div className="flex gap-0">
                              {/* Product Image */}
                              <div className="relative w-28 h-28 flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={lang === 'fr' ? item.nameFr : item.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                  <Badge className="h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary/90 text-primary-foreground backdrop-blur-sm">
                                    {item.quantity}
                                  </Badge>
                                </div>
                              </div>
                              {/* Product Info */}
                              <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-semibold text-sm truncate pr-6">{lang === 'fr' ? item.nameFr : item.name}</h4>
                                  <p className="text-primary font-bold text-sm mt-0.5">{item.price.toLocaleString()} {t.currency}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 bg-muted/50 rounded-full p-0.5">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="h-7 w-7 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="text-sm font-bold w-7 text-center">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="h-7 w-7 rounded-full bg-background border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary">
                                      {(item.price * item.quantity).toLocaleString()} {t.currency}
                                    </span>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {items.length > 0 && (
                    <div className="border-t bg-muted/20">
                      {/* Payment Info */}
                      <div className="px-5 pt-4 pb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {t.paymentInfo}
                        </p>
                        <div className="flex gap-3">
                          <div className="flex-1 flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-2.5 border border-blue-100 dark:border-blue-900/50">
                            <div className="h-7 w-7 bg-blue-500 rounded-lg text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">W</div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Wave</p>
                              <p className="text-xs font-bold truncate">+225 0575354633</p>
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl px-3 py-2.5 border border-yellow-100 dark:border-yellow-900/50">
                            <div className="h-7 w-7 bg-yellow-500 rounded-lg text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">M</div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">MTN Money</p>
                              <p className="text-xs font-bold truncate">+225 0575354633</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total & Actions */}
                      <div className="px-5 pt-3 pb-5 space-y-3">
                        <div className="flex items-center justify-between bg-primary/5 rounded-xl px-4 py-3">
                          <span className="font-semibold text-sm">{t.cartTotal}</span>
                          <span className="text-primary font-bold text-lg font-elegant">{totalPrice().toLocaleString()} {t.currency}</span>
                        </div>
                        <Button onClick={handleWhatsAppOrder} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-base py-6 rounded-xl font-semibold shadow-lg shadow-green-600/20">
                          <MessageCircle className="h-5 w-5" />
                          {t.whatsappOrder}
                        </Button>
                        <button onClick={clearCart} className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors py-1">
                          {lang === 'fr' ? 'Vider le panier' : 'Clear cart'}
                        </button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {/* Mobile Menu */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b border-border overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[85vh] sm:min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero.png" alt="God's Grace Boutique" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <Badge className="mb-3 sm:mb-4 bg-primary/90 text-primary-foreground px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
              {lang === 'fr' ? 'Nouvelle Collection' : 'New Collection'}
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-3 sm:mb-4 leading-tight font-elegant">
              {t.heroTitle}
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white/80 mb-2 font-handwriting">
              {t.heroSubtitle}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/60 mb-6 sm:mb-8 max-w-lg">
              {t.heroDescription}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button onClick={() => scrollTo('products')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base gap-2">
                {t.shopNow}
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => scrollTo('contact')} variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base">
                {t.contact}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <img src="/images/about.png" alt="About God's Grace Boutique" className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8" />
                  <p className="text-sm font-medium mt-2 font-handwriting">
                    {lang === 'fr' ? 'Avec Amour' : 'Made with Love'}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div>
                <Badge variant="secondary" className="mb-4">{t.about}</Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-elegant">{t.aboutTitle}</h2>
              </div>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {t.aboutDescription}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <Card className="bg-primary/5 border-primary/10">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-primary font-elegant">{t.aboutMission}</h3>
                    <p className="text-sm text-muted-foreground">{t.aboutMissionText}</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-primary font-elegant">{t.aboutValues}</h3>
                    <p className="text-sm text-muted-foreground">{t.aboutValuesText}</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Collection - Horizontal Scroll */}
      <section id="collection" className="py-12 sm:py-16 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              {lang === 'fr' ? 'En Vedette' : 'Featured'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-elegant">
              {lang === 'fr' ? 'Notre Collection' : 'Our Collection'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {lang === 'fr'
                ? 'Découvrez nos pièces les plus tendance'
                : 'Discover our trending pieces'}
            </p>
          </motion.div>

          {/* Horizontal Scrolling Products */}
          {products.filter(p => p.featured).length > 0 ? (
            <div className="relative group/carousel">
              {/* Left Arrow */}
              <button
                onClick={() => {
                  const container = document.getElementById('featured-scroll');
                  container?.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg border border-border/50 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-primary-foreground -translate-x-1"
                aria-label="Scroll left"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
              {/* Right Arrow */}
              <button
                onClick={() => {
                  const container = document.getElementById('featured-scroll');
                  container?.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg border border-border/50 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-primary-foreground translate-x-1"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              {/* Scroll Container */}
              <div
                id="featured-scroll"
                className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0"
                style={{
                  scrollbarWidth: 'thin',
                  WebkitOverflowScrolling: 'touch',
                  cursor: 'grab',
                }}
              >
                {products.filter(p => p.featured).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-none w-[75vw] sm:w-[280px] md:w-[300px] snap-start"
                  >
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 h-full flex flex-col">
                      <div className="relative overflow-hidden aspect-[3/4]">
                        <img
                          src={product.image}
                          alt={getProductName(product)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                            <Star className="h-2.5 w-2.5 mr-0.5" />
                            {lang === 'fr' ? 'Vedette' : 'Featured'}
                          </Badge>
                          {!product.inStock && (
                            <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                              {t.outOfStock}
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 text-foreground shadow-sm text-[10px] font-bold px-2 py-0.5">
                            {getCategoryName(product.category)}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                          {getProductName(product)}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                          {getProductDesc(product)}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-primary font-bold text-sm">
                            {product.price.toLocaleString()} {t.currency}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                            className="gap-1 text-xs h-8 px-3"
                          >
                            <ShoppingBag className="h-3 w-3" />
                            {product.inStock ? t.addToCart : t.outOfStock}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {/* Scroll Hint Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {products.filter(p => p.featured).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const container = document.getElementById('featured-scroll');
                      const scrollAmount = i * 320;
                      container?.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                    }}
                    className="h-2 w-2 rounded-full bg-primary/30 hover:bg-primary transition-colors"
                    aria-label={`Go to item ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBagIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">
                {lang === 'fr' ? 'Aucun produit en vedette' : 'No featured products yet'}
              </p>
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-8">
            <Button
              onClick={() => scrollTo('products')}
              size="lg"
              variant="outline"
              className="gap-2 px-8 py-5 text-sm border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {lang === 'fr' ? 'Voir Tous les Produits' : 'View All Products'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section id="products" className="py-12 sm:py-16 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">{t.products}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-elegant">
              {lang === 'fr' ? 'Tous les Produits' : 'All Products'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {lang === 'fr'
                ? 'Parcourez notre sélection complète de mode et accessoires'
                : 'Browse our complete selection of fashion and accessories'}
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex overflow-x-auto gap-2 mb-8 sm:mb-10 pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              {t.allCategories}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {getCategoryName(cat)}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 h-full flex flex-col">
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={product.image}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col gap-0.5 sm:gap-1">
                      {product.featured && (
                        <Badge className="bg-primary text-primary-foreground text-[8px] sm:text-[10px] px-1 sm:px-2 py-0 sm:py-0.5">
                          <Star className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                          {lang === 'fr' ? 'Vedette' : 'Featured'}
                        </Badge>
                      )}
                      {!product.inStock && (
                        <Badge variant="destructive" className="text-[8px] sm:text-[10px] px-1 sm:px-2 py-0 sm:py-0.5">
                          {t.outOfStock}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                      <Badge className="bg-white/90 text-foreground shadow-sm text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0 sm:py-0.5 hidden sm:inline-flex">
                        {getCategoryName(product.category)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1 line-clamp-1">
                      {getProductName(product)}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2 flex-1">
                      {getProductDesc(product)}
                    </p>
                    <div className="flex items-center justify-between mt-auto gap-1">
                      <span className="text-primary font-bold text-xs sm:text-sm md:text-base">
                        {product.price.toLocaleString()} {t.currency}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="gap-0.5 sm:gap-1 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        {product.inStock ? t.addToCart : t.outOfStock}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBagIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">
                {lang === 'fr' ? 'Aucun produit trouvé' : 'No products found'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimony Section */}
      <section id="testimony" className="py-12 sm:py-16 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">{t.testimony}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-elegant">{t.testimonyTitle}</h2>
            <p className="text-muted-foreground">{t.testimonySubtitle}</p>
          </motion.div>

          {/* Testimonies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testimonies.map((testimony, index) => (
              <motion.div
                key={testimony.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: testimony.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                      {Array.from({ length: 5 - testimony.rating }).map((_, i) => (
                        <Star key={`empty-${i}`} className="h-4 w-4 text-muted" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">
                      &ldquo;{testimony.message}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{testimony.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimony.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-primary text-primary inline mr-1" />
                          {testimony.rating}/5
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Submit Testimony */}
          <Card className="max-w-xl mx-auto">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-center font-elegant">
                {lang === 'fr' ? 'Partagez Votre Expérience' : 'Share Your Experience'}
              </h3>
              <form onSubmit={handleTestimonySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="testimony-name">
                    {lang === 'fr' ? 'Votre Nom' : 'Your Name'}
                  </Label>
                  <Input id="testimony-name" name="name" required placeholder={lang === 'fr' ? 'Entrez votre nom' : 'Enter your name'} />
                </div>
                <div>
                  <Label htmlFor="testimony-message">
                    {lang === 'fr' ? 'Votre Message' : 'Your Message'}
                  </Label>
                  <Textarea id="testimony-message" name="message" required placeholder={lang === 'fr' ? 'Partagez votre expérience...' : 'Share your experience...'} rows={3} />
                </div>
                <div>
                  <Label htmlFor="testimony-rating">
                    {lang === 'fr' ? 'Note' : 'Rating'}
                  </Label>
                  <Select name="rating" defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ (5/5)</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ (4/5)</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ (3/5)</SelectItem>
                      <SelectItem value="2">⭐⭐ (2/5)</SelectItem>
                      <SelectItem value="1">⭐ (1/5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  {lang === 'fr' ? 'Soumettre' : 'Submit'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">{t.contact}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-elegant">{t.contactTitle}</h2>
            <p className="text-muted-foreground">{t.contactSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2 font-elegant">{t.contactPhone}</h3>
                <a href="tel:+2250575354633" className="text-primary font-medium hover:underline">+225 0575354633</a>
                <div className="mt-3">
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                    <a href="https://wa.me/22575354633" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2 font-elegant">{t.contactPayment}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-6 w-6 bg-blue-500 rounded text-white text-[10px] font-bold flex items-center justify-center">W</div>
                    <span>{t.contactWave}: +225 0575354633</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-6 w-6 bg-yellow-500 rounded text-white text-[10px] font-bold flex items-center justify-center">M</div>
                    <span>{t.contactMtn}: +225 0575354633</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2 font-elegant">{t.contactAddress}</h3>
                <p className="text-sm text-muted-foreground">{t.contactAddressText}</p>
              </CardContent>
            </Card>
          </div>

          {/* WhatsApp Order CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Card className="max-w-2xl mx-auto bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-8">
                <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2 font-elegant">
                  {lang === 'fr' ? 'Commandez Facilement!' : 'Order Easily!'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {lang === 'fr' 
                    ? 'Ajoutez vos articles au panier et cliquez sur le bouton WhatsApp pour commander'
                    : 'Add items to your cart and click the WhatsApp button to place your order'}
                </p>
                <Button
                  onClick={handleWhatsAppOrder}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8 py-6 text-base"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t.whatsappOrder}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/logo.png" alt="God's Grace Boutique" className="h-10 w-10 rounded-full object-cover border-2 border-primary" />
                <div>
                  <h3 className="font-handwriting text-xl md:text-2xl text-background">God&apos;s Grace</h3>
                  <p className="text-xs text-background/60">Boutique</p>
                </div>
              </div>
              <p className="text-sm text-background/60 mb-4 font-handwriting text-base">{t.footerTagline}</p>
              <p className="text-sm text-background/60">{t.footerMadeWith}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider font-elegant">{t.footerQuickLinks}</h3>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="block text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider font-elegant">{t.footerCategories}</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      scrollTo('products');
                    }}
                    className="block text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {getCategoryName(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider font-elegant">{t.footerContact}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-background/60">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+225 0575354633</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-background/60">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <a href="https://wa.me/22575354633" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-background/60">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  <span>Wave & MTN Money</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-background/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-background/40">
              © {new Date().getFullYear()} God&apos;s Grace Boutique. {t.footerRights}
            </p>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className="text-background/60 hover:text-primary">
                <a href="https://wa.me/22575354633" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-background/60 hover:text-primary">
                <a href="tel:+2250575354633">
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
          >
            <Button
              size="icon"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 bg-primary hover:bg-primary/90"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button (Mobile) */}
      <div className="fixed bottom-4 left-4 z-40 md:hidden">
        <Button
          onClick={handleWhatsAppOrder}
          className="rounded-full shadow-lg h-12 w-12 bg-green-600 hover:bg-green-700 text-white p-0"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
