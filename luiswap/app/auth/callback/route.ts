import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bundle = searchParams.get('bundle')
    
    console.log('📧 Auth Callback: Received credential bundle callback')
    console.log('📧 Auth Callback: Bundle preview:', bundle?.substring(0, 100) + '...')
    
    if (!bundle) {
      console.error('❌ Auth Callback: No credential bundle provided')
      return NextResponse.json({ error: 'No credential bundle provided' }, { status: 400 })
    }
    
    // Redirect to main app with the credential bundle
    // The frontend will pick this up and complete authentication
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('credential_bundle', bundle)
    
    console.log('✅ Auth Callback: Redirecting with credential bundle')
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('❌ Auth Callback: Error processing callback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}