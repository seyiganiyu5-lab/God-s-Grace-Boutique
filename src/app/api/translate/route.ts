import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json()

    if (!text || !from || !to) {
      return NextResponse.json({ error: 'Missing text, from, or to parameters' }, { status: 400 })
    }

    // ─── Method 1: Try AI translation (works in cloud with z-ai-web-dev-sdk) ───
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
      console.log('AI translation not available, trying next method...')
    }

    // ─── Method 2: MyMemory Free Translation API (works anywhere) ───
    try {
      const langPair = `${from}|${to}`
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (res.ok) {
        const data = await res.json()
        const translated = data?.responseData?.translatedText?.trim()
        // MyMemory returns uppercase text when it fails — skip those
        if (translated && translated !== text && translated !== text.toUpperCase() && !translated.startsWith('MYMEMORY WARNING')) {
          return NextResponse.json({ translated, fallback: false })
        }
      }
    } catch (apiError) {
      console.log('MyMemory API failed, trying dictionary fallback...')
    }

    // ─── Method 3: Comprehensive dictionary fallback ───
    const dictionary: Record<string, string> = {
      // Product categories
      'jewelry': 'bijoux', 'bijoux': 'jewelry',
      'jewelries': 'bijoux',
      'clothing': 'vêtements', 'vêtements': 'clothing',
      'clothes': 'vêtements', 'shoes': 'chaussures', 'chaussures': 'shoes',
      'scarves': 'foulards', 'foulards': 'scarves',
      'scarf': 'foulard', 'foulard': 'scarf',
      'bags': 'sacs', 'sacs': 'bags',
      'bag': 'sac', 'sac': 'bag',
      'handbags': 'sacs à main', 'sacs à main': 'handbags',
      'handbag': 'sac à main', 'sac à main': 'handbag',
      'accessories': 'accessoires', 'accessoires': 'accessories',
      'watches': 'montres', 'montres': 'watches',
      'watch': 'montre', 'montre': 'watch',
      'wristwatch': 'montre-bracelet', 'montre-bracelet': 'wristwatch',
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
      'earrings': "boucles d'oreilles", "boucles d'oreilles": 'earrings',
      'necklace': 'collier', 'collier': 'necklace',
      'bracelet': 'bracelet', 'ring': 'bague', 'bague': 'ring',
      'heels': 'talons', 'talons': 'heels',
      'sandals': 'sandales', 'sandales': 'sandals',
      'sneakers': 'baskets', 'baskets': 'sneakers',
      'slippers': 'pantoufles', 'pantoufles': 'slippers',
      'flats': 'ballerines', 'ballerines': 'flats',
      'pagne': 'pagne', 'wrapper': 'pagne',
      'kente': 'kente',
      // Common words
      'women': 'femmes', 'femmes': 'women',
      'women\'s': 'femmes', 'men': 'hommes', 'hommes': 'men',
      'men\'s': 'hommes',
      'children': 'enfants', 'enfants': 'children',
      'girls': 'filles', 'filles': 'girls',
      'girl': 'fille', 'fille': 'girl',
      'boy': 'garçon', 'garçon': 'boy',
      'fashion': 'mode', 'mode': 'fashion',
      'style': 'style', 'beauty': 'beauté', 'beauté': 'beauty',
      'elegant': 'élégant', 'élégant': 'elegant',
      'luxury': 'luxe', 'luxe': 'luxury',
      'quality': 'qualité', 'qualité': 'quality',
      'high': 'haut', 'haut': 'high',
      'affordable': 'abordable', 'abordable': 'affordable',
      'new': 'nouveau', 'nouveau': 'new',
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
      // Action / connector words
      'with': 'avec', 'avec': 'with',
      'for': 'pour', 'pour': 'for',
      'and': 'et', 'et': 'and',
      'or': 'ou', 'ou': 'or',
      'the': 'le', 'le': 'the',
      'a': 'un', 'un': 'a',
      'an': 'un',
      'is': 'est', 'est': 'is',
      'are': 'sont', 'sont': 'are',
      'in': 'en', 'en': 'in',
      'on': 'sur', 'sur': 'on',
      'of': 'de', 'de': 'of',
      'this': 'ce', 'ce': 'this',
      'that': 'que', 'que': 'that',
      'it': 'il', 'il': 'it',
      'from': 'de', 'to': 'à', 'à': 'to',
      'at': 'à',
      'by': 'par', 'par': 'by',
      'very': 'très', 'très': 'very',
      'more': 'plus', 'plus': 'more',
      'most': 'plus', 'moins': 'less',
      'less': 'moins',
      'all': 'tout', 'tout': 'all',
      'every': 'chaque', 'chaque': 'every',
      'many': 'beaucoup', 'beaucoup': 'many',
      'some': 'quelques', 'quelques': 'some',
      'any': 'tout',
      'no': 'non', 'non': 'no',
      'not': 'pas', 'pas': 'not',
      'but': 'mais', 'mais': 'but',
      'also': 'aussi', 'aussi': 'also',
      'only': 'seulement', 'seulement': 'only',
      'just': 'juste', 'juste': 'just',
      'like': 'comme', 'comme': 'like',
      'than': 'que',
      'can': 'peut', 'peut': 'can',
      'will': 'va', 'va': 'will',
      'has': 'a',
      'have': 'ont', 'ont': 'have',
      'was': 'était', 'était': 'was',
      'were': 'étaient', 'étaient': 'were',
      'been': 'été', 'été': 'been',
      'being': 'étant', 'étant': 'being',
      // Product description words
      'made': 'fait', 'fait': 'made',
      'set': 'ensemble', 'ensemble': 'set',
      'piece': 'pièce', 'pièce': 'piece',
      'pieces': 'pièces', 'pièces': 'pieces',
      'complete': 'complet', 'complet': 'complete',
      'chain': 'chaîne', 'chaîne': 'chain',
      'chains': 'chaînes',
      'strap': 'bracelet', 'sangle': 'strap',
      'ankle': 'cheville', 'cheville': 'ankle',
      'high': 'haut',
      'low': 'bas', 'bas': 'low',
      'heel': 'talon', 'talon': 'heel',
      'sole': 'semelle', 'semelle': 'sole',
      'upper': 'supérieur',
      'inner': 'intérieur',
      'outer': 'extérieur',
      'front': 'avant', 'avant': 'front',
      'back': 'arrière', 'arrière': 'back',
      'side': 'côté', 'côté': 'side',
      'top': 'haut',
      'bottom': 'bas',
      'middle': 'milieu', 'milieu': 'middle',
      'center': 'centre', 'centre': 'center',
      'left': 'gauche', 'gauche': 'left',
      'right': 'droite', 'droite': 'right',
      // Occasions / use
      'party': 'fête', 'fête': 'party',
      'wedding': 'mariage', 'mariage': 'wedding',
      'ceremony': 'cérémonie', 'cérémonie': 'ceremony',
      'occasion': 'occasion',
      'event': 'événement', 'événement': 'event',
      'everyday': 'quotidien', 'quotidien': 'everyday',
      'casual': 'décontracté', 'décontracté': 'casual',
      'formal': 'formel', 'formel': 'formal',
      'professional': 'professionnel', 'professionnel': 'professional',
      'outdoor': 'extérieur',
      'indoor': 'intérieur',
      'summer': 'été', 'été': 'summer',
      'winter': 'hiver', 'hiver': 'winter',
      'spring': 'printemps', 'printemps': 'spring',
      'fall': 'automne', 'automne': 'fall',
      'autumn': 'automne',
      // More adjectives
      'amazing': 'incroyable', 'incroyable': 'amazing',
      'wonderful': 'merveilleux', 'merveilleux': 'wonderful',
      'excellent': 'excellent',
      'superb': 'superbe', 'superbe': 'superb',
      'fantastic': 'fantastique', 'fantastique': 'fantastic',
      'great': 'génial', 'génial': 'great',
      'nice': 'joli', 'joli': 'nice',
      'pretty': 'joli',
      'cute': 'mignon', 'mignon': 'cute',
      'lovely': 'adorable', 'adorable': 'lovely',
      'sexy': 'sexy',
      'chic': 'chic',
      'sophisticated': 'sophistiqué', 'sophistiqué': 'sophisticated',
      'refined': 'raffiné', 'raffiné': 'refined',
      'bold': 'audacieux', 'audacieux': 'bold',
      'simple': 'simple',
      'rich': 'riche', 'riche': 'rich',
      'royal': 'royal',
      'classic': 'classique',
      'vintage': 'vintage',
      'retro': 'rétro',
      'contemporary': 'contemporain', 'contemporain': 'contemporary',
      'latest': 'dernier', 'dernier': 'latest',
      'brand': 'marque', 'marque': 'brand',
      'new': 'nouveau', 'nouvelle': 'new',
      'old': 'vieux', 'vieux': 'old',
      'young': 'jeune', 'jeune': 'young',
      'fresh': 'frais', 'frais': 'fresh',
      'clean': 'propre', 'propre': 'clean',
      'pure': 'pur', 'pur': 'pure',
      'real': 'réel', 'réel': 'real',
      'genuine': 'authentique', 'authentique': 'genuine',
      'authentic': 'authentique',
      'fine': 'fin', 'fin': 'fine',
      'best': 'meilleur', 'meilleur': 'best',
      'better': 'mieux', 'mieux': 'better',
      'good': 'bon', 'bon': 'good',
      'bad': 'mauvais', 'mauvais': 'bad',
      'big': 'grand', 'grand': 'big',
      'small': 'petit',
      'tiny': 'minuscule', 'minuscule': 'tiny',
      'huge': 'énorme', 'énorme': 'huge',
      'warm': 'chaud', 'chaud': 'warm',
      'cool': 'frais',
      'cold': 'froid', 'froid': 'cold',
      'hot': 'chaud',
      'bright': 'brillant', 'brillant': 'bright',
      'dark': 'sombre', 'sombre': 'dark',
      'light': 'lumière',
      'shiny': 'brillant',
      'sparkling': 'étincelant', 'étincelant': 'sparkling',
      'glittering': 'scintillant',
      'transparent': 'transparent',
      'opaque': 'opaque',
      'solid': 'solide', 'solide': 'solid',
      'strong': 'fort', 'fort': 'strong',
      'weak': 'faible', 'faible': 'weak',
      'lightweight': 'léger', 'léger': 'lightweight',
      'heavy': 'lourd',
      'smooth': 'lisse', 'lisse': 'smooth',
      'rough': 'rugueux',
      'soft': 'doux',
      'hard': 'dur', 'dur': 'hard',
      'flexible': 'flexible',
      'rigid': 'rigide',
      'stretchy': 'extensible',
      'waterproof': 'imperméable', 'imperméable': 'waterproof',
      'washable': 'lavable',
      'reusable': 'réutilisable',
      'disposable': 'jetable',
      'portable': 'portable',
      'adjustable': 'ajustable',
      'removable': 'amovible',
      'detachable': 'détachable',
      'foldable': 'pliable',
      'portable': 'portable',
      // Verbs commonly in descriptions
      'make': 'faire',
      'wear': 'porter', 'porter': 'wear',
      'look': 'regarder', 'regarder': 'look',
      'feel': 'sentir', 'sentir': 'feel',
      'fit': 'aller', 'aller': 'fit',
      'match': 'assortir', 'assortir': 'match',
      'suit': 'convenir', 'convenir': 'suit',
      'add': 'ajouter', 'ajouter': 'add',
      'enhance': 'améliorer', 'améliorer': 'enhance',
      'elevate': 'rehausser', 'rehausser': 'elevate',
      'complete': 'compléter', 'compléter': 'complete',
      'accentuate': 'accentuer',
      'highlight': 'mettre en valeur',
      'feature': 'caractéristique', 'caractéristique': 'feature',
      'include': 'inclure', 'inclure': 'include',
      'come': 'venir', 'venir': 'come',
      'go': 'aller',
      'stay': 'rester', 'rester': 'stay',
      'keep': 'garder', 'garder': 'keep',
      'protect': 'protéger', 'protéger': 'protect',
      'provide': 'fournir', 'fournir': 'provide',
      'offer': 'offrir', 'offrir': 'offer',
      'give': 'donner', 'donner': 'give',
      'show': 'montrer', 'montrer': 'show',
      'create': 'créer', 'créer': 'create',
      'design': 'conception',
      'craft': 'artisanat', 'artisanat': 'craft',
      'perfect': 'parfait',
      'ideal': 'idéal', 'idéal': 'ideal',
      'suitable': 'approprié', 'approprié': 'suitable',
      'appropriate': 'approprié',
      'great': 'superbe',
      'must-have': 'indispensable', 'indispensable': 'must-have',
      'essential': 'essentiel', 'essentiel': 'essential',
      'necessary': 'nécessaire', 'nécessaire': 'necessary',
      'important': 'important',
      'versatile': 'polyvalent', 'polyvalent': 'versatile',
      // Common phrases
      'perfect for': 'parfait pour',
      'made with': 'fait avec',
      'made of': 'fait de',
      'made in': 'fait en',
      'designed for': 'conçu pour',
      'suitable for': 'approprié pour',
      'ideal for': 'idéal pour',
      'great for': 'génial pour',
      'available in': 'disponible en',
      'comes with': 'livré avec',
      'includes': 'inclut',
      'features': 'caractéristiques',
      'high quality': 'haute qualité', 'haute qualité': 'high quality',
      'best seller': 'meilleure vente',
      'in stock': 'en stock', 'en stock': 'in stock',
      'out of stock': 'rupture de stock', 'rupture de stock': 'out of stock',
      'on sale': 'en promotion', 'en promotion': 'on sale',
      'special offer': 'offre spéciale', 'offre spéciale': 'special offer',
      'limited edition': 'édition limitée', 'édition limitée': 'limited edition',
      'new arrival': 'nouvelle arrivage', 'nouvelle arrivage': 'new arrival',
      'coming soon': 'bientôt disponible',
      'sold out': 'épuisé', 'épuisé': 'sold out',
    }

    // Fallback: dictionary translation (word-by-word + phrase matching)
    let translated = text
    const lowerText = text.toLowerCase().trim()

    // Exact match first
    if (dictionary[lowerText]) {
      if (text === text.toUpperCase()) {
        translated = dictionary[lowerText].toUpperCase()
      } else if (text[0] === text[0].toUpperCase()) {
        translated = dictionary[lowerText].charAt(0).toUpperCase() + dictionary[lowerText].slice(1)
      } else {
        translated = dictionary[lowerText]
      }
    } else {
      // Try common phrases first (longer matches take priority)
      const phrases = Object.keys(dictionary).filter(k => k.includes(' '))
      phrases.sort((a, b) => b.length - a.length) // longest first
      let remaining = text
      for (const phrase of phrases) {
        const phraseRegex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        remaining = remaining.replace(phraseRegex, dictionary[phrase.toLowerCase()] ?? phrase)
      }

      // Then word-by-word for remaining untranslated words
      const words = remaining.split(/(\s+)/)
      translated = words.map(word => {
        // Skip whitespace
        if (/^\s+$/.test(word)) return word
        // Skip punctuation-only
        if (/^[.,!?;:'"()\-]+$/.test(word)) return word

        const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()\-]+/g, '')
        const punct = word.match(/[.,!?;:'"()\-]+$/)?.[0] || ''
        const dictWord = dictionary[cleanWord]
        if (dictWord) {
          return word[0] === word[0].toUpperCase()
            ? dictWord.charAt(0).toUpperCase() + dictWord.slice(1) + punct
            : dictWord + punct
        }
        return word
      }).join('')
    }

    return NextResponse.json({ translated, fallback: true })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
