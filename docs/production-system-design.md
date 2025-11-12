# 🏭 PRODUCTION SYSTEM - MASTER DESIGN

## 📋 Visão Geral

Sistema de produção dinâmico e inteligente que permite criação e edição progressiva de batches, baseado na estrutura real dos dados já existentes no Supabase.

---

## 🎯 Conceito Principal

### Separação de Funções

| Aba | Função | Descrição |
|-----|--------|-----------|
| **Batches** | Histórico | Exibe todas as produções já registradas. Dados completos e imutáveis (visualização e análise). |
| **Production** | Criação e edição dinâmica | Onde uma nova batch é criada e atualizada progressivamente até ser finalizada. |

---

## 🔄 Fluxo de Trabalho

### 1. Criação de Nova Produção

```
Usuário clica "Nova Produção"
    ↓
Sistema pergunta: "O que você vai produzir?"
    ├─ Gin
    ├─ Vodka
    ├─ Rum
    ├─ Cane Spirit
    └─ Liqueur / Other
    ↓
Sistema gera template baseado no tipo selecionado
    ↓
Batch criada com status "draft"
```

### 2. Edição Progressiva

```
Batch em modo "draft"
    ↓
Usuário preenche campos conforme produção avança
    ├─ Fermentação (para rum)
    ├─ Charge/Botanicals (para gin)
    ├─ Distillation
    ├─ Cuts
    └─ Maturation (para rum)
    ↓
Salvamento automático a cada mudança
    ↓
Status atualizado: draft → in_progress → completed
```

### 3. Finalização

```
Usuário clica "Finalizar Lote"
    ↓
Sistema valida campos obrigatórios
    ↓
Se válido:
    ├─ Status → "completed"
    ├─ Batch movida para histórico (Batches)
    └─ Não pode mais ser editada
Se inválido:
    └─ Mostra erros e mantém em "draft"
```

---

## 📊 Estrutura de Dados

### Status de Produção

```typescript
type ProductionStatus = 
  | 'draft'        // Criada mas não iniciada
  | 'in_progress'  // Em andamento
  | 'completed'    // Finalizada
  | 'archived'     // Arquivada
```

### Tipos de Produto

```typescript
type ProductType = 
  | 'gin' 
  | 'vodka' 
  | 'rum' 
  | 'cane_spirit' 
  | 'liqueur'
  | 'other'
```

---

## 🗂️ Schemas Baseados em Dados Reais

### Gin / Vodka / Spirits

**Baseado em:** `production_batches.data` (Supabase)

**Estrutura:**
```typescript
{
  // Basic Info
  spiritRunId: string
  sku: string
  date: string
  stillUsed: string
  
  // Charge
  chargeAdjustment: {
    total: { volume_L, abv_percent, lal }
    components: [{ type, source, volume_L, abv_percent, lal }]
  }
  
  // Botanicals (para gin)
  botanicals: [{ name, weight_g, ratio_percent, notes }]
  
  // Still Setup
  stillSetup: { elements, plates, steeping, options }
  
  // Run Data
  runData: [{ time, phase, volume_L, abv_percent, temps, observations }]
  
  // Output
  output: [{ phase, volume_L, abv_percent, receivingVessel }]
  
  // Dilutions
  dilutions: [{ number, date, newMake_L, water_L, newVolume_L, abv_percent }]
  
  // Final Output
  finalOutput: { totalVolume_L, abv_percent, lal, notes }
}
```

### Rum / Cane Spirit

**Baseado em:** `rum_production_runs` (Supabase)

**Estrutura:**
```typescript
{
  // Basic Info
  batch_id: string
  product_name: string
  still_used: string
  
  // Fermentation
  fermentation_start_date: string
  substrate_type: string
  substrate_mass_kg: number
  water_mass_kg: number
  initial_brix: number
  initial_ph: number
  
  // Dunder
  dunder_added: boolean
  dunder_type: string
  dunder_volume_l: number
  
  // Yeast
  yeast_type: string
  yeast_mass_g: number
  
  // Fermentation Curves
  temperature_curve: { start, 24h, 48h, 72h, 96h, 120h }
  brix_curve: { start, 24h, 48h, 72h, 96h, 120h }
  ph_curve: { start, 24h, 48h, 72h, 96h, 120h }
  
  // Distillation
  distillation_date: string
  boiler_volume_l: number
  boiler_abv_percent: number
  
  // Retorts
  retort1_content: string
  retort1_volume_l: number
  retort1_abv_percent: number
  
  // Cuts
  foreshots_volume_l: number
  heads_volume_l: number
  hearts_volume_l: number
  early_tails_volume_l: number
  late_tails_volume_l: number
  
  // LAL Tracking
  total_lal_start: number
  total_lal_end: number
  lal_loss: number
  heart_yield_percent: number
  
  // Maturation
  cask_number: string
  fill_abv_percent: number
  volume_filled_l: number
}
```

---

## 🎨 UI/UX Design

### Aba "Production"

#### Vista Principal
```
┌─────────────────────────────────────────────┐
│  Production                                  │
│  ┌─────────────────────────────────────┐   │
│  │  [+ Nova Produção]                   │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  Drafts em Andamento:                       │
│  ┌─────────────────────────────────────┐   │
│  │ 🟡 DRAFT-001 - Gin                   │   │
│  │    Criado: 07/11/2024                │   │
│  │    [Continuar] [Deletar]             │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 🟢 RUM-24-10 - Rum (In Progress)     │   │
│  │    Criado: 05/11/2024                │   │
│  │    [Continuar] [Finalizar]           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### Modal "Nova Produção"
```
┌─────────────────────────────────────────────┐
│  O que você vai produzir?                    │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   🍸     │  │   🥃     │  │   🥥     │  │
│  │   Gin    │  │  Vodka   │  │   Rum    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│  ┌──────────┐  ┌──────────┐                 │
│  │   🌾     │  │   🍹     │                 │
│  │  Cane    │  │ Liqueur  │                 │
│  │  Spirit  │  │          │                 │
│  └──────────┘  └──────────┘                 │
│                                              │
│              [Cancelar]                      │
└─────────────────────────────────────────────┘
```

#### Formulário Dinâmico (Exemplo: Gin)
```
┌─────────────────────────────────────────────┐
│  DRAFT-001 - Gin Production                  │
│  Status: 🟡 Draft                            │
│  ┌─────────────────────────────────────┐   │
│  │ Basic Info                           │   │
│  │ Spirit Run ID: [SPIRIT-GIN-______]   │   │
│  │ Product Name:  [________________]    │   │
│  │ Date:          [07/11/2024]          │   │
│  │ Still Used:    [Roberta ▼]           │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Charge                               │   │
│  │ Total Volume:  [____] L              │   │
│  │ Total ABV:     [____] %              │   │
│  │ Total LAL:     [____] (auto)         │   │
│  │                                       │   │
│  │ Components:                           │   │
│  │ + Add Component                       │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Botanicals                           │   │
│  │ + Add Botanical                       │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  [Salvar Rascunho] [Finalizar Lote]         │
└─────────────────────────────────────────────┘
```

---

## 🔧 Implementação Técnica

### Arquivos Criados

1. **`src/types/production-schemas.ts`**
   - Tipos TypeScript baseados em dados reais
   - Type guards para diferenciar gin/vodka de rum

2. **`src/lib/production-templates.ts`**
   - Templates vazios para cada tipo de produto
   - Factory function para criar novos drafts
   - Metadata de campos para formulários dinâmicos

3. **`src/modules/production/services/production-draft.repository.ts`**
   - CRUD operations para drafts
   - Validação antes de finalizar
   - Integração com Supabase

### Próximos Passos

1. **Migração do Supabase**
   - Adicionar coluna `status` em `rum_production_runs`
   - Adicionar índices para queries de draft

2. **Componentes React**
   - `ProductionDashboard.tsx` - Vista principal
   - `NewProductionModal.tsx` - Modal de seleção de tipo
   - `DynamicProductionForm.tsx` - Formulário dinâmico
   - `DraftBatchCard.tsx` - Card de draft

3. **Hooks**
   - `useProductionDrafts()` - Gerenciar drafts
   - `useDynamicForm()` - Formulário dinâmico com validação

---

## ✅ Validação

### Campos Obrigatórios (Gin/Vodka)
- Spirit Run ID
- Product Name (SKU)
- Production Date
- Still Used
- Charge Volume
- Pelo menos 1 output fraction

### Campos Obrigatórios (Rum)
- Batch ID
- Fermentation Start Date
- Distillation Date
- Boiler Volume
- Hearts Volume

---

## 🎯 Benefícios

1. **Flexibilidade**: Preencher dados progressivamente
2. **Segurança**: Validação antes de finalizar
3. **Rastreabilidade**: Histórico completo de edições
4. **Escalabilidade**: Fácil adicionar novos tipos de produto
5. **Coerência**: Baseado em dados reais, não teóricos

---

## 📝 Notas

- Todos os schemas são baseados nos dados REAIS já existentes no Supabase
- O sistema mantém compatibilidade total com os dados históricos
- Formulários são gerados dinamicamente baseados no tipo de produto
- Salvamento automático previne perda de dados

