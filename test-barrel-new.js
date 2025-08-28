import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testNewBarrelSchema() {
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
    
    // 4. Create a barrel with human-readable number
    const barrelNumber = `TEST-${Date.now().toString().slice(-6)}`
    const barrelData = {
      barrel_number: barrelNumber, // Human-readable number
      organization_id: setupData.organization_id,
      spirit: 'Bourbon',
      prev_spirit: 'None',
      barrel: 'Virgin Oak',
      volume: '190',
      date_filled: new Date().toISOString().split('T')[0],
      location: 'Warehouse A, Rack 1',
      abv: '62.5',
      notes_comments: 'Testing new ID structure',
      status: 'Aging',
      created_by: authData.user.id,
    }
    
    console.log('\nCreating barrel with number:', barrelNumber)
    
    const { data: barrel, error: barrelError } = await supabase
      .from('tracking')
      .insert(barrelData)
      .select()
      .single()
    
    if (barrelError) throw new Error(`Barrel creation error: ${barrelError.message}`)
    console.log('✓ Barrel created with:')
    console.log('  - UUID ID:', barrel.id)
    console.log('  - Barrel Number:', barrel.barrel_number)
    
    // 5. Verify we can read by UUID
    const { data: readByUuid, error: uuidError } = await supabase
      .from('tracking')
      .select('*')
      .eq('id', barrel.id)
      .single()
    
    if (uuidError) throw new Error(`UUID read error: ${uuidError.message}`)
    console.log('✓ Barrel retrieved by UUID')
    
    // 6. Verify we can search by barrel_number
    const { data: readByNumber, error: numberError } = await supabase
      .from('tracking')
      .select('*')
      .eq('barrel_number', barrelNumber)
      .eq('organization_id', setupData.organization_id)
      .single()
    
    if (numberError) throw new Error(`Number read error: ${numberError.message}`)
    console.log('✓ Barrel retrieved by barrel number')
    
    // 7. Update the barrel using UUID
    const { data: updatedBarrel, error: updateError } = await supabase
      .from('tracking')
      .update({ abv: '61.8', notes_comments: 'Updated via UUID' })
      .eq('id', barrel.id)
      .select()
      .single()
    
    if (updateError) throw new Error(`Update error: ${updateError.message}`)
    console.log('✓ Barrel updated using UUID')
    
    console.log('\n✅ All tests passed!')
    console.log('The barrel detail page should now work with UUID:', barrel.id)
    
    // Cleanup
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  }
}

testNewBarrelSchema()