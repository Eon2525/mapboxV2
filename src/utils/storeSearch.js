export const normalizeString = (value = '') => {
  return value
    .toString()
    .toLowerCase()
    .trim()
}

const removeDiacritics = (value = '') =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const buildSearchHaystack = (properties = {}) => {
  const { name, butikk, address, shoppingCenter, addressLine, city, zipCode, id } = properties
  const tokens = [
    name,
    butikk,
    shoppingCenter,
    address,
    addressLine,
    city,
    zipCode,
    id
  ]

  if (shoppingCenter) {
    tokens.push(`${shoppingCenter} kjøpesenter`, `${shoppingCenter} storsenter`)
  }

  if (properties?.isShoppingCenter) {
    tokens.push('kjøpesenter', 'kjopesenter', 'storsenter', 'senter', 'shopping center', 'shoppingcenter')
  }

  return tokens
    .filter(Boolean)
    .flatMap((value) => {
      const normalized = normalizeString(value)
      const ascii = removeDiacritics(normalized)
      return ascii && ascii !== normalized ? [normalized, ascii] : [normalized]
    })
    .join(' ')
}

export const searchStores = (stores = [], query = '', limit = 8) => {
  const normalizedQuery = normalizeString(query)
  if (!normalizedQuery || normalizedQuery.length < 2) return []

  const centerMatches = []
  const storeMatches = []

  for (const feature of stores) {
    if (!feature?.properties) continue
    const haystack = buildSearchHaystack(feature.properties)
    if (haystack.includes(normalizedQuery)) {
      const bucket = feature.properties?.isShoppingCenter
        ? centerMatches
        : storeMatches
      bucket.push(feature)
    } else if (normalizedQuery.length >= 2) {
      // try partial match by splitting query words
      const words = normalizedQuery.split(/\s+/).filter(Boolean)
      const allWordsPresent = words.every((word) => haystack.includes(word))
      if (!allWordsPresent) {
        continue
      }
      const bucket = feature.properties?.isShoppingCenter
        ? centerMatches
        : storeMatches
      bucket.push(feature)
    }

    if (centerMatches.length >= limit && storeMatches.length >= limit) {
      break
    }
  }

  return [...centerMatches, ...storeMatches].slice(0, limit)
}

