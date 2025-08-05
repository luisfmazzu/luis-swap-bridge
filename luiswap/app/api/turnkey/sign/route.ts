import { NextRequest, NextResponse } from 'next/server'
import { TurnkeyClient } from '@turnkey/http'
import { ApiKeyStamper } from '@turnkey/api-key-stamper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, type, timestampMs, parameters } = body

    // Validate required environment variables
    const apiPublicKey = process.env.TURNKEY_API_PUBLIC_KEY
    const apiPrivateKey = process.env.TURNKEY_API_PRIVATE_KEY
    const baseUrl = process.env.TURNKEY_API_BASE_URL || 'https://api.turnkey.com'

    if (!apiPublicKey || !apiPrivateKey) {
      return NextResponse.json(
        { error: 'Turnkey API keys not configured' },
        { status: 500 }
      )
    }

    if (!organizationId || !type || !timestampMs || !parameters) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create API key stamper
    const apiKeyStamper = new ApiKeyStamper({
      apiPublicKey,
      apiPrivateKey,
    })

    // Create Turnkey client
    const client = new TurnkeyClient({ baseUrl }, apiKeyStamper)

    // Execute the request based on type
    let result
    switch (type) {
      case 'ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V4':
        result = await client.createSubOrganization({
          organizationId,
          ...parameters,
        })
        break

      case 'ACTIVITY_TYPE_CREATE_WALLET':
        result = await client.createWallet({
          organizationId,
          ...parameters,
        })
        break

      case 'ACTIVITY_TYPE_CREATE_API_KEYS_V2':
        result = await client.createApiKeys({
          organizationId,
          ...parameters,
        })
        break

      case 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2':
        result = await client.signTransaction({
          organizationId,
          ...parameters,
        })
        break

      case 'ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2':
        result = await client.signRawPayload({
          organizationId,
          ...parameters,
        })
        break

      default:
        return NextResponse.json(
          { error: `Unsupported activity type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Turnkey API error:', error)
    
    let errorMessage = 'Internal server error'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
      
      // Handle specific Turnkey errors
      if (error.message.includes('unauthorized') || error.message.includes('401')) {
        statusCode = 401
        errorMessage = 'Unauthorized: Invalid API keys'
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        statusCode = 404
        errorMessage = 'Organization not found'
      } else if (error.message.includes('forbidden') || error.message.includes('403')) {
        statusCode = 403
        errorMessage = 'Forbidden: Insufficient permissions'
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

// Handle CORS for development
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}