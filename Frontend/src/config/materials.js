// src/config/materials.js

// This list contains materials that can be sorted and will appear in the inventory.
export const SORTABLE_MATERIALS = [
    'Alluminium Cane',
    'Bhangar',
    'Black Plastic',
    'Carton',
    'Duplex',
    'Glass',
    'Grey Board',
    'HD Cloth',
    'HM Polythene',
    'LD Polythene',
    'Milk Pouch',
    'Mix Plastic',
    'Pet Bottle',
    'Record',
    'Sole'
].sort();

// This list contains materials that can be sold/exported.
// It includes all sortable materials plus special export-only items.
export const EXPORTABLE_MATERIALS = [
    ...SORTABLE_MATERIALS,
    'RDF',
    'AFR'
].sort();