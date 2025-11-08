#!/usr/bin/env python3
"""
Gin Batch Migration Script

This script converts JSON batch data into SQL INSERT statements
for the Supabase production_batches table.

Usage:
    python migrate_gin_batches.py input.json output.sql
    
Or paste JSON directly when prompted.
"""

import json
import sys
import re
from datetime import datetime
from typing import List, Dict, Any
import uuid


def generate_uuid() -> str:
    """Generate a new UUID v4."""
    return str(uuid.uuid4())


def validate_date(date_str: str) -> bool:
    """Validate date is in YYYY-MM-DD format."""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def clean_json_string(json_str: str) -> str:
    """Remove emojis and special characters from JSON string."""
    # Remove emojis
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        u"\U00002702-\U000027B0"
        u"\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', json_str)


def add_uuids_to_array(items: List[Dict]) -> List[Dict]:
    """Add UUID to each item in array if not present."""
    for item in items:
        if 'id' not in item or not item['id']:
            item['id'] = generate_uuid()
    return items


def normalize_batch_data(batch: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize batch data to match the standard structure.
    Ensures all required fields are present and properly formatted.
    """
    normalized = {}
    
    # Required fields
    normalized['spiritRunId'] = batch.get('spiritRunId') or batch.get('batch_id') or batch.get('id')
    normalized['sku'] = batch.get('sku') or batch.get('product_name') or batch.get('type')
    normalized['date'] = batch.get('date') or batch.get('distillation_date')
    normalized['stillUsed'] = batch.get('stillUsed') or batch.get('still') or batch.get('still_used')
    
    # Optional fields
    normalized['description'] = batch.get('description', '')
    normalized['notes'] = batch.get('notes', '')
    normalized['boilerOn'] = batch.get('boilerOn') or batch.get('boiler_on')
    
    # Charge adjustment
    if 'chargeAdjustment' in batch:
        normalized['chargeAdjustment'] = batch['chargeAdjustment']
        if 'components' in normalized['chargeAdjustment']:
            normalized['chargeAdjustment']['components'] = add_uuids_to_array(
                normalized['chargeAdjustment']['components']
            )
    elif 'charge' in batch or 'boiler_charge' in batch:
        charge = batch.get('charge') or batch.get('boiler_charge')
        normalized['chargeAdjustment'] = {
            'total': {
                'volume_L': charge.get('volume_l') or charge.get('volume_L'),
                'abv_percent': charge.get('abv_percent'),
                'lal': charge.get('lal')
            },
            'components': []
        }
    
    # Botanicals
    if 'botanicals' in batch:
        normalized['botanicals'] = add_uuids_to_array(batch['botanicals'])
        normalized['totalBotanicals_g'] = sum(b.get('weight_g', 0) for b in normalized['botanicals'])
        normalized['totalBotanicals_percent'] = 100
        if normalized.get('chargeAdjustment', {}).get('total', {}).get('lal'):
            total_lal = normalized['chargeAdjustment']['total']['lal']
            if total_lal > 0:
                normalized['botanicalsPerLAL'] = round(normalized['totalBotanicals_g'] / total_lal, 1)
    
    # Still setup
    if 'stillSetup' in batch:
        normalized['stillSetup'] = batch['stillSetup']
    elif 'still_setup' in batch:
        normalized['stillSetup'] = batch['still_setup']
    
    # Run data
    if 'runData' in batch:
        normalized['runData'] = add_uuids_to_array(batch['runData'])
    elif 'distillation_log' in batch or 'cuts' in batch:
        normalized['runData'] = []
    
    # Output
    if 'output' in batch:
        normalized['output'] = add_uuids_to_array(batch['output'])
    elif 'cuts' in batch:
        cuts = batch['cuts']
        normalized['output'] = []
        for phase in ['foreshots', 'heads', 'hearts', 'early_tails', 'late_tails', 'tails']:
            if phase in cuts and cuts[phase]:
                cut_data = cuts[phase]
                normalized['output'].append({
                    'id': generate_uuid(),
                    'phase': phase.replace('_', ' ').title(),
                    'volume_L': cut_data.get('volume_l') or cut_data.get('volume_L'),
                    'abv_percent': cut_data.get('abv_percent'),
                    'lal': cut_data.get('lal'),
                    'volume_percent': cut_data.get('volume_percent'),
                    'output': cut_data.get('output', ''),
                    'receivingVessel': cut_data.get('receiving_vessel') or cut_data.get('receivingVessel', '')
                })
    
    # Total run
    if 'totalRun' in batch:
        normalized['totalRun'] = batch['totalRun']
    elif 'total' in batch:
        normalized['totalRun'] = batch['total']
    
    # Dilutions
    if 'dilutions' in batch:
        normalized['dilutions'] = add_uuids_to_array(batch['dilutions'])
    
    # Final output
    if 'finalOutput' in batch:
        normalized['finalOutput'] = batch['finalOutput']
    elif 'final_output' in batch:
        normalized['finalOutput'] = batch['final_output']
    
    return normalized


def validate_batch(batch: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Validate a batch has all required fields.
    Returns (is_valid, list_of_errors)
    """
    errors = []
    
    # Check required fields
    if not batch.get('spiritRunId'):
        errors.append("Missing spiritRunId")
    
    if not batch.get('sku'):
        errors.append("Missing sku (product name)")
    
    if not batch.get('stillUsed'):
        errors.append("Missing stillUsed (still name)")
    
    if not batch.get('date'):
        errors.append("Missing date")
    elif not validate_date(batch['date']):
        errors.append(f"Invalid date format: {batch['date']} (must be YYYY-MM-DD)")
    
    return (len(errors) == 0, errors)


def generate_sql_insert(batch: Dict[str, Any]) -> str:
    """Generate SQL INSERT statement for a batch."""
    batch_id = batch['spiritRunId']
    product_type = batch['sku']
    still = batch['stillUsed']
    
    # Convert batch to JSON string
    json_data = json.dumps(batch, ensure_ascii=False, separators=(',', ':'))
    
    # Escape single quotes for SQL
    json_data_escaped = json_data.replace("'", "''")
    
    sql = f"""INSERT INTO production_batches (id, data, type, still)
VALUES (
  '{batch_id}',
  '{json_data_escaped}',
  '{product_type}',
  '{still}'
);"""
    
    return sql


def process_batches(input_data: str) -> tuple[List[str], List[str]]:
    """
    Process input data (JSON string or array of JSONs).
    Returns (list_of_sql_statements, list_of_errors)
    """
    sql_statements = []
    errors = []
    
    # Clean input
    input_data = clean_json_string(input_data)
    
    try:
        # Try to parse as JSON
        data = json.loads(input_data)
        
        # Handle single object or array
        batches = data if isinstance(data, list) else [data]
        
        for i, batch in enumerate(batches):
            try:
                # Normalize the batch
                normalized = normalize_batch_data(batch)
                
                # Validate
                is_valid, validation_errors = validate_batch(normalized)
                
                if not is_valid:
                    errors.append(f"Batch {i+1}: " + ", ".join(validation_errors))
                    continue
                
                # Generate SQL
                sql = generate_sql_insert(normalized)
                sql_statements.append(sql)
                
            except Exception as e:
                errors.append(f"Batch {i+1}: {str(e)}")
        
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON: {str(e)}")
    
    return (sql_statements, errors)


def main():
    """Main entry point."""
    print("=== Gin Batch Migration Tool ===\n")
    
    if len(sys.argv) > 1:
        # Read from file
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else 'output.sql'
        
        print(f"Reading from: {input_file}")
        with open(input_file, 'r', encoding='utf-8') as f:
            input_data = f.read()
    else:
        # Read from stdin
        print("Paste your JSON data (press Ctrl+D when done):\n")
        input_data = sys.stdin.read()
        output_file = 'output.sql'
    
    # Process
    sql_statements, errors = process_batches(input_data)
    
    # Report errors
    if errors:
        print("\n❌ ERRORS FOUND:")
        for error in errors:
            print(f"  - {error}")
        print()
    
    # Report success
    if sql_statements:
        print(f"\n✅ Successfully processed {len(sql_statements)} batch(es)")
        
        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("-- Gin Batch Migration SQL\n")
            f.write(f"-- Generated: {datetime.now().isoformat()}\n")
            f.write(f"-- Total batches: {len(sql_statements)}\n\n")
            f.write("\n\n".join(sql_statements))
        
        print(f"📄 SQL written to: {output_file}")
        print(f"\nYou can now upload {output_file} to Supabase SQL Editor")
    else:
        print("\n❌ No valid batches to process")
        sys.exit(1)


if __name__ == '__main__':
    main()

