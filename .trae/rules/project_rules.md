# Project Rules

## Batch Cards Content Preservation
- Never delete any content from batch cards data files.
- Applies to:
  - `src/modules/production/data/rainforest.json`
  - `src/modules/production/data/dryseason.json`
  - `src/modules/production/data/wetseason.json`
  - `src/modules/production/data/Navy.json`
  - `src/modules/production/data/signature-gin-batches.json`
- Allowed changes:
  - Add new batch objects
  - Append fields to existing objects
  - Non-destructive corrections via additional fields
- Prohibited changes:
  - Removing fields or objects
  - Rewriting or replacing existing lines

