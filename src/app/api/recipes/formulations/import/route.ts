import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/serviceRole'

export const runtime = 'nodejs'

type FormulationIngredient = {
  name: string
  quantity: number
  unit: string
  abv_percent?: number | null
  notes?: string | null
}

type FormulationRecipe = {
  recipe_name: string
  recipe_type: string
  status: string
  created_date?: string | null
  target_batch_size_l: number
  final_abv_percent_provided?: number | null
  notes?: string | null
  traceability_notes?: string | null
  ingredients: FormulationIngredient[]
}

function requiredFormulations(): FormulationRecipe[] {
  return [
    {
      recipe_name: 'Coffee Liqueur',
      recipe_type: 'Liqueur',
      status: 'Production-ready',
      created_date: null,
      target_batch_size_l: 76.4,
      final_abv_percent_provided: null,
      traceability_notes: 'Alcohol is pre-distilled vodka; reference SKU-type items, not batch IDs.',
      notes: 'Do not create distillation/fermentation records from this recipe.',
      ingredients: [
        { name: 'Vodka', quantity: 42, unit: 'L', abv_percent: 40, notes: null },
        { name: 'Simple Syrup (1:1)', quantity: 34.36, unit: 'L', notes: null },
        { name: 'Coffee beans', quantity: 4.3, unit: 'kg', notes: null },
        { name: 'Vanilla flavouring', quantity: 108, unit: 'ml', notes: null },
        { name: 'Hazelnut flavouring', quantity: 108, unit: 'ml', notes: null },
      ],
    },
    {
      recipe_name: 'Berry Burst',
      recipe_type: 'Experiment / Flavour trial',
      status: 'Experimental – Not for Sale',
      created_date: 'October 2025',
      target_batch_size_l: 0.2,
      final_abv_percent_provided: null,
      traceability_notes: null,
      notes: 'Drops are micro additions; keep as-entered.',
      ingredients: [
        { name: 'Vodka', quantity: 200, unit: 'ml', abv_percent: 37.5, notes: null },
        { name: 'Blackberry flavour', quantity: 20, unit: 'drops', notes: null },
        { name: 'Raspberry flavour', quantity: 12, unit: 'drops', notes: null },
        { name: 'Glycerine', quantity: 4, unit: 'drops', notes: null },
      ],
    },
    {
      recipe_name: 'Golden Sunrise',
      recipe_type: 'Experiment / Flavour trial',
      status: 'Experimental – Not for Sale',
      created_date: 'October 2025',
      target_batch_size_l: 0.2,
      final_abv_percent_provided: null,
      traceability_notes: null,
      notes: null,
      ingredients: [
        { name: 'Vodka', quantity: 200, unit: 'ml', abv_percent: 37.5, notes: null },
        { name: 'Orange flavour', quantity: 13, unit: 'drops', notes: null },
        { name: 'Peach flavour', quantity: 10, unit: 'drops', notes: null },
        { name: 'Passionfruit flavour', quantity: 14, unit: 'drops', notes: null },
        { name: 'Glycerine', quantity: 4, unit: 'drops', notes: null },
      ],
    },
    {
      recipe_name: 'Banana Rum',
      recipe_type: 'Experiment / Flavour trial',
      status: 'Experimental – Not for Sale',
      created_date: 'October 2025',
      target_batch_size_l: 0.2,
      final_abv_percent_provided: null,
      traceability_notes: 'Base spirit is white rum; no distillation implied.',
      notes: null,
      ingredients: [
        { name: 'DTD White Rum', quantity: 200, unit: 'ml', abv_percent: 40, notes: null },
        { name: 'Banana flavour', quantity: 47, unit: 'drops', notes: null },
        { name: 'Caramel flavour', quantity: 10, unit: 'drops', notes: null },
        { name: 'Caramel colour', quantity: 5, unit: 'drops', notes: null },
      ],
    },
    {
      recipe_name: 'Gingerbeer',
      recipe_type: 'RTD / Cocktail-style blend',
      status: 'Experimental',
      created_date: '06/02/2026',
      target_batch_size_l: 5.0,
      final_abv_percent_provided: 4.5,
      traceability_notes: null,
      notes: 'This is a dilution/blend recipe. No distillation/fermentation record.',
      ingredients: [
        { name: 'Syrup', quantity: 0.83, unit: 'L', notes: null },
        { name: 'Vodka', quantity: 0.6, unit: 'L', abv_percent: 37.5, notes: null },
        { name: 'Water', quantity: 3.57, unit: 'L', notes: null },
      ],
    },
  ]
}

async function resolveOrganizationId(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return '00000000-0000-0000-0000-000000000001'
  }

  const sb = await createClient()
  const { data: userRes, error: userErr } = await sb.auth.getUser()
  if (userErr) throw new Error(userErr.message)
  const user = userRes?.user
  if (!user) throw new Error('User not authenticated')

  const { data: profile, error: profileErr } = await sb
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileErr) throw new Error(profileErr.message)
  if (!profile?.organization_id) throw new Error('User has no organization')
  return profile.organization_id
}

async function ensureItem(
  supabase: any,
  orgId: string,
  name: string,
  opts: { uom: string; isAlcohol: boolean; abvPct: number | null; category: string }
): Promise<string> {
  const { data: existing, error: existingErr } = await supabase
    .from('items')
    .select('id')
    .eq('organization_id', orgId)
    .eq('name', name)
    .limit(1)
    .maybeSingle()

  if (existingErr) throw new Error(`Failed checking item ${name}: ${existingErr.message}`)
  if (existing?.id) return existing.id

  const { data: created, error: insErr } = await supabase
    .from('items')
    .insert([
      {
        organization_id: orgId,
        name,
        default_uom: opts.uom,
        is_alcohol: opts.isAlcohol,
        abv_pct: opts.abvPct,
        category: opts.category,
      },
    ])
    .select('id')
    .single()

  if (insErr) throw new Error(`Failed creating item ${name}: ${insErr.message}`)
  return created.id
}

export async function POST() {
  try {
    const supabase = createServiceRoleClient()
    const orgId = await resolveOrganizationId()

    let created = 0
    let updated = 0

    for (const r of requiredFormulations()) {
      const name = String(r.recipe_name || '').trim()
      if (!name) continue

      const baselineFinalL = typeof r.target_batch_size_l === 'number' ? r.target_batch_size_l : null
      const targetAbv = typeof r.final_abv_percent_provided === 'number' ? r.final_abv_percent_provided / 100 : null

      const description = `${String(r.recipe_type || '').trim()} | ${String(r.status || '').trim()}`.trim() || null
      const notesParts: string[] = []
      if (r.created_date) notesParts.push(`Created: ${String(r.created_date).trim()}`)
      if (r.traceability_notes) notesParts.push(`Traceability: ${String(r.traceability_notes).trim()}`)
      if (r.notes) notesParts.push(String(r.notes).trim())
      const recipeNotes = notesParts.filter(Boolean).join('\n') || null

      const { data: existing, error: existingErr } = await supabase
        .from('recipes')
        .select('id')
        .eq('organization_id', orgId)
        .eq('name', name)
        .limit(1)
        .maybeSingle()

      if (existingErr) throw new Error(`Failed checking recipe ${name}: ${existingErr.message}`)

      let recipeId: string
      if (existing?.id) {
        const { data: upd, error: updErr } = await supabase
          .from('recipes')
          .update({ baseline_final_l: baselineFinalL, target_abv: targetAbv, description, notes: recipeNotes })
          .eq('id', existing.id)
          .select('id')
          .single()

        if (updErr) throw new Error(`Failed updating recipe ${name}: ${updErr.message}`)
        recipeId = upd.id
        updated++
      } else {
        const { data: ins, error: insErr } = await supabase
          .from('recipes')
          .insert([
            {
              organization_id: orgId,
              name,
              baseline_final_l: baselineFinalL,
              target_abv: targetAbv,
              description,
              notes: recipeNotes,
            },
          ])
          .select('id')
          .single()

        if (insErr) throw new Error(`Failed creating recipe ${name}: ${insErr.message}`)
        recipeId = ins.id
        created++
      }

      const { error: delErr } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('organization_id', orgId)
        .eq('recipe_id', recipeId)

      if (delErr) throw new Error(`Failed clearing ingredients for ${name}: ${delErr.message}`)

      for (const ing of r.ingredients || []) {
        const ingName = String(ing?.name || '').trim()
        if (!ingName) continue

        const qty = typeof ing.quantity === 'number' ? ing.quantity : NaN
        if (!Number.isFinite(qty)) continue

        const unit = String(ing.unit || '').trim() || 'unit'
        const isAlcohol = typeof ing.abv_percent === 'number' && Number.isFinite(ing.abv_percent)
        const abvPct = isAlcohol ? (ing.abv_percent as number) : null
        const category = isAlcohol ? 'spirit' : 'other'

        const itemId = await ensureItem(supabase, orgId, ingName, { uom: unit, isAlcohol, abvPct, category })
        const rowNotes = typeof ing.notes === 'string' && ing.notes.trim() ? ing.notes.trim() : null

        const { error: insIngErr } = await supabase
          .from('recipe_ingredients')
          .insert([
            {
              organization_id: orgId,
              recipe_id: recipeId,
              item_id: itemId,
              qty_per_batch: qty,
              uom: unit,
              step: 'blend',
              notes: rowNotes,
            },
          ])

        if (insIngErr) throw new Error(`Failed adding ingredient ${ingName} to ${name}: ${insIngErr.message}`)
      }
    }

    return NextResponse.json({ success: true, created, updated }, { status: 200 })
  } catch (error) {
    console.error('Error importing formulation recipes:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
