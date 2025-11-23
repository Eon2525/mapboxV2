export const normalizeString = (value = '') => {
  return value
    .toString()
    .toLowerCase()
    .trim()
}

export const buildSearchHaystack = (properties = {}) => {
  const { name, butikk, address, shoppingCenter, addressLine, city, zipCode, id } = properties
  return [
    name,
    butikk,
    shoppingCenter,
    address,
    addressLine,
    city,
    zipCode,
    id
  ]
    .filter(Boolean)
    .map(normalizeString)
    .join(' ')
}

export const searchStores = (stores = [], query = '', limit = 8) => {
  const normalizedQuery = normalizeString(query)
  if (!normalizedQuery || normalizedQuery.length < 2) return []

  const results = []

  for (const feature of stores) {
    if (!feature?.properties) continue
    const haystack = buildSearchHaystack(feature.properties)
    if (haystack.includes(normalizedQuery)) {
      results.push(feature)
    } else if (normalizedQuery.length >= 2) {
      // try partial match by splitting query words
      const words = normalizedQuery.split(/\s+/).filter(Boolean)
      const allWordsPresent = words.every((word) => haystack.includes(word))
      if (!allWordsPresent) {
        continue
      }
      results.push(feature)
    }

    if (results.length >= limit) {
      break
    }
  }

  return results
}

