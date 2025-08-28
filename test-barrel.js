import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBarrelCreation() {
  const testEmail = `barrel${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  console.log('Creating test user:', testEmail)
  
  try {
    // 1. Sign up new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (authError) throw new Error(`Auth error: ${authError.message}`)
    console.log('✓ User created')
    
    // 2. Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    
    if (signInError) throw new Error(`Sign in error: ${signInError.message}`)
    console.log('✓ User signed in')
    
    // 3. Complete signup
    const { data: setupData, error: setupError } = await supabase.rpc('complete_signup', {
      user_id: authData.user.id,
      org_name: 'Test Barrel Distillery',
      display_name: 'Barrel Tester',
    })
    
    if (setupError) throw new Error(`Setup error: ${setupError.message}`)
    console.log('✓ Organization created:', setupData.organization_id)
    
    // 4. Create a barrel
    const barrelData = {
      barrel_id: `B-${Date.now()}`,
      organization_id: setupData.organization_id,
      spirit: 'Whiskey',
      prev_spirit: 'Bourbon',
      barrel: 'Ex-Bourbon',
      volume: '190',
      date_filled: new Date().toISOString().split('T')[0],
      location: 'Warehouse A, Rack 1',
      abv: '62.5',
      notes_comments: 'Test barrel creation',
      status: 'Aging',
      created_by: authData.user.id,
    }
    
    console.log('\nCreating barrel with data:', barrelData)
    
    const { data: barrel, error: barrelError } = await supabase
      .from('tracking')
      .insert(barrelData)
      .select()
      .single()
    
    if (barrelError) throw new Error(`Barrel creation error: ${barrelError.message}`)
    console.log('✓ Barrel created:', barrel)
    
    // 5. Verify we can read the barrel back
    const { data: readBarrel, error: readError } = await supabase
      .from('tracking')
      .select('*')
      .eq('barrel_id', barrel.barrel_id)
      .single()
    
    if (readError) throw new Error(`Barrel read error: ${readError.message}`)
    console.log('✓ Barrel verified:', readBarrel.barrel_id)
    
    // 6. Update the barrel
    const { data: updatedBarrel, error: updateError } = await supabase
      .from('tracking')
      .update({ abv: '61.2', notes_comments: 'Updated ABV after testing' })
      .eq('barrel_id', barrel.barrel_id)
      .select()
      .single()
    
    if (updateError) throw new Error(`Barrel update error: ${updateError.message}`)
    console.log('✓ Barrel updated:', { abv: updatedBarrel.abv, notes: updatedBarrel.notes_comments })
    
    console.log('\n✅ All barrel tests passed!')
    
    // Cleanup
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testBarrelCreation()