import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Check if categories already exist
    const existingCategories = await db.category.count();
    if (existingCategories > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existingCategories });
    }

    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Female Shoes',
          nameFr: 'Chaussures Femme',
          slug: 'female-shoes',
          image: '/images/female-shoes.png',
        },
      }),
      db.category.create({
        data: {
          name: 'Female Clothes',
          nameFr: 'Vêtements Femme',
          slug: 'female-clothes',
          image: '/images/female-clothes.png',
        },
      }),
      db.category.create({
        data: {
          name: 'Jewelries',
          nameFr: 'Bijoux',
          slug: 'jewelries',
          image: '/images/jewelry.png',
        },
      }),
      db.category.create({
        data: {
          name: 'Wristwatch',
          nameFr: 'Montre-bracelet',
          slug: 'wristwatch',
          image: '/images/wristwatch.png',
        },
      }),
      db.category.create({
        data: {
          name: 'Scarf',
          nameFr: 'Foulard',
          slug: 'scarf',
          image: '/images/scarf.png',
        },
      }),
      db.category.create({
        data: {
          name: 'Lace (Clothe)',
          nameFr: 'Dentelle (Tissu)',
          slug: 'lace',
          image: '/images/lace.png',
        },
      }),
      db.category.create({
        data: {
          name: 'Pagne (Wrapper)',
          nameFr: 'Pagne (Wrapper)',
          slug: 'pagne',
          image: '/images/pagne.png',
        },
      }),
    ]);

    // Create sample products for each category
    const productsData = [
      // Female Shoes
      { name: 'Elegant High Heels', nameFr: 'Talons Hauts Élégants', description: 'Beautiful high heels perfect for any occasion', descriptionFr: 'Beaux talons hauts parfaits pour toute occasion', price: 15000, image: '/images/female-shoes.png', categoryId: categories[0].id, featured: true },
      { name: 'Comfortable Flats', nameFr: 'Ballerines Confortables', description: 'Stylish and comfortable flat shoes', descriptionFr: 'Chaussures plates élégantes et confortables', price: 10000, image: '/images/female-shoes.png', categoryId: categories[0].id, featured: false },
      { name: 'Ankle Strap Sandals', nameFr: 'Sandales à Bride', description: 'Trendy ankle strap sandals for casual wear', descriptionFr: 'Sandales à bride tendance pour le port décontracté', price: 12000, image: '/images/female-shoes.png', categoryId: categories[0].id, featured: true },
      { name: 'Girls School Shoes', nameFr: 'Chaussures Scolaires Filles', description: 'Durable and cute school shoes for girls', descriptionFr: 'Chaussures scolaires durables et mignonnes pour filles', price: 8000, image: '/images/female-shoes.png', categoryId: categories[0].id, featured: false },
      
      // Female Clothes
      { name: 'Ankara Midi Dress', nameFr: 'Robe Midi Ankara', description: 'Stunning Ankara print midi dress for women', descriptionFr: 'Magnifique robe midi imprimé Ankara pour femmes', price: 25000, image: '/images/female-clothes.png', categoryId: categories[1].id, featured: true },
      { name: 'Casual Blouse', nameFr: 'Blouse Décontractée', description: 'Elegant casual blouse for everyday wear', descriptionFr: 'Blouse décontractée élégante pour tous les jours', price: 12000, image: '/images/female-clothes.png', categoryId: categories[1].id, featured: false },
      { name: 'Girls Party Dress', nameFr: 'Robe de Fête Filles', description: 'Adorable party dress for girls', descriptionFr: 'Adorable robe de fête pour filles', price: 10000, image: '/images/female-clothes.png', categoryId: categories[1].id, featured: true },
      { name: 'Formal Office Wear', nameFr: 'Tenue de Bureau Formelle', description: 'Professional and elegant office wear', descriptionFr: 'Tenue de bureau professionnelle et élégante', price: 30000, image: '/images/female-clothes.png', categoryId: categories[1].id, featured: false },
      { name: 'Girls Casual Set', nameFr: 'Ensemble Décontracté Filles', description: 'Comfortable casual set for girls', descriptionFr: 'Ensemble décontracté confortable pour filles', price: 8000, image: '/images/female-clothes.png', categoryId: categories[1].id, featured: false },
      
      // Jewelries
      { name: 'Gold Earrings Set', nameFr: 'Ensemble Boucles d\'Oreilles Or', description: 'Elegant gold-plated earrings set', descriptionFr: 'Ensemble élégant de boucles d\'oreilles dorées', price: 8000, image: '/images/jewelry.png', categoryId: categories[2].id, featured: true },
      { name: 'Pearl Bracelet', nameFr: 'Bracelet de Perles', description: 'Beautiful pearl bracelet for any occasion', descriptionFr: 'Magnifique bracelet de perles pour toute occasion', price: 6000, image: '/images/jewelry.png', categoryId: categories[2].id, featured: false },
      { name: 'Statement Necklace', nameFr: 'Collier Statement', description: 'Eye-catching statement necklace', descriptionFr: 'Collier statement accrocheur', price: 10000, image: '/images/jewelry.png', categoryId: categories[2].id, featured: true },
      { name: 'Complete Chain Set - Adult', nameFr: 'Ensemble Chaîne Complet - Adulte', description: 'Complete chain set with necklace, bracelet and earrings for women', descriptionFr: 'Ensemble chaîne complet avec collier, bracelet et boucles d\'oreilles pour femmes', price: 20000, image: '/images/jewelry.png', categoryId: categories[2].id, featured: true },
      { name: 'Complete Chain Set - Girls', nameFr: 'Ensemble Chaîne Complet - Filles', description: 'Beautiful chain set for girls', descriptionFr: 'Magnifique ensemble chaîne pour filles', price: 10000, image: '/images/jewelry.png', categoryId: categories[2].id, featured: false },
      
      // Wristwatch
      { name: 'Luxury Gold Watch', nameFr: 'Montre de Luxe Or', description: 'Premium gold-plated wristwatch for everyone', descriptionFr: 'Montre-bracelet plaquée or premium pour tous', price: 35000, image: '/images/wristwatch.png', categoryId: categories[3].id, featured: true },
      { name: 'Sport Digital Watch', nameFr: 'Montre Digitale Sport', description: 'Modern digital sport watch', descriptionFr: 'Montre sport digitale moderne', price: 15000, image: '/images/wristwatch.png', categoryId: categories[3].id, featured: false },
      { name: 'Silver Classic Watch', nameFr: 'Montre Classique Argent', description: 'Classic silver-tone watch for any occasion', descriptionFr: 'Montre classique argent pour toute occasion', price: 25000, image: '/images/wristwatch.png', categoryId: categories[3].id, featured: true },
      
      // Scarf
      { name: 'Silk African Scarf', nameFr: 'Foulard Africain en Soie', description: 'Premium silk scarf with African patterns', descriptionFr: 'Foulard en soie premium avec motifs africains', price: 7000, image: '/images/scarf.png', categoryId: categories[4].id, featured: true },
      { name: 'Head Wrap Set', nameFr: 'Ensemble Turban', description: 'Beautiful head wrap set in multiple colors', descriptionFr: 'Magnifique ensemble turban en plusieurs couleurs', price: 5000, image: '/images/scarf.png', categoryId: categories[4].id, featured: false },
      { name: 'Cotton Print Scarf', nameFr: 'Foulard Imprimé Coton', description: 'Soft cotton scarf with vibrant prints', descriptionFr: 'Foulard en coton doux avec impressions vibrantes', price: 4000, image: '/images/scarf.png', categoryId: categories[4].id, featured: false },
      
      // Lace
      { name: 'Premium White Lace', nameFr: 'Dentelle Blanche Premium', description: 'High-quality white lace fabric for dressmaking', descriptionFr: 'Tissu de dentelle blanche de haute qualité pour la confection', price: 15000, image: '/images/lace.png', categoryId: categories[5].id, featured: true },
      { name: 'Ivory Lace Fabric', nameFr: 'Tissu Dentelle Ivoire', description: 'Elegant ivory lace fabric for special occasions', descriptionFr: 'Tissu dentelle ivoire élégant pour occasions spéciales', price: 18000, image: '/images/lace.png', categoryId: categories[5].id, featured: false },
      { name: 'Colored Lace Material', nameFr: 'Tissu Dentelle Coloré', description: 'Beautiful colored lace fabric available in various colors', descriptionFr: 'Magnifique tissu dentelle coloré disponible en plusieurs couleurs', price: 12000, image: '/images/lace.png', categoryId: categories[5].id, featured: false },
      
      // Pagne (Wrapper)
      { name: 'Ankara Pagne Set', nameFr: 'Ensemble Pagne Ankara', description: 'Beautiful Ankara print pagne wrapper set', descriptionFr: 'Magnifique ensemble pagne imprimé Ankara', price: 10000, image: '/images/pagne.png', categoryId: categories[6].id, featured: true },
      { name: 'Wax Print Wrapper', nameFr: 'Wrapper Impression Wax', description: 'High-quality wax print wrapper', descriptionFr: 'Wrapper impression wax de haute qualité', price: 8000, image: '/images/pagne.png', categoryId: categories[6].id, featured: false },
      { name: 'Premium Kente Pagne', nameFr: 'Pagne Kente Premium', description: 'Premium Kente cloth pagne for special events', descriptionFr: 'Pagne Kente premium pour événements spéciaux', price: 25000, image: '/images/pagne.png', categoryId: categories[6].id, featured: true },
    ];

    await db.product.createMany({ data: productsData });

    // Create sample testimonies
    const testimoniesData = [
      { name: 'Marie Koffi', message: 'I absolutely love the dresses from God\'s Grace Boutique! The quality is amazing and the prices are so affordable. I always get compliments when I wear them.', rating: 5, approved: true },
      { name: 'Adjo Mensah', message: 'The jewelry collection is stunning! I bought a complete chain set for my daughter and she was so happy. Thank you God\'s Grace Boutique!', rating: 5, approved: true },
      { name: 'Fatou Diallo', message: 'Best place to get quality African fashion. The Ankara pagne is beautiful and the customer service is excellent. God bless this business!', rating: 5, approved: true },
      { name: 'Aminata Toure', message: 'I ordered shoes for my wife and she loves them! Fast delivery and great quality. I will definitely order again.', rating: 4, approved: true },
      { name: 'Kadiatou Bah', message: 'The lace fabric is premium quality. I made a beautiful dress for my sister\'s wedding. Thank you for making such beautiful fabrics available.', rating: 5, approved: true },
    ];

    await db.testimony.createMany({ data: testimoniesData });

    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      categories: categories.length,
      products: productsData.length,
      testimonies: testimoniesData.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
