# Production Tracking Features

## Overview
The production tracking system manages and monitors distillation and fermentation processes, providing detailed batch tracking and quality control data.

## Distillation Tracking

### Purpose
Track distillation runs with detailed substrate composition and process parameters.

### Core Fields

**Basic Information:**
- Date Filled (auto-populated with current date)
- Batch Number (unique identifier)

**Substrate Tracking (Up to 4 Substrates):**
For each substrate:
- Substrate Name
- Substrate Batch Number
- Volume

**Process Inputs:**
- Water Volume
- Dunder Batch Number
- Dunder Volume
- Temperature Set Point
- Yeast Type
- Yeast Rehydration Temperature

**Additives:**
- Chemicals Added
- Yeast Added Amount

**Documentation:**
- Notes (multiline text field)

### UI/UX Requirements
- Tabbed interface for multiple substrates
- Dynamic substrate addition (show/hide based on needs)
- Auto-calculation of total volume
- Batch number generation/validation
- Save as template for recurring recipes

## Fermentation Tracking

### Purpose
Comprehensive fermentation monitoring with time-series data collection for quality control.

### Core Fields

**Basic Information:**
- Date Filled
- Batch Number (unique identifier)

**Substrate Tracking (Up to 4 Substrates):**
For each substrate:
- Substrate Name
- Substrate Batch Number
- Volume

**Process Inputs:**
- Water Volume
- Dunder Batch Number
- Dunder Volume
- Dunder pH
- Temperature Set Point

**Yeast Management:**
- Yeast Type
- Yeast Added Amount
- Yeast Rehydration Temperature
- Yeast Rehydration Time

**Additives:**
- Chemicals Added
- Nutrients Added

### Time-Series Monitoring

**Initial Readings (Time 0):**
- Temperature
- Brix
- pH
- Specific Gravity

**24-Hour Readings:**
- Temperature
- Brix
- pH
- Specific Gravity

**48-Hour Readings:**
- Temperature
- Brix
- pH
- Specific Gravity

**72-Hour Readings:**
- Temperature
- Brix
- pH
- Specific Gravity

**96-Hour Readings:**
- Temperature
- Brix
- pH
- Specific Gravity

**120-Hour Readings:**
- Temperature
- Brix
- pH
- Specific Gravity

**Final Readings:**
- Temperature
- Brix
- pH
- Specific Gravity
- Alcohol Content (calculated or measured)

**Documentation:**
- Notes (multiline text field)

### UI/UX Requirements

**Data Entry:**
- Progressive disclosure (show readings as time progresses)
- Quick entry mode for routine measurements
- Validation ranges for each measurement type
- Visual indicators for out-of-range values
- Auto-save functionality

**Visualization:**
- Time-series charts for each parameter
- Fermentation curve visualization
- Comparison view for multiple batches
- Export to CSV/Excel

## Common Features for Both Systems

### Batch Management
- Unique batch numbering system
- Batch duplication for similar runs
- Batch templates for standard recipes
- Link batches to final barrel fills

### Calculations
- Automatic volume totaling
- ABV calculations from SG readings
- Yield calculations
- Efficiency metrics

### Quality Control
- Alert thresholds for parameters
- Deviation tracking from targets
- Quality score assignment
- Non-conformance reporting

### Search & Filter
- Search by batch number
- Filter by date range
- Filter by substrate type
- Filter by final ABV
- Filter by status (active/completed)

### Reporting

**Production Reports:**
- Daily production summary
- Weekly/Monthly production totals
- Substrate usage report
- Yeast usage analysis
- Chemical/Nutrient consumption

**Quality Reports:**
- Fermentation efficiency trends
- pH stability analysis
- Temperature control performance
- Batch comparison reports

**Efficiency Metrics:**
- Yield per substrate
- Fermentation time analysis
- Success rate tracking

## Integration Points

### With Barrel Management
- Link distillation batches to barrel fills
- Track batch genealogy through barrels
- Calculate barrel fill volumes from production

### With Inventory (Future)
- Substrate inventory deduction
- Yeast/chemical inventory tracking
- Automatic reorder suggestions

## Mobile Considerations

**Field Data Entry:**
- Optimized forms for quick entry
- Offline data collection
- Photo attachment for visual documentation
- Voice notes for observations

**Notifications:**
- Reading reminder alerts
- Out-of-range parameter alerts
- Batch completion notifications

## Data Validation

**Numeric Ranges:**
- Temperature: 0-100°C
- pH: 0-14
- Brix: 0-40
- Specific Gravity: 0.900-1.200
- ABV: 0-100%

**Required Fields:**
- Batch Number
- Date
- At least one substrate

**Business Rules:**
- Batch numbers must be unique
- Dates cannot be in future
- Final readings required to mark as complete

## User Workflows

### Starting New Fermentation
1. Create new fermentation record
2. Enter substrates and volumes
3. Add yeast and nutrients
4. Record initial measurements
5. Set monitoring schedule

### Daily Monitoring
1. Select active fermentation
2. Enter current readings
3. Review trend charts
4. Add notes/observations
5. Flag any issues

### Completing Fermentation
1. Enter final readings
2. Calculate final ABV
3. Mark as complete
4. Link to distillation/barrel
5. Generate batch report

## Future Enhancements
- IoT sensor integration
- Predictive analytics
- Recipe optimization AI
- Automated report generation
- Mobile app for readings
- Barcode scanning for materials
- Integration with LIMS systems