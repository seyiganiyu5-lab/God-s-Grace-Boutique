export const translations = {
  en: {
    // Navigation
    home: "Home",
    about: "About",
    products: "Products",
    testimony: "Testimony",
    contact: "Contact Us",
    cart: "Cart",
    
    // Hero
    heroTitle: "God's Grace Boutique",
    heroSubtitle: "Where Elegance Meets Faith",
    heroDescription: "Discover our exquisite collection of African-inspired fashion, jewelry, and accessories crafted with love and grace.",
    shopNow: "Shop Now",
    
    // About
    aboutTitle: "About Us",
    aboutDescription: "God's Grace Boutique is a premier fashion destination that celebrates the beauty of African-inspired style. Founded with a mission to empower women through fashion, we curate a stunning collection of clothing, jewelry, shoes, and accessories that blend contemporary trends with timeless elegance.",
    aboutMission: "Our Mission",
    aboutMissionText: "To provide high-quality, affordable fashion that makes every woman feel confident, beautiful, and blessed. We believe that fashion is a form of self-expression and every piece you wear should reflect your unique grace.",
    aboutValues: "Our Values",
    aboutValuesText: "Quality, affordability, and customer satisfaction are at the heart of everything we do. We carefully select each item in our collection to ensure it meets our high standards.",
    
    // Products
    allCategories: "All Categories",
    femaleShoes: "Female Shoes",
    femaleClothes: "Female Clothes",
    jewelries: "Jewelries",
    wristwatch: "Wristwatch",
    scarf: "Scarf",
    lace: "Lace (Clothe)",
    pagne: "Pagne (Wrapper)",
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    filterBy: "Filter by Category",
    
    // Testimony
    testimonyTitle: "What Our Customers Say",
    testimonySubtitle: "Real stories from our blessed customers",
    
    // Contact
    contactTitle: "Contact Us",
    contactSubtitle: "We'd love to hear from you",
    contactPhone: "Phone / WhatsApp",
    contactPayment: "Payment Methods",
    contactWave: "Wave",
    contactMtn: "MTN Money",
    contactAddress: "Visit Us",
    contactAddressText: "God's Grace Boutique - Your Fashion Destination",
    
    // Cart
    cartTitle: "Your Cart",
    cartEmpty: "Your cart is empty",
    cartTotal: "Total",
    cartRemove: "Remove",
    whatsappOrder: "WhatsApp to Order",
    cartItem: "item",
    cartItems: "items",
    
    // Footer
    footerTagline: "Where Elegance Meets Faith",
    footerQuickLinks: "Quick Links",
    footerCategories: "Categories",
    footerContact: "Contact",
    footerRights: "All rights reserved.",
    footerMadeWith: "Made with ❤️ and Grace",
    
    // Common
    price: "Price",
    currency: "FCFA",
    loading: "Loading...",
    error: "Something went wrong",
    success: "Success!",
    
    // Payment
    paymentInfo: "Payment Information",
    paymentWave: "Wave: 0575354633",
    paymentMtn: "MTN Money: 0575354633",
  },
  fr: {
    // Navigation
    home: "Accueil",
    about: "À Propos",
    products: "Produits",
    testimony: "Témoignages",
    contact: "Contactez-Nous",
    cart: "Panier",
    
    // Hero
    heroTitle: "God's Grace Boutique",
    heroSubtitle: "L'Élégance Rencontre la Foi",
    heroDescription: "Découvrez notre collection exquise de mode inspirée de l'Afrique, de bijoux et d'accessoires créés avec amour et grâce.",
    shopNow: "Acheter Maintenant",
    
    // About
    aboutTitle: "À Propos de Nous",
    aboutDescription: "God's Grace Boutique est une destination mode de premier plan qui célèbre la beauté du style inspiré de l'Afrique. Fondée avec la mission d'autonomiser les femmes à travers la mode, nous proposons une collection magnifique de vêtements, bijoux, chaussures et accessoires qui allient tendances contemporaines et élégance intemporelle.",
    aboutMission: "Notre Mission",
    aboutMissionText: "Offrir une mode de haute qualité et abordable qui permet à chaque femme de se sentir confiante, belle et bénie. Nous croyons que la mode est une forme d'expression de soi et que chaque pièce que vous portez devrait refléter votre grâce unique.",
    aboutValues: "Nos Valeurs",
    aboutValuesText: "La qualité, l'abordabilité et la satisfaction du client sont au cœur de tout ce que nous faisons. Nous sélectionnons soigneusement chaque article de notre collection pour nous assurer qu'il répond à nos normes élevées.",
    
    // Products
    allCategories: "Toutes les Catégories",
    femaleShoes: "Chaussures Femme",
    femaleClothes: "Vêtements Femme",
    jewelries: "Bijoux",
    wristwatch: "Montre-bracelet",
    scarf: "Foulard",
    lace: "Dentelle (Tissu)",
    pagne: "Pagne (Wrapper)",
    addToCart: "Ajouter au Panier",
    outOfStock: "Rupture de Stock",
    inStock: "En Stock",
    filterBy: "Filtrer par Catégorie",
    
    // Testimony
    testimonyTitle: "Ce Que Disent Nos Clients",
    testimonySubtitle: "Histoires vraies de nos clients bénis",
    
    // Contact
    contactTitle: "Contactez-Nous",
    contactSubtitle: "Nous aimerions avoir de vos nouvelles",
    contactPhone: "Téléphone / WhatsApp",
    contactPayment: "Moyens de Paiement",
    contactWave: "Wave",
    contactMtn: "MTN Money",
    contactAddress: "Visitez-Nous",
    contactAddressText: "God's Grace Boutique - Votre Destination Mode",
    
    // Cart
    cartTitle: "Votre Panier",
    cartEmpty: "Votre panier est vide",
    cartTotal: "Total",
    cartRemove: "Retirer",
    whatsappOrder: "Commander par WhatsApp",
    cartItem: "article",
    cartItems: "articles",
    
    // Footer
    footerTagline: "L'Élégance Rencontre la Foi",
    footerQuickLinks: "Liens Rapides",
    footerCategories: "Catégories",
    footerContact: "Contact",
    footerRights: "Tous droits réservés.",
    footerMadeWith: "Fait avec ❤️ et Grâce",
    
    // Common
    price: "Prix",
    currency: "FCFA",
    loading: "Chargement...",
    error: "Quelque chose s'est mal passé",
    success: "Succès!",
    
    // Payment
    paymentInfo: "Informations de Paiement",
    paymentWave: "Wave : 0575354633",
    paymentMtn: "MTN Money : 0575354633",
  }
} as const;

export type Language = "en" | "fr";
export type TranslationKey = keyof typeof translations.en;
