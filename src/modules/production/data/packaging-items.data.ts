// packaging-items.data.ts
import { PackagingItem } from '../types/packaging.types'

export const packagingItems: PackagingItem[] = [
  // Bottles
  { 
    id: "bottle-700ml-clear", 
    name: "700 mL Bottle (Clear Glass)", 
    unitCostAUD: 1.25,
    category: 'bottle',
    supplier: "Glass Manufacturer",
    notes: "Standard gin bottle"
  },
  { 
    id: "bottle-200ml-clear", 
    name: "200 mL Bottle (Clear Glass)", 
    unitCostAUD: 0.65,
    category: 'bottle',
    supplier: "Glass Manufacturer",
    notes: "Mini bottle"
  },
  { 
    id: "bottle-700ml-amber", 
    name: "700 mL Bottle (Amber Glass)", 
    unitCostAUD: 1.35,
    category: 'bottle',
    supplier: "Glass Manufacturer",
    notes: "Premium amber bottle"
  },

  // Closures
  { 
    id: "cap-aluminium", 
    name: "Aluminium Screw Cap", 
    unitCostAUD: 0.18,
    category: 'closure',
    supplier: "Closure Supplier",
    notes: "Standard screw cap"
  },
  { 
    id: "cork-natural", 
    name: "Natural Cork", 
    unitCostAUD: 0.25,
    category: 'closure',
    supplier: "Cork Supplier",
    notes: "Premium natural cork"
  },
  { 
    id: "cork-synthetic", 
    name: "Synthetic Cork", 
    unitCostAUD: 0.15,
    category: 'closure',
    supplier: "Cork Supplier",
    notes: "Consistent synthetic cork"
  },

  // Labels
  { 
    id: "label-front-main", 
    name: "Front Label (Main)", 
    unitCostAUD: 0.22,
    category: 'label',
    supplier: "Label Printer",
    notes: "Primary front label"
  },
  { 
    id: "label-back-main", 
    name: "Back Label (Main)", 
    unitCostAUD: 0.22,
    category: 'label',
    supplier: "Label Printer",
    notes: "Primary back label"
  },
  { 
    id: "label-neck", 
    name: "Neck Label", 
    unitCostAUD: 0.08,
    category: 'label',
    supplier: "Label Printer",
    notes: "Small neck label"
  },
  { 
    id: "label-gift", 
    name: "Gift Label", 
    unitCostAUD: 0.15,
    category: 'label',
    supplier: "Label Printer",
    notes: "Special gift packaging label"
  },

  // Boxes & Cartons
  { 
    id: "box-single", 
    name: "Single Bottle Gift Box", 
    unitCostAUD: 2.50,
    category: 'box',
    quantityPerCase: 1,
    supplier: "Box Manufacturer",
    notes: "Premium single bottle gift box"
  },
  { 
    id: "carton-6pack", 
    name: "6-Pack Carton", 
    unitCostAUD: 1.80,
    category: 'box',
    quantityPerCase: 6,
    supplier: "Carton Manufacturer",
    notes: "Standard 6-bottle carton"
  },
  { 
    id: "carton-12pack", 
    name: "12-Pack Carton", 
    unitCostAUD: 2.20,
    category: 'box',
    quantityPerCase: 12,
    supplier: "Carton Manufacturer",
    notes: "Bulk 12-bottle carton"
  },

  // Inserts & Accessories
  { 
    id: "insert-cardboard", 
    name: "Cardboard Insert", 
    unitCostAUD: 0.35,
    category: 'insert',
    supplier: "Insert Manufacturer",
    notes: "Cardboard bottle separator"
  },
  { 
    id: "insert-foam", 
    name: "Foam Insert", 
    unitCostAUD: 0.45,
    category: 'insert',
    supplier: "Insert Manufacturer",
    notes: "Protective foam insert"
  },
  { 
    id: "ribbon", 
    name: "Gift Ribbon", 
    unitCostAUD: 0.12,
    category: 'insert',
    supplier: "Ribbon Supplier",
    notes: "Decorative ribbon"
  },

  // Seals & Security
  { 
    id: "seal-tamper", 
    name: "Tamper Evident Seal", 
    unitCostAUD: 0.08,
    category: 'seal',
    supplier: "Seal Manufacturer",
    notes: "Security tamper seal"
  },
  { 
    id: "seal-wax", 
    name: "Wax Seal", 
    unitCostAUD: 0.15,
    category: 'seal',
    supplier: "Wax Supplier",
    notes: "Premium wax seal"
  },
  { 
    id: "seal-foil", 
    name: "Foil Seal", 
    unitCostAUD: 0.05,
    category: 'seal',
    supplier: "Foil Supplier",
    notes: "Standard foil seal"
  }
]

// Predefined packaging configurations for different gin products
export const ginPackagingConfigs = {
  'signature-dry-gin': {
    bottleId: "bottle-700ml-clear",
    closureId: "cap-aluminium",
    labelIds: ["label-front-main", "label-back-main"],
    boxId: "box-single",
    insertIds: ["insert-cardboard"],
    sealIds: ["seal-tamper"]
  },
  'navy-strength-gin': {
    bottleId: "bottle-700ml-clear",
    closureId: "cap-aluminium",
    labelIds: ["label-front-main", "label-back-main"],
    boxId: "box-single",
    insertIds: ["insert-cardboard"],
    sealIds: ["seal-tamper"]
  },
  'rainforest-gin': {
    bottleId: "bottle-700ml-clear",
    closureId: "cap-aluminium",
    labelIds: ["label-front-main", "label-back-main"],
    boxId: "box-single",
    insertIds: ["insert-cardboard"],
    sealIds: ["seal-tamper"]
  },
  'merchant-mae-gin': {
    bottleId: "bottle-700ml-clear",
    closureId: "cap-aluminium",
    labelIds: ["label-front-main", "label-back-main"],
    boxId: "box-single",
    insertIds: ["insert-cardboard"],
    sealIds: ["seal-tamper"]
  },
  'dry-season-gin': {
    bottleId: "bottle-700ml-clear",
    closureId: "cap-aluminium",
    labelIds: ["label-front-main", "label-back-main"],
    boxId: "box-single",
    insertIds: ["insert-cardboard"],
    sealIds: ["seal-tamper"]
  },
  'wet-season-gin': {
    bottleId: "bottle-700ml-clear",
    closureId: "cap-aluminium",
    labelIds: ["label-front-main", "label-back-main"],
    boxId: "box-single",
    insertIds: ["insert-cardboard"],
    sealIds: ["seal-tamper"]
  }
}
