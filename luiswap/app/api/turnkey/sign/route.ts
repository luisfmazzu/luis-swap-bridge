import { ApiKeyStamper } from '@turnkey/api-key-stamper'
import { TurnkeyApi } from '@turnkey/http'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const apiPublicKey = process.env.TURNKEY_API_PUBLIC_KEY!
const apiPrivateKey = process.env.TURNKEY_API_PRIVATE_KEY!
const baseUrl = process.env.TURNKEY_API_BASE_URL || 'https://api.turnkey.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, type, parameters } = body

    console.log('🔧 Turnkey sign request:', { organizationId, type })

    // Initialize Turnkey client on each request to avoid module loading issues
    const stamper = new ApiKeyStamper({
      apiPublicKey,
      apiPrivateKey,
    })

    const turnkeyClient = new TurnkeyApi({
      apiBaseUrl: baseUrl,
      stamper,
      defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
    })

    // Handle different Turnkey operation types
    switch (type) {
      case 'createSubOrganization':
        const createResult = await turnkeyClient.createSubOrganization({
          organizationId,
          parameters,
        })
        return NextResponse.json(createResult)

      case 'getSubOrganization':
        const getResult = await turnkeyClient.getSubOrganization({
          organizationId,
          parameters,
        })
        return NextResponse.json(getResult)

      case 'createWallet':
        const walletResult = await turnkeyClient.createWallet({
          organizationId,
          parameters,
        })
        return NextResponse.json(walletResult)

      case 'getWallet':
        const getWalletResult = await turnkeyClient.getWallet({
          organizationId,
          parameters,
        })
        return NextResponse.json(getWalletResult)

      case 'listWallets':
        const listResult = await turnkeyClient.getWallets({
          organizationId,
        })
        return NextResponse.json(listResult)

      default:
        return NextResponse.json(
          { error: `Unknown operation type: ${type}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Turnkey API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}