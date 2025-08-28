# Modular Development Guide

## Overview
This guide ensures proper modular development practices for building a scalable, maintainable distillery management system.

## 🎯 Core Development Principles

### 1. Domain-Driven Design (DDD)
```typescript
// Each domain is completely self-contained
domains/
├── inventory/      # Everything inventory-related
├── production/     # Production processes
├── quality/        # Quality control
├── compliance/     # Regulatory compliance
└── shared/         # Shared utilities only
```

### 2. SOLID Principles
```typescript
// Single Responsibility
class InventoryService {
  // Only handles inventory operations
}

// Open/Closed
abstract class BaseService {
  // Extended, not modified
}

// Liskov Substitution
interface StorageLocation {
  // Tanks, barrels, warehouses all implement
}

// Interface Segregation
interface Readable {}
interface Writable {}
interface Deletable {}

// Dependency Inversion
class ProductionOrder {
  constructor(private inventoryService: IInventoryService) {}
}
```

### 3. Clean Architecture Layers
```typescript
// Clear separation of concerns
presentation/  → UI Components
application/   → Use Cases
domain/        → Business Logic
infrastructure/ → External Services
```

## 📦 Module Structure Template

### Standard Module Template
```typescript
// modules/[module-name]/index.ts
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';

// modules/[module-name]/types/index.ts
export interface ModuleConfig {
  name: string;
  version: string;
  dependencies: string[];
  permissions: Permission[];
}

// modules/[module-name]/services/base.service.ts
export abstract class BaseModuleService {
  protected abstract validateAccess(): boolean;
  protected abstract auditLog(): void;
}
```

## 🔧 Module Development Workflow

### Step 1: Define Module Interface
```typescript
// modules/inventory/types/contracts.ts
export interface IInventoryModule {
  // Public API surface
  items: IItemService;
  lots: ILotService;
  transactions: ITransactionService;
  reports: IReportService;
}

export interface IItemService {
  findAll(filters?: ItemFilters): Promise<Item[]>;
  findOne(id: string): Promise<Item>;
  create(data: CreateItemDto): Promise<Item>;
  update(id: string, data: UpdateItemDto): Promise<Item>;
  delete(id: string): Promise<void>;
}
```

### Step 2: Implement Core Services
```typescript
// modules/inventory/services/item.service.ts
import { BaseService } from '@/lib/services/base';
import { IItemService } from '../types/contracts';

export class ItemService extends BaseService implements IItemService {
  constructor(
    private readonly db: Database,
    private readonly cache: Cache,
    private readonly events: EventBus
  ) {
    super('inventory_items');
  }

  async create(data: CreateItemDto): Promise<Item> {
    // Validate
    await this.validate(data);
    
    // Business logic
    const item = await this.processBusinessRules(data);
    
    // Persist
    const saved = await this.db.items.create(item);
    
    // Side effects
    await this.cache.invalidate('items:*');
    await this.events.publish('item.created', saved);
    
    // Audit
    await this.auditLog('CREATE', saved);
    
    return saved;
  }
}
```

### Step 3: Create Module Hooks
```typescript
// modules/inventory/hooks/useInventory.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { InventoryService } from '../services';

export function useInventoryItems(filters?: ItemFilters) {
  const service = new InventoryService();
  
  return useQuery({
    queryKey: ['inventory', 'items', filters],
    queryFn: () => service.items.findAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const service = new InventoryService();
  
  return useMutation({
    mutationFn: (data: CreateItemDto) => service.items.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory', 'items']);
    },
  });
}
```

### Step 4: Build Module Components
```typescript
// modules/inventory/components/ItemList.tsx
'use client';

import { useInventoryItems } from '../hooks';
import { ItemCard } from './ItemCard';
import { ItemFilters } from './ItemFilters';

export function ItemList() {
  const [filters, setFilters] = useState<ItemFilters>();
  const { data: items, isLoading, error } = useInventoryItems(filters);
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div className="space-y-4">
      <ItemFilters value={filters} onChange={setFilters} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items?.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

## 🔌 Inter-Module Communication

### Event-Driven Architecture
```typescript
// lib/events/event-bus.ts
export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  
  subscribe(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }
  
  async publish(event: string, data: any) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map(handler => handler(data))
      );
    }
  }
}

// Module usage
// modules/production/services/order.service.ts
class ProductionOrderService {
  async completeOrder(orderId: string) {
    const order = await this.complete(orderId);
    
    // Notify other modules
    await this.events.publish('production.order.completed', {
      orderId,
      items: order.items,
      quantity: order.quantity
    });
  }
}

// modules/inventory/listeners/production.listener.ts
eventBus.subscribe('production.order.completed', async (data) => {
  // Update inventory based on production
  await inventoryService.consumeMaterials(data.items);
  await inventoryService.addFinishedGoods(data.quantity);
});
```

### Service Registry Pattern
```typescript
// lib/services/registry.ts
export class ServiceRegistry {
  private services: Map<string, any> = new Map();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} not registered`);
    }
    return this.services.get(name) as T;
  }
}

// App initialization
const registry = new ServiceRegistry();
registry.register('inventory', new InventoryService());
registry.register('production', new ProductionService());
registry.register('quality', new QualityService());

// Cross-module usage
class ProductionService {
  async checkMaterialAvailability(recipe: Recipe) {
    const inventory = this.registry.get<InventoryService>('inventory');
    return inventory.checkAvailability(recipe.ingredients);
  }
}
```

## 🏗️ Shared Module Architecture

### Shared Components Library
```typescript
// modules/shared/components/index.ts
export { DataTable } from './DataTable';
export { SearchBar } from './SearchBar';
export { DateRangePicker } from './DateRangePicker';
export { ConfirmDialog } from './ConfirmDialog';
export { LoadingSpinner } from './LoadingSpinner';

// Usage in modules
import { DataTable } from '@/modules/shared/components';
```

### Shared Services
```typescript
// modules/shared/services/index.ts
export { AuditService } from './audit.service';
export { NotificationService } from './notification.service';
export { ExportService } from './export.service';
export { ValidationService } from './validation.service';
```

### Shared Types
```typescript
// modules/shared/types/index.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
```

## 🧪 Module Testing Strategy

### Unit Testing
```typescript
// modules/inventory/__tests__/services/item.service.test.ts
describe('ItemService', () => {
  let service: ItemService;
  let mockDb: MockDatabase;
  
  beforeEach(() => {
    mockDb = createMockDatabase();
    service = new ItemService(mockDb);
  });
  
  describe('create', () => {
    it('should create item with valid data', async () => {
      const data = createValidItemData();
      const result = await service.create(data);
      
      expect(result).toHaveProperty('id');
      expect(mockDb.items.create).toHaveBeenCalledWith(data);
    });
    
    it('should reject invalid data', async () => {
      const data = createInvalidItemData();
      await expect(service.create(data)).rejects.toThrow();
    });
  });
});
```

### Integration Testing
```typescript
// modules/inventory/__tests__/integration/inventory.test.ts
describe('Inventory Module Integration', () => {
  it('should handle complete inventory workflow', async () => {
    // Create item
    const item = await inventoryModule.items.create(itemData);
    
    // Create lot
    const lot = await inventoryModule.lots.create({
      itemId: item.id,
      ...lotData
    });
    
    // Create transaction
    const transaction = await inventoryModule.transactions.create({
      lotId: lot.id,
      type: 'RECEIVE',
      quantity: 100
    });
    
    // Verify stock level
    const stock = await inventoryModule.reports.getStockLevel(item.id);
    expect(stock.quantity).toBe(100);
  });
});
```

## 📈 Module Performance Optimization

### Lazy Loading Modules
```typescript
// app/(dashboard)/inventory/page.tsx
import dynamic from 'next/dynamic';

const InventoryModule = dynamic(
  () => import('@/modules/inventory').then(mod => mod.InventoryModule),
  {
    loading: () => <ModuleLoader />,
    ssr: false
  }
);
```

### Module Code Splitting
```typescript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        inventory: {
          name: 'inventory',
          test: /[\\/]modules[\\/]inventory/,
          priority: 10
        },
        production: {
          name: 'production',
          test: /[\\/]modules[\\/]production/,
          priority: 10
        }
      }
    };
    return config;
  }
};
```

## 🔐 Module Security

### Permission-Based Access
```typescript
// modules/inventory/guards/permission.guard.ts
export function requirePermission(permission: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const user = await getCurrentUser();
      
      if (!user.hasPermission(permission)) {
        throw new ForbiddenError(`Permission denied: ${permission}`);
      }
      
      return originalMethod.apply(this, args);
    };
  };
}

// Usage
class ItemService {
  @requirePermission('inventory:write')
  async create(data: CreateItemDto) {
    // Method implementation
  }
}
```

### Data Validation
```typescript
// modules/inventory/validators/item.validator.ts
import { z } from 'zod';

export const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['botanical', 'spirit', 'packaging']),
  unitOfMeasure: z.string(),
  abv: z.number().min(0).max(100).optional(),
  supplierId: z.string().uuid().optional(),
});

export const validateCreateItem = (data: unknown) => {
  return CreateItemSchema.parse(data);
};
```

## 📊 Module Monitoring

### Health Checks
```typescript
// modules/inventory/health/health.service.ts
export class InventoryHealthService {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkCache(),
      this.checkExternalServices(),
    ]);
    
    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: checks.map(formatHealthCheck),
      timestamp: new Date(),
    };
  }
}
```

### Performance Metrics
```typescript
// modules/inventory/metrics/performance.ts
export function trackPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    const start = performance.now();
    
    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;
      
      metrics.record({
        module: 'inventory',
        method: propertyKey,
        duration,
        status: 'success'
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      metrics.record({
        module: 'inventory',
        method: propertyKey,
        duration,
        status: 'error',
        error: error.message
      });
      
      throw error;
    }
  };
}
```

## ✅ Module Development Checklist

### Before Starting a Module
- [ ] Define clear module boundaries
- [ ] Identify dependencies
- [ ] Create interface contracts
- [ ] Design data models
- [ ] Plan API endpoints

### During Development
- [ ] Follow naming conventions
- [ ] Implement error handling
- [ ] Add comprehensive logging
- [ ] Write unit tests alongside code
- [ ] Document public APIs

### Before Integration
- [ ] Complete test coverage (>80%)
- [ ] Performance testing
- [ ] Security review
- [ ] Documentation complete
- [ ] Code review passed

### After Deployment
- [ ] Monitor performance metrics
- [ ] Track error rates
- [ ] Gather user feedback
- [ ] Plan improvements
- [ ] Update documentation