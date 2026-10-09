import { PrismaClient } from '@prisma/client';

/**
 * India-focused rental catalogue for quick machine booking.
 * All prices are INDICATIVE (₹, excl. 18% GST) for tier-1/2 cities.
 * Replace with live vendor/city pricing before going to production.
 *
 * Segments:  LIGHT  = home builders, contractors, small jobs (doorstep delivery, no operator needed)
 *            HEAVY  = infra / large site equipment (usually operator + mobilisation)
 *            OTHER  = site support, farm, utilities, events
 */

export type Segment = 'LIGHT' | 'HEAVY' | 'OTHER';
export type FuelPolicy = 'WET' | 'DRY' | 'ELECTRIC' | 'NA';

export interface RentalInfo {
  hourlyInr?: number;
  dailyInr?: number; // 8-hour shift unless stated
  weeklyInr?: number;
  monthlyInr?: number; // typically 26 working days
  perTripInr?: number;
  minBooking: string; // e.g. "4 hours", "1 day"
  operatorIncluded: boolean;
  fuelPolicy: FuelPolicy; // WET = fuel + operator included, DRY = customer supplies fuel
  securityDepositInr: number;
  deliveryAvailable: boolean;
  mobilisationNote?: string;
}

export interface MachineSeed {
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  displayOrder: number;
  specifications: Record<string, string | number | boolean | string[] | RentalInfo>;
}

export interface ConstructionCategorySeed {
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  imageUrl?: string;
  displayOrder: number;
  machines: MachineSeed[];
}

const img = (slug: string) => `https://cdn.example.com/machines/${slug}.jpg`;
const icon = (slug: string) => `https://cdn.example.com/icons/${slug}.svg`;

const rent = (r: Partial<RentalInfo> & Pick<RentalInfo, 'minBooking'>): RentalInfo => ({
  operatorIncluded: false,
  fuelPolicy: 'NA',
  securityDepositInr: 0,
  deliveryAvailable: true,
  ...r,
});

/** Build a machine entry; segment/aliases/useCases/rental are stored inside `specifications` JSON. */
const machine = (
  m: Omit<MachineSeed, 'specifications' | 'imageUrl'> & {
    segment: Segment;
    aliases: string[]; // local / search names
    useCases: string[]; // plain-language "what is it good for"
    brands: string[];
    rental: RentalInfo;
    specs: Record<string, string | number | boolean>;
  },
): MachineSeed => ({
  name: m.name,
  slug: m.slug,
  description: m.description,
  imageUrl: img(m.slug),
  displayOrder: m.displayOrder,
  specifications: {
    ...m.specs,
    segment: m.segment,
    aliases: m.aliases,
    useCases: m.useCases,
    popularBrands: m.brands,
    rental: m.rental,
  },
});

export const CONSTRUCTION_CATEGORIES_AND_MACHINES: ConstructionCategorySeed[] = [
  // ───────────────────────── 1. HOME & LIGHT CONSTRUCTION TOOLS ─────────────────────────
  {
    name: 'Light Construction Tools',
    slug: 'light-construction-tools',
    description:
      'Small, easy-to-use machines for house construction, renovation and repair. Book by the day, delivered to your site.',
    iconUrl: icon('light-tools'),
    imageUrl: img('cat-light-tools'),
    displayOrder: 1,
    machines: [
      machine({
        name: 'Concrete Mixer Machine (Half Bag)',
        slug: 'concrete-mixer-half-bag',
        description:
          'Petrol/diesel/electric drum mixer for slabs, columns and flooring. The most common machine for house construction.',
        displayOrder: 1,
        segment: 'LIGHT',
        aliases: ['mixer machine', 'cement mixer', 'half bag mixer', 'mixer'],
        useCases: ['House slab', 'Column and beam casting', 'Flooring', 'Plastering mix'],
        brands: ['Ajax Fiori', 'Schwing Stetter', 'Neptune'],
        rental: rent({
          dailyInr: 500,
          weeklyInr: 2800,
          monthlyInr: 9000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 3000,
        }),
        specs: {
          capacity: 'Half bag (~140 L)',
          power: 'Diesel 5 HP / Electric 3 HP',
          hopper: 'Hydraulic hopper optional',
        },
      }),
      machine({
        name: 'Concrete Mixer with Hopper (1 Bag)',
        slug: 'concrete-mixer-hopper-1-bag',
        description:
          'Higher output mixer with hydraulic hopper for multi-storey buildings and larger pours.',
        displayOrder: 2,
        segment: 'LIGHT',
        aliases: ['hopper mixer', 'one bag mixer', 'lift mixer'],
        useCases: ['Multi-storey slabs', 'Commercial buildings', 'Road patch work'],
        brands: ['Ajax Fiori', 'Schwing Stetter'],
        rental: rent({
          dailyInr: 1200,
          weeklyInr: 7000,
          monthlyInr: 22000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 8000,
        }),
        specs: { capacity: '1 bag (~280 L)', power: 'Diesel 10 HP', hopper: true },
      }),
      machine({
        name: 'Needle Vibrator (Concrete)',
        slug: 'needle-vibrator',
        description:
          'Removes air bubbles from freshly poured concrete for strong, honeycomb-free structures.',
        displayOrder: 3,
        segment: 'LIGHT',
        aliases: ['vibrator', 'poker vibrator', 'concrete vibrator'],
        useCases: ['Slab casting', 'Column casting', 'Foundation pours'],
        brands: ['Wacker Neuson', 'Ajax Fiori', 'Bosch'],
        rental: rent({
          dailyInr: 400,
          weeklyInr: 2200,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 2000,
        }),
        specs: { needleDiameterMm: 40, hoseLengthM: 6, powerKw: 1.5 },
      }),
      machine({
        name: 'Plate Compactor (Plate Vibrator)',
        slug: 'plate-compactor-light',
        description: 'Walk-behind compactor for soil, paver blocks, parking and trench backfill.',
        displayOrder: 4,
        segment: 'LIGHT',
        aliases: ['plate vibrator', 'jumping jack', 'compactor', 'rammer'],
        useCases: ['Plinth backfill', 'Paver blocks', 'Driveway base', 'Trench backfill'],
        brands: ['Wacker Neuson', 'Bomag', 'Ammann'],
        rental: rent({
          dailyInr: 1800,
          weeklyInr: 9500,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 6000,
        }),
        specs: { operatingWeightKg: 90, plateWidthMm: 450, fuelType: 'Petrol' },
      }),
      machine({
        name: 'Demolition Breaker (Jack Hammer, Electric)',
        slug: 'electric-demolition-breaker',
        description:
          'Handheld breaker for chipping concrete, breaking tiles, floors and walls during renovation.',
        displayOrder: 5,
        segment: 'LIGHT',
        aliases: ['jack hammer', 'breaker machine', 'hilti', 'chipping machine'],
        useCases: ['Wall breaking', 'Floor chipping', 'Tile removal', 'Door/window openings'],
        brands: ['Bosch', 'Hilti', 'Makita'],
        rental: rent({
          dailyInr: 700,
          weeklyInr: 3800,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 4000,
        }),
        specs: { powerW: 1700, impactEnergyJ: 41, weightKg: 12 },
      }),
      machine({
        name: 'Rotary Hammer / Heavy Drill Machine',
        slug: 'rotary-hammer-drill',
        description:
          'Drills holes in concrete and brick for anchors, rods, plumbing and electrical work.',
        displayOrder: 6,
        segment: 'LIGHT',
        aliases: ['hammer drill', 'concrete drill', 'bosch drill'],
        useCases: ['Anchor bolts', 'Chemical anchoring', 'Plumbing core holes'],
        brands: ['Bosch', 'Hilti', 'Makita', 'DeWalt'],
        rental: rent({
          dailyInr: 400,
          weeklyInr: 2000,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 2500,
        }),
        specs: { powerW: 1050, maxDrillDiameterMm: 30 },
      }),
      machine({
        name: 'Core Cutting Machine',
        slug: 'core-cutting-machine',
        description:
          'Cuts clean round holes in RCC for pipes, AC ducts and drainage with minimal damage.',
        displayOrder: 7,
        segment: 'LIGHT',
        aliases: ['core cutter', 'diamond core drill'],
        useCases: ['AC/pipe holes in slabs', 'Sample cores for testing'],
        brands: ['Hilti', 'Bosch', 'Dewalt'],
        rental: rent({
          dailyInr: 1500,
          weeklyInr: 8000,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 8000,
        }),
        specs: { maxCoreDiameterMm: 200, powerW: 2200, waterCooled: true },
      }),
      machine({
        name: 'Concrete / Tile Cutter (Floor Saw)',
        slug: 'concrete-floor-cutter',
        description:
          'Diamond-blade cutter for road joints, tiles, marble, kerbstones and concrete floors.',
        displayOrder: 8,
        segment: 'LIGHT',
        aliases: ['groove cutter', 'wall chaser', 'marble cutter', 'cutting machine'],
        useCases: ['Expansion joints', 'Electrical chasing', 'Tile/marble cutting'],
        brands: ['Stihl', 'Bosch', 'Makita'],
        rental: rent({
          dailyInr: 800,
          weeklyInr: 4200,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 3500,
        }),
        specs: { bladeDiameterMm: 350, power: 'Petrol / Electric' },
      }),
      machine({
        name: 'Bar Bending & Cutting Machine',
        slug: 'bar-bending-cutting-machine',
        description:
          'Cuts and bends TMT steel bars for stirrups, rings and column cages quickly and accurately.',
        displayOrder: 9,
        segment: 'LIGHT',
        aliases: ['bar bender', 'bar cutter', 'saria cutter', 'TMT cutter'],
        useCases: ['Stirrups', 'Column cages', 'Slab reinforcement'],
        brands: ['Ajax', 'Techno', 'Local OEM'],
        rental: rent({
          dailyInr: 600,
          weeklyInr: 3200,
          monthlyInr: 10000,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 5000,
        }),
        specs: { maxBarDiameterMm: 32, powerKw: 2.2 },
      }),
      machine({
        name: 'Scaffolding (Cuplock / H-Frame) per Sq Ft',
        slug: 'scaffolding-cuplock',
        description:
          'Standard cuplock scaffolding for plastering, painting, facade and slab shuttering support.',
        displayOrder: 10,
        segment: 'LIGHT',
        aliases: ['paada', 'scaffold', 'cuplock', 'staging', 'bhaara'],
        useCases: ['Plastering', 'Painting', 'Slab shuttering'],
        brands: ['Local certified fabricators'],
        rental: rent({
          monthlyInr: 3,
          minBooking: '30 days',
          securityDepositInr: 5000,
          mobilisationNote:
            'Price per sq ft per month; includes transport & erection quote on request',
        }),
        specs: {
          pricingUnit: 'INR per sq ft / month',
          loadRatingKgPerM2: 300,
          heightsAvailableM: '3 - 20',
        },
      }),
      machine({
        name: 'Adjustable Steel Props & Shuttering Plates',
        slug: 'steel-props-shuttering',
        description: 'Telescopic steel props and centring plates for slab and beam formwork.',
        displayOrder: 11,
        segment: 'LIGHT',
        aliases: ['centring', 'shuttering', 'props', 'plates'],
        useCases: ['Slab formwork', 'Beam formwork'],
        brands: ['Local OEM'],
        rental: rent({
          dailyInr: 5,
          monthlyInr: 90,
          minBooking: '15 days',
          securityDepositInr: 5000,
          mobilisationNote: 'Price per prop/plate',
        }),
        specs: { propHeightRangeM: '2.0 - 3.6', plateSizeMm: '600 x 300' },
      }),
      machine({
        name: 'High-Pressure Washer',
        slug: 'high-pressure-washer',
        description:
          'Cleans walls, floors, vehicles and machinery. Useful for pre-paint prep and site cleaning.',
        displayOrder: 12,
        segment: 'LIGHT',
        aliases: ['jet washer', 'karcher'],
        useCases: ['Facade cleaning', 'Floor prep', 'Vehicle washing'],
        brands: ['Karcher', 'Bosch', 'Black+Decker'],
        rental: rent({
          dailyInr: 700,
          weeklyInr: 3500,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 3000,
        }),
        specs: { pressureBar: 150, powerW: 2100 },
      }),
    ],
  },

  // ───────────────────────── 2. EARTHMOVING ─────────────────────────
  {
    name: 'Earthmoving Equipment',
    slug: 'earthmoving-equipment',
    description:
      'JCBs, excavators, loaders and dozers for digging, levelling, foundation and site clearing. Book with operator.',
    iconUrl: icon('earthmoving'),
    imageUrl: img('cat-earthmoving'),
    displayOrder: 2,
    machines: [
      machine({
        name: 'JCB 3DX Backhoe Loader',
        slug: 'jcb-3dx-backhoe-loader',
        description:
          "India's most booked machine. Front loader plus rear digger for foundation digging, levelling, loading and breaking with attachment.",
        displayOrder: 1,
        segment: 'HEAVY',
        aliases: ['JCB', 'JCB 3DX', 'backhoe', 'khudai machine'],
        useCases: ['Foundation digging', 'Levelling plot', 'Loading mud/sand', 'Pipeline trench'],
        brands: ['JCB', 'Case', 'Mahindra EarthMaster', 'Escorts'],
        rental: rent({
          hourlyInr: 1000,
          dailyInr: 7500,
          monthlyInr: 165000,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
          securityDepositInr: 0,
          mobilisationNote:
            'Fuel by customer (~6-8 L/hr). Wet rate +₹350/hr. Lowbed charges extra for >25 km.',
        }),
        specs: {
          operatingWeightKg: 7500,
          enginePowerHp: 76,
          maxDiggingDepthM: 4.5,
          loaderBucketM3: 1.0,
          driveType: '2WD / 4WD',
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'JCB with Hydraulic Breaker',
        slug: 'jcb-with-breaker',
        description:
          'Backhoe loader fitted with hydraulic hammer for breaking old slabs, rock and hard soil.',
        displayOrder: 2,
        segment: 'HEAVY',
        aliases: ['JCB breaker', 'JCB hammer', 'rock breaker JCB'],
        useCases: ['Breaking old structures', 'Hard soil/rock', 'Road demolition'],
        brands: ['JCB', 'Indeco', 'Montabert'],
        rental: rent({
          hourlyInr: 1400,
          dailyInr: 10500,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { breakerWeightKg: 450, impactRateBpm: 600, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Excavator 80-100 (Mini / Compact)',
        slug: 'excavator-compact-8t',
        description: 'Compact excavator for tight lanes, basements and urban utility digging.',
        displayOrder: 3,
        segment: 'HEAVY',
        aliases: ['mini poclain', 'mini excavator', 'JCB 8080', 'compact excavator'],
        useCases: ['Narrow plot digging', 'Basement digging', 'Drain/sewer work'],
        brands: ['JCB', 'Kubota', 'Hyundai', 'Tata Hitachi'],
        rental: rent({
          hourlyInr: 1100,
          dailyInr: 8500,
          monthlyInr: 190000,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          operatingWeightKg: 8000,
          enginePowerHp: 50,
          maxDiggingDepthM: 4.0,
          zeroTailSwing: true,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Hydraulic Excavator 200-210 (Poclain)',
        slug: 'excavator-200-210',
        description:
          'Standard 20-ton tracked excavator for large foundations, canals, highways and quarry loading.',
        displayOrder: 4,
        segment: 'HEAVY',
        aliases: ['poclain', 'PC200', 'EX200', 'excavator 20 ton'],
        useCases: ['Large foundation', 'Canal/drain', 'Highway earthwork', 'Loading trucks'],
        brands: ['Tata Hitachi', 'L&T Komatsu', 'Volvo', 'CAT', 'Hyundai', 'JCB'],
        rental: rent({
          hourlyInr: 1800,
          dailyInr: 14000,
          monthlyInr: 330000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
          mobilisationNote:
            'Lowbed trailer charges extra (₹8,000 - 25,000 one-way depending on distance).',
        }),
        specs: {
          operatingWeightKg: 20500,
          enginePowerHp: 140,
          bucketCapacityM3: 1.0,
          maxDiggingDepthM: 6.5,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Excavator 300+ (Heavy Duty)',
        slug: 'excavator-300',
        description: 'Large 30-ton excavator for mining, big infrastructure and bulk earthwork.',
        displayOrder: 5,
        segment: 'HEAVY',
        aliases: ['PC300', 'EX300', 'big poclain'],
        useCases: ['Mining', 'Large infrastructure', 'Bulk earthwork'],
        brands: ['Tata Hitachi', 'L&T Komatsu', 'CAT', 'Volvo'],
        rental: rent({
          hourlyInr: 2600,
          dailyInr: 21000,
          monthlyInr: 480000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          operatingWeightKg: 30000,
          enginePowerHp: 220,
          bucketCapacityM3: 1.6,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Skid Steer Loader (Bobcat)',
        slug: 'skid-steer-loader',
        description:
          'Compact, agile loader for small spaces, with bucket, breaker, sweeper and auger attachments.',
        displayOrder: 6,
        segment: 'LIGHT',
        aliases: ['bobcat', 'skid steer', 'chhota loader'],
        useCases: ['Debris clearing', 'Basement work', 'Small levelling', 'Material shifting'],
        brands: ['Bobcat', 'JCB', 'CAT', 'Case'],
        rental: rent({
          hourlyInr: 850,
          dailyInr: 6500,
          monthlyInr: 140000,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          operatingWeightKg: 3200,
          enginePowerHp: 74,
          ratedCapacityKg: 1100,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Bulldozer (D50 / D65)',
        slug: 'bulldozer',
        description:
          'Tracked dozer for land clearing, plot levelling, road base and heavy pushing work.',
        displayOrder: 7,
        segment: 'HEAVY',
        aliases: ['dozer', 'D65', 'bulldozer'],
        useCases: ['Plot levelling', 'Forest/land clearing', 'Road formation'],
        brands: ['BEML', 'CAT', 'Komatsu'],
        rental: rent({
          hourlyInr: 2200,
          dailyInr: 17500,
          monthlyInr: 400000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          operatingWeightKg: 18000,
          enginePowerHp: 190,
          bladeCapacityM3: 4.5,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Wheel Loader',
        slug: 'wheel-loader',
        description: 'Fast loader for sand, aggregate, RMC plants, coal yards and stockpiles.',
        displayOrder: 8,
        segment: 'HEAVY',
        aliases: ['payloader', 'loader 2.5 cum', 'shovel'],
        useCases: ['Loading tippers', 'Stockpile handling', 'RMC / crusher plant'],
        brands: ['JCB', 'CAT', 'BEML', 'Tata Hitachi', 'SDLG'],
        rental: rent({
          hourlyInr: 1500,
          dailyInr: 12000,
          monthlyInr: 280000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          operatingWeightKg: 14000,
          enginePowerHp: 160,
          bucketCapacityM3: 2.5,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Motor Grader',
        slug: 'motor-grader',
        description: 'Fine grading machine for road base, village roads and airport surfaces.',
        displayOrder: 9,
        segment: 'HEAVY',
        aliases: ['grader', 'road grader'],
        useCases: ['Road base grading', 'Village/internal roads', 'WBM / GSB layers'],
        brands: ['BEML', 'CAT', 'Mahindra'],
        rental: rent({
          hourlyInr: 1700,
          dailyInr: 13500,
          monthlyInr: 310000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          operatingWeightKg: 14500,
          enginePowerHp: 140,
          bladeWidthM: 3.7,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Trencher / Chain Cutter',
        slug: 'trencher',
        description: 'Cuts narrow, deep trenches for cables, pipelines and fibre ducts.',
        displayOrder: 10,
        segment: 'HEAVY',
        aliases: ['trench digger', 'cable trencher'],
        useCases: ['Cable laying', 'Pipeline trench', 'OFC ducting'],
        brands: ['Vermeer', 'Ditch Witch', 'Local OEM'],
        rental: rent({
          hourlyInr: 1300,
          dailyInr: 10000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          maxTrenchDepthM: 1.5,
          maxTrenchWidthMm: 300,
          enginePowerHp: 60,
          fuelType: 'Diesel',
        },
      }),
    ],
  },

  // ───────────────────────── 3. LIFTING ─────────────────────────
  {
    name: 'Cranes & Lifting Equipment',
    slug: 'cranes-and-lifting',
    description:
      'Hydra cranes, tower cranes, forklifts, man-lifts and hoists for lifting material and working at height.',
    iconUrl: icon('lifting'),
    imageUrl: img('cat-lifting'),
    displayOrder: 3,
    machines: [
      machine({
        name: 'Hydra Crane (12 - 14 Ton)',
        slug: 'hydra-crane-12t',
        description:
          'Pick-and-carry mobile crane. Most popular for machinery shifting, steel erection and AC/tank lifting.',
        displayOrder: 1,
        segment: 'HEAVY',
        aliases: ['hydra', 'ACE hydra', 'Escorts hydra', 'pick and carry crane', 'Hydra 12 ton'],
        useCases: [
          'Machinery shifting',
          'Steel/precast erection',
          'AC/water tank lifting',
          'Factory maintenance',
        ],
        brands: ['ACE', 'Escorts', 'Mahindra', 'Tata'],
        rental: rent({
          hourlyInr: 900,
          dailyInr: 7000,
          monthlyInr: 150000,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
          mobilisationNote: 'Self-driving. Local travel included within 10 km.',
        }),
        specs: {
          maxLiftingCapacityTonnes: 12,
          boomLengthM: 12,
          enginePowerHp: 100,
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Hydra Crane (20 - 25 Ton)',
        slug: 'hydra-crane-25t',
        description: 'Heavier pick-and-carry crane for large machinery, girders and transformers.',
        displayOrder: 2,
        segment: 'HEAVY',
        aliases: ['hydra 25 ton', 'pick and carry 25T'],
        useCases: ['Girder lifting', 'Transformer placement', 'Heavy machinery'],
        brands: ['ACE', 'Escorts', 'Mahindra'],
        rental: rent({
          hourlyInr: 1400,
          dailyInr: 11000,
          monthlyInr: 240000,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { maxLiftingCapacityTonnes: 25, boomLengthM: 20, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Mobile Telescopic Crane (50 Ton)',
        slug: 'mobile-crane-50t',
        description: 'All-terrain telescopic crane for industrial erection, bridge and tower work.',
        displayOrder: 3,
        segment: 'HEAVY',
        aliases: ['50 ton crane', 'truck crane', 'telescopic crane'],
        useCases: ['Industrial erection', 'Bridge girders', 'Tower installation'],
        brands: ['Tadano', 'Liebherr', 'XCMG', 'Grove'],
        rental: rent({
          hourlyInr: 3500,
          dailyInr: 28000,
          monthlyInr: 650000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { maxLiftingCapacityTonnes: 50, maxBoomLengthM: 40, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Crawler Crane (75 - 150 Ton)',
        slug: 'crawler-crane',
        description:
          'Heavy lattice-boom crane for infrastructure, power plants and bridges on soft ground.',
        displayOrder: 4,
        segment: 'HEAVY',
        aliases: ['lattice crane', 'crawler 100 ton', 'Sany crane'],
        useCases: ['Power plants', 'Bridge piers', 'Heavy industrial erection'],
        brands: ['Sany', 'Liebherr', 'Manitowoc', 'Kobelco'],
        rental: rent({
          dailyInr: 55000,
          monthlyInr: 1400000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
          mobilisationNote: 'Transport and assembly quoted separately.',
        }),
        specs: { maxLiftingCapacityTonnes: 100, maxBoomLengthM: 70, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Tower Crane',
        slug: 'tower-crane',
        description:
          'Fixed crane for high-rise buildings. Monthly rental, erection and dismantling quoted separately.',
        displayOrder: 5,
        segment: 'HEAVY',
        aliases: ['tower crane', 'luffing crane'],
        useCases: ['High-rise buildings', 'Large residential projects'],
        brands: ['Potain', 'Zoomlion', 'Liebherr', 'Jaso'],
        rental: rent({
          monthlyInr: 350000,
          minBooking: '3 months',
          operatorIncluded: true,
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 500000,
          mobilisationNote: 'Erection + dismantling ~₹3-6 lakh extra.',
        }),
        specs: {
          maxLiftingCapacityTonnes: 8,
          jibLengthM: 55,
          freestandingHeightM: 45,
          powerSupply: '415V 3-Phase',
        },
      }),
      machine({
        name: 'Forklift (3 Ton Diesel)',
        slug: 'forklift-3t',
        description: 'Warehouse and site forklift for pallets, bricks, cement and factory loading.',
        displayOrder: 6,
        segment: 'LIGHT',
        aliases: ['forklift', 'fork lift 3 ton'],
        useCases: ['Warehouse', 'Factory loading', 'Brick/cement stacking'],
        brands: ['Godrej', 'Voltas', 'Toyota', 'Hyster'],
        rental: rent({
          dailyInr: 3500,
          monthlyInr: 65000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
          securityDepositInr: 15000,
        }),
        specs: { liftCapacityKg: 3000, liftHeightM: 4.5, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Telehandler',
        slug: 'telehandler',
        description:
          'Telescopic loader reaching multi-storey heights for placing material without a crane.',
        displayOrder: 7,
        segment: 'HEAVY',
        aliases: ['telescopic handler', 'JCB 530'],
        useCases: [
          'Multi-floor material placement',
          'Roof sheeting',
          'Solar structure installation',
        ],
        brands: ['JCB', 'Manitou', 'Merlo'],
        rental: rent({
          hourlyInr: 1300,
          dailyInr: 10000,
          monthlyInr: 230000,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { maxLiftingCapacityKg: 4000, maxLiftHeightM: 17, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Boom Lift / Cherry Picker (Articulated)',
        slug: 'boom-lift-articulated',
        description:
          'Work-at-height platform with flexible arm. Great for facades, signage, street lights and tree trimming.',
        displayOrder: 8,
        segment: 'HEAVY',
        aliases: ['cherry picker', 'man lift', 'JLG', 'boom lift'],
        useCases: ['Facade work', 'Signage/hoarding', 'Street lights', 'High ceilings'],
        brands: ['JLG', 'Genie', 'Skyjack', 'Dingli'],
        rental: rent({
          dailyInr: 9000,
          weeklyInr: 50000,
          monthlyInr: 150000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
          securityDepositInr: 25000,
        }),
        specs: { workingHeightM: 20, platformCapacityKg: 230, powerType: 'Diesel / Electric' },
      }),
      machine({
        name: 'Electric Scissor Lift',
        slug: 'electric-scissor-lift',
        description:
          'Vertical platform for indoor work: false ceilings, electrical, HVAC and warehouse maintenance.',
        displayOrder: 9,
        segment: 'LIGHT',
        aliases: ['scissor lift', 'aerial work platform', 'AWP'],
        useCases: ['False ceiling', 'Electrical/HVAC', 'Warehouse racking', 'Painting'],
        brands: ['JLG', 'Genie', 'Skyjack', 'Dingli'],
        rental: rent({
          dailyInr: 3500,
          weeklyInr: 18000,
          monthlyInr: 50000,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 15000,
        }),
        specs: { workingHeightM: 10, platformCapacityKg: 320, batteryVoltage: '24V' },
      }),
      machine({
        name: 'Material / Passenger Hoist (Construction Lift)',
        slug: 'construction-hoist',
        description:
          'Rack-and-pinion hoist for moving workers and material in multi-storey buildings.',
        displayOrder: 10,
        segment: 'HEAVY',
        aliases: ['construction lift', 'goods lift', 'material hoist'],
        useCases: ['Multi-storey material lifting', 'Worker transport'],
        brands: ['Alimak', 'Local OEM'],
        rental: rent({
          monthlyInr: 85000,
          minBooking: '1 month',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 100000,
          mobilisationNote: 'Installation & certification extra.',
        }),
        specs: { capacityKg: 1500, maxHeightM: 60, powerKw: 15 },
      }),
      machine({
        name: 'Chain Pulley Block & Tripod (Manual)',
        slug: 'chain-pulley-block',
        description:
          'Manual hoist for lifting up to a few tons in workshops, wells and small installations.',
        displayOrder: 11,
        segment: 'LIGHT',
        aliases: ['chain block', 'chain pulley', 'tripod hoist'],
        useCases: ['Motor/pump lifting', 'Workshop', 'Well work'],
        brands: ['Kito', 'Local OEM'],
        rental: rent({
          dailyInr: 400,
          weeklyInr: 2000,
          minBooking: '1 day',
          securityDepositInr: 3000,
        }),
        specs: { capacityTonnes: 3, liftHeightM: 3 },
      }),
    ],
  },

  // ───────────────────────── 4. CONCRETE & COMPACTION ─────────────────────────
  {
    name: 'Concrete, Compaction & RMC',
    slug: 'concrete-and-compaction',
    description:
      'Transit mixers, concrete pumps, rollers and batching plants for large pours and road/ground compaction.',
    iconUrl: icon('concrete'),
    imageUrl: img('cat-concrete'),
    displayOrder: 4,
    machines: [
      machine({
        name: 'Transit Mixer (6 cum)',
        slug: 'transit-mixer-6cum',
        description: 'Truck-mounted drum that delivers ready-mix concrete (RMC) to your site.',
        displayOrder: 1,
        segment: 'HEAVY',
        aliases: ['RMC truck', 'TM', 'ready mix truck', 'mixer truck'],
        useCases: ['Slab pours', 'Large foundations', 'Road concreting'],
        brands: ['Tata', 'Ashok Leyland', 'BharatBenz', 'Schwing Stetter'],
        rental: rent({
          dailyInr: 10000,
          monthlyInr: 240000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { drumCapacityM3: 6, chassis: '6x4', fuelType: 'Diesel' },
      }),
      machine({
        name: 'Concrete Line Pump (Stationary)',
        slug: 'concrete-line-pump',
        description:
          'Stationary pump with pipes to deliver concrete to upper floors and difficult locations.',
        displayOrder: 2,
        segment: 'HEAVY',
        aliases: ['line pump', 'trailer pump', 'concrete pump'],
        useCases: ['Slab pouring at height', 'Basement raft', 'House slab'],
        brands: ['Schwing Stetter', 'Putzmeister', 'Sany'],
        rental: rent({
          dailyInr: 12000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
          mobilisationNote: 'Pipes charged per metre. Usually ₹70 - 100 per cum pumped.',
        }),
        specs: { outputM3PerHour: 40, maxVerticalHeightM: 80, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Boom Pump (Truck-Mounted)',
        slug: 'concrete-boom-pump',
        description:
          'Self-propelled pump with boom for high-rise and large-area concrete placement.',
        displayOrder: 3,
        segment: 'HEAVY',
        aliases: ['boom placer', 'RMC boom pump', 'concrete boom'],
        useCases: ['High-rise columns/slabs', 'Large raft foundations'],
        brands: ['Schwing Stetter', 'Putzmeister', 'Sany', 'Zoomlion'],
        rental: rent({
          dailyInr: 25000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { boomReachVerticalM: 36, outputM3PerHour: 120, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Vibratory Road Roller (Single Drum 8-10 T)',
        slug: 'vibratory-road-roller',
        description: 'Heavy roller for compacting soil, murrum, GSB and WBM base layers.',
        displayOrder: 4,
        segment: 'HEAVY',
        aliases: ['vibro roller', 'road roller', 'soil compactor', 'roller 8 ton'],
        useCases: ['Road base', 'Plot compaction', 'Embankment'],
        brands: ['Bomag', 'Ammann', 'BEML', 'Escorts', 'Dynapac'],
        rental: rent({
          hourlyInr: 1200,
          dailyInr: 9000,
          monthlyInr: 190000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { operatingWeightTonnes: 10, drumWidthMm: 2130, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Tandem / Double Drum Roller (3-4 T)',
        slug: 'tandem-roller',
        description: 'Small double-drum roller for asphalt patching, internal roads and driveways.',
        displayOrder: 5,
        segment: 'LIGHT',
        aliases: ['mini roller', 'asphalt roller', 'tandem roller'],
        useCases: ['Driveway asphalt', 'Society roads', 'Patchwork'],
        brands: ['Bomag', 'Ammann', 'Escorts'],
        rental: rent({
          dailyInr: 5000,
          monthlyInr: 110000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { operatingWeightTonnes: 3.5, drumWidthMm: 1000, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Pneumatic Tyre Roller (PTR)',
        slug: 'pneumatic-tyre-roller',
        description: 'Rubber-tyre roller for finishing and sealing asphalt surfaces.',
        displayOrder: 6,
        segment: 'HEAVY',
        aliases: ['PTR', 'rubber roller'],
        useCases: ['Bituminous finishing', 'Highway surfacing'],
        brands: ['Escorts', 'Bomag', 'Hamm'],
        rental: rent({
          dailyInr: 10000,
          monthlyInr: 220000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { operatingWeightTonnes: 16, numberOfTires: 9, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Mobile Batching Plant (30 - 60 cum/hr)',
        slug: 'mobile-batching-plant',
        description:
          'On-site concrete plant for projects needing continuous, high-volume concrete.',
        displayOrder: 7,
        segment: 'HEAVY',
        aliases: ['RMC plant', 'batching plant', 'concrete plant'],
        useCases: ['Highway projects', 'Large residential townships', 'Dam/bridge work'],
        brands: ['Schwing Stetter', 'Ammann', 'Apollo', 'Techno'],
        rental: rent({
          monthlyInr: 450000,
          minBooking: '3 months',
          operatorIncluded: false,
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 500000,
        }),
        specs: { capacityM3PerHour: 60, aggregateBins: 4, controlSystem: 'Automated PLC' },
      }),
      machine({
        name: 'Power Trowel (Floor Finishing Machine)',
        slug: 'power-trowel',
        description:
          'Rotary trowel for smooth, level finishing of industrial, warehouse and parking floors.',
        displayOrder: 8,
        segment: 'LIGHT',
        aliases: ['floor finisher', 'trowel machine', 'helicopter machine', 'floor polishing'],
        useCases: ['Warehouse flooring', 'Parking floors', 'Industrial shed floor'],
        brands: ['Wacker Neuson', 'Honda', 'Local OEM'],
        rental: rent({
          dailyInr: 1500,
          weeklyInr: 8000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 6000,
        }),
        specs: { bladeDiameterMm: 900, power: 'Petrol 5.5 HP' },
      }),
    ],
  },

  // ───────────────────────── 5. ROAD & PAVING ─────────────────────────
  {
    name: 'Road Construction & Paving',
    slug: 'road-construction-and-paving',
    description:
      'Pavers, milling machines, sprayers and road-marking equipment for highways, city and village roads.',
    iconUrl: icon('paving'),
    imageUrl: img('cat-paving'),
    displayOrder: 5,
    machines: [
      machine({
        name: 'Asphalt Paver (Wheeled / Tracked)',
        slug: 'asphalt-paver',
        description: 'Lays smooth hot-mix bituminous layers on roads, parking and runways.',
        displayOrder: 1,
        segment: 'HEAVY',
        aliases: ['paver finisher', 'sensor paver', 'bitumen paver'],
        useCases: ['Highway resurfacing', 'City roads', 'Industrial yards'],
        brands: ['Vogele', 'Dynapac', 'Apollo', 'Ammann'],
        rental: rent({
          dailyInr: 22000,
          monthlyInr: 520000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { pavingWidthMaxM: 7, pavingCapacityTonnesPerHour: 500, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Cold Milling Machine',
        slug: 'cold-milling-machine',
        description: 'Removes old asphalt layers before resurfacing.',
        displayOrder: 2,
        segment: 'HEAVY',
        aliases: ['road planer', 'milling machine'],
        useCases: ['Road resurfacing prep', 'Pothole level correction'],
        brands: ['Wirtgen', 'Bomag', 'Dynapac'],
        rental: rent({
          dailyInr: 45000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { millingWidthMm: 1000, millingDepthMm: 320, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Bitumen Sprayer (Pressure Distributor)',
        slug: 'bitumen-sprayer',
        description: 'Sprays tack coat and prime coat on road surfaces before paving.',
        displayOrder: 3,
        segment: 'HEAVY',
        aliases: ['bitumen distributor', 'tack coat sprayer'],
        useCases: ['Tack coat', 'Prime coat'],
        brands: ['Local OEM', 'Apollo'],
        rental: rent({
          dailyInr: 9000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { tankCapacityL: 6000, sprayBarWidthM: 4 },
      }),
      machine({
        name: 'Road Marking Machine (Thermoplastic)',
        slug: 'road-marking-machine',
        description: 'Paints lane markings, parking bays and speed breaker stripes.',
        displayOrder: 4,
        segment: 'OTHER',
        aliases: ['line marking machine', 'road paint machine', 'parking line machine'],
        useCases: ['Road lanes', 'Parking lots', 'Factory floor marking'],
        brands: ['Graco', 'Hofmann', 'Local OEM'],
        rental: rent({
          dailyInr: 3500,
          weeklyInr: 18000,
          minBooking: '1 day',
          operatorIncluded: false,
          fuelPolicy: 'DRY',
          securityDepositInr: 10000,
        }),
        specs: { type: 'Cold paint / Thermoplastic', lineWidthMm: '100 - 300' },
      }),
      machine({
        name: 'Hot Mix Plant (Drum Mix, 60-120 TPH)',
        slug: 'hot-mix-plant',
        description: 'Produces hot-mix asphalt for road projects. Typically contract-based rental.',
        displayOrder: 5,
        segment: 'HEAVY',
        aliases: ['HMP', 'asphalt plant', 'bitumen plant'],
        useCases: ['Highway / state road projects'],
        brands: ['Apollo', 'Ammann', 'Marini'],
        rental: rent({
          monthlyInr: 600000,
          minBooking: '3 months',
          operatorIncluded: false,
          fuelPolicy: 'DRY',
          securityDepositInr: 1000000,
        }),
        specs: { capacityTph: 90, fuelType: 'Diesel / FO' },
      }),
    ],
  },

  // ───────────────────────── 6. DRILLING & DEMOLITION ─────────────────────────
  {
    name: 'Drilling, Piling & Demolition',
    slug: 'drilling-piling-demolition',
    description:
      'Borewell rigs, piling rigs, HDD and demolition tools for foundations, water and utilities.',
    iconUrl: icon('drilling'),
    imageUrl: img('cat-drilling'),
    displayOrder: 6,
    machines: [
      machine({
        name: 'Borewell Drilling Rig (Truck-Mounted)',
        slug: 'borewell-drilling-rig',
        description: 'DTH rig for borewells up to 300+ m. Priced per foot in most Indian cities.',
        displayOrder: 1,
        segment: 'HEAVY',
        aliases: ['borewell machine', 'boring gaadi', 'DTH rig', 'tubewell rig'],
        useCases: ['Residential borewell', 'Agriculture borewell', 'Industrial water'],
        brands: ['Local OEM', 'Atlas Copco', 'Ingersoll Rand'],
        rental: rent({
          perTripInr: 0,
          minBooking: '1 job',
          operatorIncluded: true,
          fuelPolicy: 'WET',
          mobilisationNote: 'Typically ₹70-140 per ft (6.5" casing extra). Quote after site visit.',
        }),
        specs: { pricingUnit: 'INR per foot', maxDepthM: 300, boreDiameterInch: '6.5 - 8' },
      }),
      machine({
        name: 'Rotary Piling Rig',
        slug: 'rotary-piling-rig',
        description: 'Drills bored cast-in-situ piles for bridges, high-rises and metro projects.',
        displayOrder: 2,
        segment: 'HEAVY',
        aliases: ['piling machine', 'pile driver', 'bored pile rig'],
        useCases: ['High-rise foundation', 'Bridges', 'Metro piers'],
        brands: ['Soilmec', 'Casagrande', 'Sany', 'Bauer'],
        rental: rent({
          dailyInr: 45000,
          monthlyInr: 1100000,
          minBooking: '1 week',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { maxDrillingDepthM: 60, maxDiameterMm: 1800 },
      }),
      machine({
        name: 'Horizontal Directional Drilling (HDD) Rig',
        slug: 'hdd-rig',
        description:
          'Trenchless drilling for laying pipes, gas lines and fibre under roads and rivers.',
        displayOrder: 3,
        segment: 'HEAVY',
        aliases: ['HDD machine', 'trenchless boring'],
        useCases: ['OFC / telecom duct', 'Gas pipeline', 'Water lines under roads'],
        brands: ['Vermeer', 'Ditch Witch', 'Toro'],
        rental: rent({
          dailyInr: 22000,
          monthlyInr: 550000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { pullbackForceKN: 200, maxDrillDistanceM: 300 },
      }),
      machine({
        name: 'Hydraulic Rock Breaker (Excavator Attachment)',
        slug: 'hydraulic-rock-breaker',
        description:
          'Breaks rock and RCC when mounted on excavators. Rented as machine + attachment.',
        displayOrder: 4,
        segment: 'HEAVY',
        aliases: ['hammer attachment', 'rock hammer'],
        useCases: ['Rock excavation', 'Bridge pier demolition'],
        brands: ['Indeco', 'Montabert', 'Furukawa', 'Soosan'],
        rental: rent({
          dailyInr: 4500,
          minBooking: '1 day',
          operatorIncluded: false,
          fuelPolicy: 'NA',
          securityDepositInr: 25000,
        }),
        specs: {
          operatingWeightKg: 1800,
          impactRateBpm: 500,
          carrierExcavatorWeightTonnes: '20 - 28',
        },
      }),
      machine({
        name: 'Diamond Wire Saw / Wall Saw',
        slug: 'diamond-wall-saw',
        description:
          'Precision cutting of thick RCC walls, slabs and bridge parts without vibration.',
        displayOrder: 5,
        segment: 'OTHER',
        aliases: ['wall saw', 'wire saw', 'concrete cutting'],
        useCases: ['Opening in RCC wall', 'Slab cutting', 'Heritage structure alteration'],
        brands: ['Hilti', 'Husqvarna'],
        rental: rent({
          perTripInr: 0,
          minBooking: '1 job',
          operatorIncluded: true,
          fuelPolicy: 'ELECTRIC',
          mobilisationNote: 'Typically priced per running ft / sq ft cut.',
        }),
        specs: { pricingUnit: 'INR per running ft', maxBladeDiameterMm: 1200 },
      }),
    ],
  },

  // ───────────────────────── 7. TRANSPORT ─────────────────────────
  {
    name: 'Transport & Hauling',
    slug: 'transport-and-hauling',
    description:
      'Mini trucks, tippers, tankers, tractors and trailers for moving material and equipment.',
    iconUrl: icon('transport'),
    imageUrl: img('cat-transport'),
    displayOrder: 7,
    machines: [
      machine({
        name: 'Mini Tipper (Tata Ace / Chhota Hathi)',
        slug: 'mini-tipper-ace',
        description:
          'Small tipper for sand, bricks, debris and soil in narrow lanes and house construction.',
        displayOrder: 1,
        segment: 'LIGHT',
        aliases: ['Tata Ace', 'chhota hathi', 'mini truck', 'mini tipper'],
        useCases: ['Debris removal', 'Sand/bricks delivery', 'Small house work'],
        brands: ['Tata Ace', 'Mahindra Jeeto', 'Ashok Leyland Dost'],
        rental: rent({
          dailyInr: 2500,
          perTripInr: 700,
          monthlyInr: 55000,
          minBooking: '1 trip',
          operatorIncluded: true,
          fuelPolicy: 'WET',
        }),
        specs: { payloadKg: 750, bodyVolumeM3: 1.0, fuelType: 'Diesel / CNG' },
      }),
      machine({
        name: 'Tractor with Trolley / Tipping Trolley',
        slug: 'tractor-trolley-tipper',
        description:
          'Common for sand, earth, bricks and farm produce. Easy for rural and semi-urban projects.',
        displayOrder: 2,
        segment: 'LIGHT',
        aliases: ['tractor trolley', 'tractor tipper', 'trolley'],
        useCases: ['Earth/sand carrying', 'Farm transport', 'Debris removal'],
        brands: ['Mahindra', 'Swaraj', 'Sonalika', 'John Deere'],
        rental: rent({
          dailyInr: 3500,
          perTripInr: 900,
          monthlyInr: 75000,
          minBooking: '1 trip',
          operatorIncluded: true,
          fuelPolicy: 'WET',
        }),
        specs: { trolleyCapacityTonnes: 5, tractorPowerHp: 45 },
      }),
      machine({
        name: 'Tipper Truck (10 Wheeler / 16 Ton)',
        slug: 'tipper-10-wheeler',
        description:
          'Standard heavy tipper for sand, aggregate, boulders, fly ash and excavated soil.',
        displayOrder: 3,
        segment: 'HEAVY',
        aliases: ['dumper', '10 wheeler', 'hyva', 'tipper'],
        useCases: ['Sand/aggregate supply', 'Excavated soil removal', 'Road projects'],
        brands: ['Tata', 'BharatBenz', 'Ashok Leyland', 'Eicher'],
        rental: rent({
          dailyInr: 9000,
          monthlyInr: 210000,
          minBooking: '1 day',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: {
          payloadTonnes: 16,
          bodyVolumeM3: 10,
          wheelConfiguration: '6x4',
          fuelType: 'Diesel',
        },
      }),
      machine({
        name: 'Water Tanker (6,000 - 12,000 L)',
        slug: 'water-tanker',
        description: 'Water supply for site curing, dust suppression and household needs.',
        displayOrder: 4,
        segment: 'LIGHT',
        aliases: ['pani tanker', 'water tanker'],
        useCases: ['Construction water', 'Dust suppression', 'Society emergency supply'],
        brands: ['Tata', 'Eicher', 'Local fabricators'],
        rental: rent({
          perTripInr: 1200,
          dailyInr: 4500,
          minBooking: '1 trip',
          operatorIncluded: true,
          fuelPolicy: 'WET',
        }),
        specs: { tankCapacityL: 10000, fuelType: 'Diesel', pumpIncluded: true },
      }),
      machine({
        name: 'Lowbed Trailer (Machinery Transport)',
        slug: 'lowbed-trailer',
        description:
          'Transports excavators, dozers and cranes between sites. Priced per km or per trip.',
        displayOrder: 5,
        segment: 'HEAVY',
        aliases: ['lowbed', 'low bed trailer', 'machine carrier', 'trailer'],
        useCases: ['Shifting JCB/excavator', 'Crane transport'],
        brands: ['Tata', 'BharatBenz', 'Local OEM'],
        rental: rent({
          perTripInr: 8000,
          minBooking: '1 trip',
          operatorIncluded: true,
          fuelPolicy: 'WET',
          mobilisationNote:
            'Typically ₹45-90 per km based on machine weight. Permit charges extra.',
        }),
        specs: { payloadTonnes: 40, deckHeightMm: 900, axles: 4 },
      }),
      machine({
        name: 'Truck for Goods (14 - 20 ft)',
        slug: 'goods-truck-14-20ft',
        description:
          'Open or closed body truck for shifting building material, cement bags and household goods.',
        displayOrder: 6,
        segment: 'LIGHT',
        aliases: ['ashok leyland dost', 'tata 407', 'canter', 'goods carrier'],
        useCases: ['Material delivery', 'Shifting', 'Inter-city transport'],
        brands: ['Tata 407', 'Eicher Pro', 'Mahindra Bolero Pickup'],
        rental: rent({
          perTripInr: 2500,
          dailyInr: 5000,
          minBooking: '1 trip',
          operatorIncluded: true,
          fuelPolicy: 'WET',
        }),
        specs: { payloadTonnes: 3.5, bodyLengthFt: 17 },
      }),
    ],
  },

  // ───────────────────────── 8. POWER & UTILITIES ─────────────────────────
  {
    name: 'Power, Pumps & Utilities',
    slug: 'power-and-utilities',
    description:
      'Generators, compressors, pumps and lighting to keep sites, events and homes running.',
    iconUrl: icon('utilities'),
    imageUrl: img('cat-utilities'),
    displayOrder: 8,
    machines: [
      machine({
        name: 'Diesel Generator (5 - 15 kVA)',
        slug: 'diesel-generator-small',
        description: 'Portable silent generator for small shops, events, homes and site tools.',
        displayOrder: 1,
        segment: 'LIGHT',
        aliases: ['genset', 'DG set', 'generator', 'inverter generator'],
        useCases: ['Small events', 'Home backup', 'Site tools', 'Shop power cut'],
        brands: ['Kirloskar', 'Cummins', 'Mahindra Powerol', 'Honda'],
        rental: rent({
          dailyInr: 1800,
          weeklyInr: 9500,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 10000,
        }),
        specs: { primePowerKVA: 10, phase: 'Single / 3', silent: true },
      }),
      machine({
        name: 'Diesel Generator (62.5 - 125 kVA)',
        slug: 'diesel-generator-medium',
        description:
          'Silent canopy generator for weddings, factories, malls and construction sites.',
        displayOrder: 2,
        segment: 'HEAVY',
        aliases: ['62.5 kVA genset', '125 kVA DG', 'wedding generator'],
        useCases: ['Weddings/events', 'Construction site', 'Factory backup'],
        brands: ['Cummins', 'Kirloskar', 'Mahindra Powerol', 'Ashok Leyland'],
        rental: rent({
          dailyInr: 4500,
          weeklyInr: 26000,
          monthlyInr: 85000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 40000,
        }),
        specs: { primePowerKVA: 82.5, voltageV: '415V', frequencyHz: 50, fuelTankL: 200 },
      }),
      machine({
        name: 'Diesel Generator (250 - 500 kVA)',
        slug: 'diesel-generator-large',
        description:
          'Large prime/standby power for hospitals, plants, towers and big construction sites.',
        displayOrder: 3,
        segment: 'HEAVY',
        aliases: ['250 kVA DG', '500 kVA genset'],
        useCases: ['Hospital/plant backup', 'Large projects', 'Data centre standby'],
        brands: ['Cummins', 'Caterpillar', 'Kirloskar'],
        rental: rent({
          dailyInr: 12000,
          monthlyInr: 280000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 150000,
        }),
        specs: { primePowerKVA: 250, voltageV: '415V', frequencyHz: 50, soundLevelDbAt7M: 68 },
      }),
      machine({
        name: 'Air Compressor (Diesel Screw, 185 - 750 CFM)',
        slug: 'diesel-air-compressor',
        description: 'For sandblasting, pneumatic tools, rock drilling and pressure testing.',
        displayOrder: 4,
        segment: 'HEAVY',
        aliases: ['compressor', 'screw compressor', 'jackhammer compressor'],
        useCases: ['Sandblasting', 'Rock drilling', 'Pneumatic breaker'],
        brands: ['Atlas Copco', 'Ingersoll Rand', 'Kirloskar'],
        rental: rent({
          dailyInr: 5500,
          monthlyInr: 130000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 30000,
        }),
        specs: { freeAirDeliveryCfm: 400, workingPressureBar: 8.6 },
      }),
      machine({
        name: 'Submersible Dewatering Pump',
        slug: 'dewatering-pump-submersible',
        description: 'Removes water from foundations, basements, borewells and waterlogged areas.',
        displayOrder: 5,
        segment: 'LIGHT',
        aliases: ['dewatering pump', 'submersible', 'water pump', 'motor pump'],
        useCases: ['Basement pumping', 'Flood clearing', 'Foundation dewatering'],
        brands: ['Kirloskar', 'Crompton', 'KSB', 'CRI'],
        rental: rent({
          dailyInr: 800,
          weeklyInr: 4500,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 5000,
        }),
        specs: { powerHp: 5, flowM3PerHour: 60, headM: 25, solidsPassMm: 20 },
      }),
      machine({
        name: 'Diesel Water Pump (Self-Priming)',
        slug: 'diesel-water-pump',
        description: 'Engine-driven pump for farms, flooding and sites without electricity.',
        displayOrder: 6,
        segment: 'LIGHT',
        aliases: ['diesel pump', 'petrol pump set', 'irrigation pump'],
        useCases: ['Irrigation', 'Flood relief', 'Sites without power'],
        brands: ['Kirloskar', 'Honda', 'Greaves'],
        rental: rent({
          dailyInr: 1000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 5000,
        }),
        specs: { suctionDischargeInch: '3 x 3', flowM3PerHour: 60, fuelType: 'Diesel' },
      }),
      machine({
        name: 'Mobile Light Tower (LED)',
        slug: 'mobile-light-tower',
        description:
          'Telescopic mast with floodlights for night-time construction, events and emergency work.',
        displayOrder: 7,
        segment: 'OTHER',
        aliases: ['flood light tower', 'night work light', 'balloon light'],
        useCases: ['Night shifts', 'Events', 'Road work', 'Disaster relief'],
        brands: ['Atlas Copco', 'Generac', 'Local OEM'],
        rental: rent({
          dailyInr: 2500,
          weeklyInr: 14000,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 15000,
        }),
        specs: { mastHeightM: 9, lumens: 180000, runtimeHours: 40 },
      }),
      machine({
        name: 'Welding Machine (Inverter / Generator)',
        slug: 'welding-machine',
        description:
          'Arc welding for fabrication, gates, grills, structural steel and site repairs.',
        displayOrder: 8,
        segment: 'LIGHT',
        aliases: ['welding set', 'arc welding', 'welder'],
        useCases: ['Gate/grill fabrication', 'Structural steel', 'Site repair'],
        brands: ['ESAB', 'Lincoln', 'Ador Welding'],
        rental: rent({
          dailyInr: 600,
          weeklyInr: 3000,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 3000,
        }),
        specs: { currentA: '200 - 400', phase: 'Single / 3' },
      }),
    ],
  },

  // ───────────────────────── 9. OTHER: SITE SUPPORT, FARM & EVENTS ─────────────────────────
  {
    name: 'Site Support, Farm & Others',
    slug: 'site-support-farm-others',
    description:
      'Portable cabins, toilets, farm tractors, rotavators, garden and cleaning equipment for sites, farms and events.',
    iconUrl: icon('others'),
    imageUrl: img('cat-others'),
    displayOrder: 9,
    machines: [
      machine({
        name: 'Portable Site Office Cabin',
        slug: 'portable-site-cabin',
        description:
          'Prefab office or storeroom cabin for construction sites, with optional AC and furniture.',
        displayOrder: 1,
        segment: 'OTHER',
        aliases: ['porta cabin', 'site office', 'prefab cabin', 'container office'],
        useCases: ['Site office', 'Material store', 'Labour accommodation'],
        brands: ['Local fabricators'],
        rental: rent({
          monthlyInr: 9000,
          minBooking: '1 month',
          securityDepositInr: 15000,
          mobilisationNote: 'Transport extra; AC +₹3,500/month.',
        }),
        specs: { sizeFt: '20 x 8', material: 'PUF / GI panel', electricalFitted: true },
      }),
      machine({
        name: 'Portable Toilet (Mobile Toilet Unit)',
        slug: 'portable-toilet',
        description: 'Clean, movable toilets for construction sites, weddings, events and fairs.',
        displayOrder: 2,
        segment: 'OTHER',
        aliases: ['mobile toilet', 'portable washroom', 'event toilet'],
        useCases: ['Construction site', 'Weddings', 'Events', 'Fairs'],
        brands: ['Sulabh-style local suppliers', 'Local OEM'],
        rental: rent({
          dailyInr: 600,
          monthlyInr: 6500,
          minBooking: '1 day',
          securityDepositInr: 3000,
        }),
        specs: { type: 'FRP', waterTankL: 500 },
      }),
      machine({
        name: 'Safety Barricades & Barriers',
        slug: 'safety-barricades',
        description:
          'Road barricades, caution tapes, cones and fencing for site safety and event crowd control.',
        displayOrder: 3,
        segment: 'OTHER',
        aliases: ['barricade', 'traffic cones', 'road barrier', 'site fencing'],
        useCases: ['Road work', 'Events', 'Crowd management'],
        brands: ['Local suppliers'],
        rental: rent({
          dailyInr: 15,
          monthlyInr: 220,
          minBooking: '3 days',
          securityDepositInr: 2000,
          mobilisationNote: 'Price per barricade/cone.',
        }),
        specs: { pricingUnit: 'Per piece', length_m: 2 },
      }),
      machine({
        name: 'Farm Tractor (45 - 60 HP)',
        slug: 'farm-tractor-45-60hp',
        description:
          'For ploughing, levelling, transport and farm operations. Rental with or without implements.',
        displayOrder: 4,
        segment: 'OTHER',
        aliases: ['tractor', 'kheti tractor', 'Mahindra tractor'],
        useCases: ['Ploughing', 'Land levelling', 'Haulage', 'Sowing'],
        brands: ['Mahindra', 'Swaraj', 'John Deere', 'Sonalika', 'TAFE'],
        rental: rent({
          hourlyInr: 700,
          dailyInr: 4500,
          minBooking: '4 hours',
          operatorIncluded: true,
          fuelPolicy: 'DRY',
        }),
        specs: { enginePowerHp: 50, driveType: '2WD / 4WD', fuelType: 'Diesel' },
      }),
      machine({
        name: 'Rotavator / Cultivator Attachment',
        slug: 'rotavator-attachment',
        description:
          'Prepares soil for farming and landscaping; breaks hard soil and mixes manure.',
        displayOrder: 5,
        segment: 'OTHER',
        aliases: ['rotavator', 'rotary tiller', 'cultivator'],
        useCases: ['Seedbed preparation', 'Garden/lawn prep'],
        brands: ['Mahindra', 'Shaktiman', 'Fieldking'],
        rental: rent({
          hourlyInr: 500,
          dailyInr: 3200,
          minBooking: '4 hours',
          operatorIncluded: false,
          securityDepositInr: 8000,
        }),
        specs: { workingWidthM: 1.8, requiredTractorHp: '40 - 55' },
      }),
      machine({
        name: 'Paddy / Wheat Combine Harvester',
        slug: 'combine-harvester',
        description:
          'Harvesting machine for wheat, paddy and soybean, rented per acre or per hour during season.',
        displayOrder: 6,
        segment: 'OTHER',
        aliases: ['harvester', 'combine', 'katai machine'],
        useCases: ['Wheat/paddy harvesting'],
        brands: ['Kubota', 'Claas', 'Preet', 'John Deere'],
        rental: rent({
          hourlyInr: 2200,
          minBooking: '2 hours',
          operatorIncluded: true,
          fuelPolicy: 'WET',
          mobilisationNote: 'Often charged ₹1,400-2,200 per acre depending on region and crop.',
        }),
        specs: { pricingUnit: 'INR per acre / hour', cutterWidthM: 4.2 },
      }),
      machine({
        name: 'Grass Cutter / Brush Cutter',
        slug: 'brush-cutter',
        description: 'Petrol brush cutter for gardens, lawns, farm bunds and site clearing.',
        displayOrder: 7,
        segment: 'LIGHT',
        aliases: ['grass cutter', 'ghaas katne wali machine', 'weed cutter'],
        useCases: ['Lawn maintenance', 'Plot clearing', 'Farm bunds'],
        brands: ['Stihl', 'Honda', 'Husqvarna'],
        rental: rent({
          dailyInr: 500,
          weeklyInr: 2500,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 3000,
        }),
        specs: { engineCc: 43, type: 'Petrol 2-stroke' },
      }),
      machine({
        name: 'Tree Trimmer / Chainsaw',
        slug: 'chainsaw',
        description: 'Cuts branches and trees; for societies, farms and clearing sites.',
        displayOrder: 8,
        segment: 'LIGHT',
        aliases: ['aari machine', 'wood cutter', 'tree cutter'],
        useCases: ['Tree trimming', 'Fallen tree removal', 'Firewood'],
        brands: ['Stihl', 'Husqvarna', 'Makita'],
        rental: rent({
          dailyInr: 700,
          weeklyInr: 3500,
          minBooking: '1 day',
          fuelPolicy: 'DRY',
          securityDepositInr: 4000,
        }),
        specs: { barLengthInch: 18, engineCc: 45 },
      }),
      machine({
        name: 'Industrial Vacuum / Floor Scrubber',
        slug: 'floor-scrubber',
        description:
          'Deep-cleans floors after construction, for malls, warehouses, hospitals and offices.',
        displayOrder: 9,
        segment: 'OTHER',
        aliases: ['floor scrubber', 'post construction cleaning machine', 'industrial vacuum'],
        useCases: ['Post-construction cleaning', 'Warehouse cleaning', 'Mall/hospital cleaning'],
        brands: ['Karcher', 'Nilfisk', 'Eureka Forbes'],
        rental: rent({
          dailyInr: 1800,
          weeklyInr: 9000,
          minBooking: '1 day',
          fuelPolicy: 'ELECTRIC',
          securityDepositInr: 8000,
        }),
        specs: { cleaningWidthMm: 510, tankCapacityL: 50 },
      }),
    ],
  },
];

export async function seedMachines(prisma: PrismaClient) {
  let seededCategoryCount = 0;
  let seededMachineCount = 0;

  for (const catData of CONSTRUCTION_CATEGORIES_AND_MACHINES) {
    const category = await prisma.category.upsert({
      where: { slug: catData.slug },
      update: {
        name: catData.name,
        description: catData.description,
        iconUrl: catData.iconUrl,
        imageUrl: catData.imageUrl,
        displayOrder: catData.displayOrder,
      },
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        iconUrl: catData.iconUrl,
        imageUrl: catData.imageUrl,
        displayOrder: catData.displayOrder,
      },
    });

    seededCategoryCount += 1;

    for (const machineData of catData.machines) {
      await prisma.machine.upsert({
        where: { slug: machineData.slug },
        update: {
          categoryId: category.id,
          name: machineData.name,
          description: machineData.description,
          imageUrl: machineData.imageUrl,
          displayOrder: machineData.displayOrder,
          specifications: machineData.specifications as any,
        },
        create: {
          categoryId: category.id,
          name: machineData.name,
          slug: machineData.slug,
          description: machineData.description,
          imageUrl: machineData.imageUrl,
          displayOrder: machineData.displayOrder,
          specifications: machineData.specifications as any,
        },
      });

      seededMachineCount += 1;
    }
  }

  return { seededCategoryCount, seededMachineCount };
}
