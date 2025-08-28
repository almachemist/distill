import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  console.log('Testing signup with:', testEmail)
  
  try {
    // 1. Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          displayName: 'Test User',
        },
      },
    })
    
    if (authError) {
      throw new Error(`Auth error: ${authError.message}`)
    }
    
    console.log('✓ User created:', authData.user.id)
    
    // 2. Sign in to get session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (signInError) {
      throw new Error(`Sign in error: ${signInError.message}`)
    }
    
    console.log('✓ User signed in')
    
    // 3. Call complete_signup RPC
    const { data, error } = await supabase.rpc('complete_signup', {
      user_id: authData.user.id,
      org_name: 'Test Distillery',
      display_name: 'Test User',
    })
    
    if (error) {
      throw new Error(`RPC error: ${error.message}`)
    }
    
    console.log('✓ Organization and profile created:', data)
    
    // 4. Verify profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      throw new Error(`Profile fetch error: ${profileError.message}`)
    }
    
    console.log('✓ Profile verified:', profile)
    
    // 5. Verify organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single()
    
    if (orgError) {
      throw new Error(`Organization fetch error: ${orgError.message}`)
    }
    
    console.log('✓ Organization verified:', org)
    
    console.log('\n✅ All signup tests passed!')
    
    // Cleanup
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testSignup()