import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json()

    if (!text || !from || !to) {
      return NextResponse.json({ error: 'Missing text, from, or to parameters' }, { status: 400 })
    }

    // Comprehensive EN↔FR dictionary for e-commerce terms
    const dictionary: Record<string, string> = {
      // Product categories
      'jewelry': 'bijoux', 'bijoux': 'jewelry',
      'clothing': 'vêtements', 'vêtements': 'clothing',
      'shoes': 'chaussures', 'chaussures': 'shoes',
      'scarves': 'foulards', 'foulards': 'scarves',
      'scarf': 'foulard', 'foulard': 'scarf',
      'bags': 'sacs', 'sacs': 'bags',
      'bag': 'sac', 'sac': 'bag',
      'accessories': 'accessoires', 'accessoires': 'accessories',
      'watches': 'montres', 'montres': 'watches',
      'watch': 'montre', 'montre': 'watch',
      'hat': 'chapeau', 'chapeau': 'hat',
      'hats': 'chapeaux', 'chapeaux': 'hats',
      'dress': 'robe', 'robe': 'dress',
      'dresses': 'robes', 'robes': 'dresses',
      'skirt': 'jupe', 'jupe': 'skirt',
      'pants': 'pantalon', 'pantalon': 'pants',
      'shirt': 'chemise', 'chemise': 'shirt',
      'blouse': 'blouse', 'top': 'haut', 'haut': 'top',
      'ankara': 'ankara', 'lace': 'dentelle', 'dentelle': 'lace',
      'fabric': 'tissu', 'tissu': 'fabric',
      'earrings': 'boucles d\'oreilles', 'necklace': 'collier', 'collier': 'necklace',
      'bracelet': 'bracelet', 'ring': 'bague', 'bague': 'ring',
      'heels': 'talons', 'talons': 'heels',
      'sandals': 'sandales', 'sandales': 'sandals',
      'sneakers': 'baskets', 'baskets': 'sneakers',
      'slippers': 'pantoufles', 'pantoufles': 'slippers',
      // Common words
      'women': 'femmes', 'femmes': 'women',
      'men': 'hommes', 'hommes': 'men',
      'children': 'enfants', 'enfants': 'children',
      'fashion': 'mode', 'mode': 'fashion',
      'style': 'style', 'beauty': 'beauté', 'beauté': 'beauty',
      'elegant': 'élégant', 'élégant': 'elegant',
      'elegant (f)': 'élégante', 'élégante': 'elegant',
      'luxury': 'luxe', 'luxe': 'luxury',
      'quality': 'qualité', 'qualité': 'quality',
      'affordable': 'abordable', 'abordable': 'affordable',
      'new': 'nouveau', 'nouveau': 'new',
      'new (f)': 'nouvelle', 'nouvelle': 'new',
      'collection': 'collection',
      'boutique': 'boutique',
      'product': 'produit', 'produit': 'product',
      'products': 'produits', 'produits': 'products',
      'price': 'prix', 'prix': 'price',
      'discount': 'réduction', 'réduction': 'discount',
      'sale': 'solde', 'solde': 'sale',
      'free': 'gratuit', 'gratuit': 'free',
      'delivery': 'livraison', 'livraison': 'delivery',
      'shipping': 'expédition', 'expédition': 'shipping',
      'order': 'commande', 'commande': 'order',
      'payment': 'paiement', 'paiement': 'payment',
      'customer': 'client', 'client': 'customer',
      'review': 'avis', 'avis': 'review',
      'featured': 'en vedette', 'en vedette': 'featured',
      'popular': 'populaire', 'populaire': 'popular',
      'bestseller': 'meilleure vente', 'meilleure vente': 'bestseller',
      'handmade': 'fait main', 'fait main': 'handmade',
      'african': 'africain', 'africain': 'african',
      'african (f)': 'africaine', 'africaine': 'african',
      'traditional': 'traditionnel', 'traditionnel': 'traditional',
      'modern': 'moderne', 'moderne': 'modern',
      'classic': 'classique', 'classique': 'classic',
      'trendy': 'tendance', 'tendance': 'trendy',
      'unique': 'unique',
      'premium': 'premium',
      'original': 'original',
      'design': 'design',
      'custom': 'personnalisé', 'personnalisé': 'custom',
      'gift': 'cadeau', 'cadeau': 'gift',
      'special': 'spécial', 'spécial': 'special',
      'exclusive': 'exclusif', 'exclusif': 'exclusive',
      'limited': 'limité', 'limité': 'limited',
      'available': 'disponible', 'disponible': 'available',
      'in stock': 'en stock', 'en stock': 'in stock',
      'out of stock': 'rupture de stock', 'rupture de stock': 'out of stock',
      'size': 'taille', 'taille': 'size',
      'color': 'couleur', 'couleur': 'color',
      'material': 'matériau', 'matériau': 'material',
      'cotton': 'coton', 'coton': 'cotton',
      'silk': 'soie', 'soie': 'silk',
      'leather': 'cuir', 'cuir': 'leather',
      'gold': 'or', 'or': 'gold',
      'silver': 'argent', 'argent': 'silver',
      'diamond': 'diamant', 'diamant': 'diamond',
      'pearl': 'perle', 'perle': 'pearl',
      // Descriptive words
      'beautiful': 'beau', 'beau': 'beautiful',
      'beautiful (f)': 'belle', 'belle': 'beautiful',
      'gorgeous': 'magnifique', 'magnifique': 'gorgeous',
      'stunning': 'éblouissant', 'éblouissant': 'stunning',
      'perfect': 'parfait', 'parfait': 'perfect',
      'comfortable': 'confortable', 'confortable': 'comfortable',
      'durable': 'durable', 'soft': 'doux', 'doux': 'soft',
      'light': 'léger', 'léger': 'light',
      'heavy': 'lourd', 'lourd': 'heavy',
      'small': 'petit', 'petit': 'small',
      'medium': 'moyen', 'moyen': 'medium',
      'large': 'grand', 'grand': 'large',
      'wide': 'large', 'narrow': 'étroit', 'étroit': 'narrow',
      'long': 'long', 'short': 'court', 'court': 'short',
      'thick': 'épais', 'épais': 'thick',
      'thin': 'fin', 'fin': 'thin',
    }

    // Try AI translation first
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const response = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a professional translator for an African fashion e-commerce website called "God's Grace Boutique". Translate the following text from ${from === 'en' ? 'English' : 'French'} to ${to === 'fr' ? 'French' : 'English'}. Only return the translation, nothing else. Keep it natural and appropriate for a fashion/boutique context. If the text is already in the target language, return it as is.`
          },
          { role: 'user', content: text }
        ],
      })
      const translated = response.choices[0]?.message?.content?.trim()
      if (translated && translated !== text) {
        return NextResponse.json({ translated, fallback: false })
      }
    } catch (aiError) {
      console.log('AI translation failed, using dictionary fallback:', aiError)
    }

    // Fallback: dictionary translation
    let translated = text
    const lowerText = text.toLowerCase().trim()

    // Exact match
    if (dictionary[lowerText]) {
      // Preserve original casing
      if (text === text.toUpperCase()) {
        translated = dictionary[lowerText].toUpperCase()
      } else if (text[0] === text[0].toUpperCase()) {
        translated = dictionary[lowerText].charAt(0).toUpperCase() + dictionary[lowerText].slice(1)
      } else {
        translated = dictionary[lowerText]
      }
    } else {
      // Word-by-word translation
      const words = text.split(/\s+/)
      translated = words.map(word => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '')
        const punct = word.match(/[.,!?;:]$/)?.[0] || ''
        const dictWord = dictionary[cleanWord]
        if (dictWord) {
          return word[0] === word[0].toUpperCase()
            ? dictWord.charAt(0).toUpperCase() + dictWord.slice(1) + punct
            : dictWord + punct
        }
        return word
      }).join(' ')
    }

    return NextResponse.json({ translated, fallback: true })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
