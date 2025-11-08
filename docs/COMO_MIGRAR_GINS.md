# Como Migrar Batches de Gin para o Supabase

## 📋 Resumo

Este guia explica como migrar dados históricos de destilações de gin do Word/JSON para o Supabase.

---

## 🎯 O Que Você Precisa

1. **Seus JSONs** (colados no Word ou em arquivo .json)
2. **Python 3** instalado (para usar o script)
3. **Acesso ao Supabase** (para executar o SQL gerado)

---

## 🚀 Método 1: Usando o Script Python (Recomendado)

### Passo 1: Prepare seu arquivo JSON

Copie todos os JSONs do Word e cole em um arquivo chamado `batches.json`

Pode ser um único JSON:
```json
{
  "batch_id": "SPIRIT-GIN-OAKS-005",
  "product_name": "Wet Season Gin",
  "still": "Carrie",
  "date": "2024-05-13",
  ...
}
```

Ou um array de JSONs:
```json
[
  { "batch_id": "SPIRIT-GIN-OAKS-005", ... },
  { "batch_id": "SPIRIT-GIN-OAKS-006", ... }
]
```

### Passo 2: Execute o script

```bash
python scripts/migrate_gin_batches.py batches.json output.sql
```

### Passo 3: Revise o arquivo gerado

Abra `output.sql` e verifique se os dados estão corretos.

### Passo 4: Execute no Supabase

1. Abra o Supabase SQL Editor
2. Cole o conteúdo de `output.sql`
3. Execute

---

## 🖥️ Método 2: Colando Direto no Terminal

Se preferir colar direto:

```bash
python scripts/migrate_gin_batches.py
```

Depois cole seus JSONs e pressione `Ctrl+D` (Mac/Linux) ou `Ctrl+Z` (Windows)

O script vai gerar `output.sql` automaticamente.

---

## 📝 Método 3: Usando o Cursor (AI Assistant)

Se você usa o Cursor AI:

1. Abra o arquivo `docs/CURSOR_INSTRUCTIONS_GIN_MIGRATION.md`
2. Copie todo o conteúdo
3. Cole no Cursor
4. Cole seus JSONs
5. O Cursor vai processar e gerar o SQL

---

## ✅ Estrutura Esperada dos Dados

Seus JSONs podem estar em qualquer formato, mas devem conter pelo menos:

**Campos Obrigatórios:**
- `batch_id` ou `spiritRunId` ou `id` → ID único do batch
- `product_name` ou `sku` ou `type` → Nome do produto (ex: "Wet Season Gin")
- `still` ou `stillUsed` → Nome do alambique (ex: "Carrie")
- `date` → Data no formato YYYY-MM-DD

**Campos Opcionais mas Recomendados:**
- `botanicals` → Lista de botânicos
- `charge` ou `chargeAdjustment` → Carga do boiler
- `cuts` ou `output` → Cortes da destilação (foreshots, heads, hearts, tails)
- `dilutions` → Diluições
- `notes` → Observações

---

## 🔍 Exemplo de JSON Simples

```json
{
  "batch_id": "SPIRIT-GIN-OAKS-005",
  "product_name": "Wet Season Gin",
  "still": "Carrie",
  "date": "2024-05-13",
  "charge": {
    "volume_l": 1000,
    "abv_percent": 50.3
  },
  "botanicals": [
    {
      "name": "Juniper",
      "weight_g": 6400,
      "notes": "Crushed"
    },
    {
      "name": "Coriander",
      "weight_g": 1800,
      "notes": "Steeped"
    }
  ],
  "cuts": {
    "foreshots": {
      "volume_l": 2,
      "abv_percent": 85
    },
    "heads": {
      "volume_l": 10,
      "abv_percent": 84
    },
    "hearts": {
      "volume_l": 236,
      "abv_percent": 80.9
    },
    "tails": {
      "volume_l": 50,
      "abv_percent": 75
    }
  },
  "notes": "Excellent run, clean hearts"
}
```

O script vai normalizar isso automaticamente para o formato do Supabase!

---

## ⚠️ Coisas Importantes

1. **Sem emojis** - Remova todos os emojis dos JSONs
2. **Data no formato YYYY-MM-DD** - Ex: 2024-05-13
3. **Use ponto decimal** - 80.9 (não 80,9)
4. **IDs únicos** - Cada batch precisa de um ID único
5. **JSON válido** - Use https://jsonlint.com para validar

---

## 🐛 Resolução de Problemas

### Erro: "Invalid JSON"
- Verifique se o JSON está válido em https://jsonlint.com
- Remova vírgulas extras
- Certifique-se de que todas as aspas estão corretas

### Erro: "Missing spiritRunId"
- Adicione um campo `batch_id` ou `id` ao seu JSON

### Erro: "Invalid date format"
- Use o formato YYYY-MM-DD (ex: 2024-05-13)

### Erro: "Missing sku"
- Adicione um campo `product_name` ou `type` ao seu JSON

---

## 📊 Produtos Suportados

Você pode migrar dados de qualquer produto de gin:
- Signature Dry Gin
- Navy Strength Gin
- Wet Season Gin
- Oaks Kitchen Gin
- Rainforest Gin
- Barrel Aged Gin
- Qualquer outro gin customizado

---

## 🎓 Documentação Completa

Para mais detalhes técnicos, veja:
- `docs/gin-batch-migration-guide.md` - Guia completo em inglês
- `docs/CURSOR_INSTRUCTIONS_GIN_MIGRATION.md` - Instruções para o Cursor AI

---

## 💡 Dicas

1. **Comece com um batch** - Teste com um único batch primeiro
2. **Revise o SQL gerado** - Sempre revise antes de executar no Supabase
3. **Faça backup** - Exporte os dados atuais do Supabase antes de inserir novos
4. **Use o script** - É mais rápido e seguro que fazer manualmente

---

## ✅ Checklist Final

Antes de executar no Supabase:
- [ ] Todos os JSONs estão válidos
- [ ] Todos os IDs são únicos
- [ ] Todas as datas estão no formato YYYY-MM-DD
- [ ] Não há emojis ou caracteres especiais
- [ ] Revisei o arquivo SQL gerado
- [ ] Fiz backup dos dados atuais

---

**Pronto para migrar seus gins!** 🍸

Se tiver dúvidas, consulte a documentação completa ou peça ajuda.

