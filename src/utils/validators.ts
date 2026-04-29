export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/
  return phoneRegex.test(phone)
}

export const isPositiveNumber = (value: number): boolean => {
  return value > 0
}

export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}
