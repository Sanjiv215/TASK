const normalizeApiBaseUrl = (value) => {
    if (!value) {
        return ''
    }

    const trimmedValue = value.trim().replace(/\/$/, '')

    if (!trimmedValue) {
        return ''
    }

    if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
        return trimmedValue
    }

    return `https://${trimmedValue}`
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

export const apiUrl = (path) => {
    return `${API_BASE_URL}${path}`
}
