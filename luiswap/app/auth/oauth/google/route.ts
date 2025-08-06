import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    console.log('🔵 Google OAuth Callback: Received callback')
    console.log('🔵 Google OAuth Callback: Code:', code ? 'Present' : 'Missing')
    console.log('🔵 Google OAuth Callback: State:', state)
    console.log('🔵 Google OAuth Callback: Error:', error)
    
    if (error) {
      console.error('❌ Google OAuth Callback: OAuth error:', error)
      return NextResponse.redirect(new URL('/?oauth_error=' + encodeURIComponent(error), request.url))
    }
    
    if (!code) {
      console.error('❌ Google OAuth Callback: No authorization code')
      return NextResponse.redirect(new URL('/?oauth_error=no_code', request.url))
    }
    
    // Exchange code for tokens
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri = `${request.nextUrl.origin}/auth/oauth/google`
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })
    
    const tokens = await tokenResponse.json()
    console.log('🔵 Google OAuth Callback: Token exchange result:', tokens.id_token ? 'Success' : 'Failed')
    
    if (!tokens.id_token) {
      console.error('❌ Google OAuth Callback: No ID token received')
      return NextResponse.redirect(new URL('/?oauth_error=no_id_token', request.url))
    }
    
    // Redirect back to app with the real ID token
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('google_id_token', tokens.id_token)
    redirectUrl.searchParams.set('oauth_provider', 'google')
    
    console.log('✅ Google OAuth Callback: Redirecting with real ID token')
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('❌ Google OAuth Callback: Error processing callback:', error)
    return NextResponse.redirect(new URL('/?oauth_error=server_error', request.url))
  }
}