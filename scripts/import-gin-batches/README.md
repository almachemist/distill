# Gin Batch Importer

This script imports Signature Dry Gin batch data into a Supabase database.

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Supabase project with the required tables (see `schema.sql`)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in this directory with the following content:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   Replace `your_supabase_project_url` and `your_supabase_service_role_key` with your actual Supabase project credentials.

## Running the Import

1. Make sure your batch JSON files are in the `../../data/batches/` directory.
2. Run the import script:
   ```bash
   npm start
   ```

## Database Schema

The script expects the following tables to exist in your Supabase database. You can find the SQL to create these tables in `schema.sql`.

## Notes

- The script will skip batches that have already been imported (based on the `run_id`).
- If you need to re-import a batch, you'll need to delete the existing records from all related tables first.
- The script includes error handling and will continue processing other batches if one fails.
