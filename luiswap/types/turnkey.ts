export type Email = `${string}@${string}.${string}`

export type UserSession = {
  id: string
  name: string
  email: string
  organization: {
    organizationId: string
    organizationName: string
  }
  walletId?: string
  addresses?: string[]
}