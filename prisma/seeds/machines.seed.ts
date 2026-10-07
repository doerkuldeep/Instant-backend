import { PrismaClient } from '@prisma/client';

export interface ConstructionCategorySeed {
  name: string;
  slug: string;
  description: string;
  iconUrl?: string;
  imageUrl?: string;
  bannerUrl?: string;
  mobileImageUrl?: string;
  webImageUrl?: string;
  displayOrder: number;
  machines: Array<{
    name: string;
    slug: string;
    description: string;
    imageUrl?: string;
    bannerUrl?: string;
    mobileImageUrl?: string;
    webImageUrl?: string;
    displayOrder: number;
    specifications: Record<string, string | number | boolean>;
  }>;
}

export const CONSTRUCTION_CATEGORIES_AND_MACHINES: ConstructionCategorySeed[] = [
  {
    name: 'Earthmoving Equipment',
    slug: 'earthmoving-equipment',
    description:
      'Heavy machinery used for moving massive quantities of earth, grading soil, digging foundations, and trenching.',
    iconUrl: 'https://cdn.example.com/icons/earthmoving.svg',
    imageUrl: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755',
    bannerUrl:
      'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl:
      'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=600&q=80',
    webImageUrl:
      'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 1,
    machines: [
      {
        name: 'Crawler Excavator',
        slug: 'crawler-excavator',
        description:
          'Heavy-duty tracked excavator for deep trenching, heavy excavation, and foundation preparation.',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12',
        bannerUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 1,
        specifications: {
          operatingWeightKg: 21500,
          enginePowerHp: 168,
          bucketCapacityM3: 1.2,
          maxDiggingDepthM: 6.7,
          fuelType: 'Diesel',
          trackType: 'Steel Track',
        },
      },
      {
        name: 'Backhoe Loader',
        slug: 'backhoe-loader',
        description:
          'Versatile multi-purpose vehicle with front-end loader bucket and rear excavator arm, ideal for urban and utility projects.',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f',
        bannerUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 2,
        specifications: {
          operatingWeightKg: 8500,
          enginePowerHp: 95,
          loaderBucketCapacityM3: 1.1,
          backhoeBucketCapacityM3: 0.26,
          maxDiggingDepthM: 4.8,
          fuelType: 'Diesel',
          driveType: '4WD',
        },
      },
      {
        name: 'Bulldozer',
        slug: 'bulldozer',
        description:
          'Powerful tracked crawler equipped with a heavy front push blade for clearing, leveling, and site grading.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6',
        bannerUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 3,
        specifications: {
          operatingWeightKg: 18200,
          enginePowerHp: 215,
          bladeCapacityM3: 4.8,
          bladeType: 'Semi-U Blade with Ripper',
          groundPressureKPa: 52,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Wheel Loader',
        slug: 'wheel-loader',
        description:
          'High-capacity wheeled front loader for fast stockpiling, aggregate transfer, and truck loading.',
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b',
        bannerUrl:
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 4,
        specifications: {
          operatingWeightKg: 14500,
          enginePowerHp: 180,
          bucketCapacityM3: 2.5,
          breakoutForceKN: 135,
          dumpClearanceM: 3.1,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Skid Steer Loader',
        slug: 'skid-steer-loader',
        description:
          'Compact, zero-turn agile utility machine supporting diverse attachments for demolition, grading, and material handling in tight spaces.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
        bannerUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 5,
        specifications: {
          operatingWeightKg: 3600,
          enginePowerHp: 74,
          ratedOperatingCapacityKg: 1250,
          tippingLoadKg: 2500,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Motor Grader',
        slug: 'motor-grader',
        description:
          'Precision grading machine fitted with a long adjustable center blade for high-precision roadway base finishing and ditch building.',
        imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a',
        bannerUrl:
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 6,
        specifications: {
          operatingWeightKg: 16500,
          enginePowerHp: 190,
          bladeWidthM: 3.7,
          maxBladeCutDepthMm: 710,
          maxSpeedKmh: 45,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Mini Excavator',
        slug: 'mini-excavator',
        description:
          'Compact crawler excavator with zero tail swing designed for residential construction, tight utility trenching, and landscaping.',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        bannerUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 7,
        specifications: {
          operatingWeightKg: 3500,
          enginePowerHp: 25,
          bucketCapacityM3: 0.1,
          maxDiggingDepthM: 3.1,
          fuelType: 'Diesel',
          zeroTailSwing: true,
        },
      },
      {
        name: 'Trencher',
        slug: 'trencher',
        description:
          'Continuous chain/wheel trenching machine for underground pipeline laying, electrical conduit installation, and drainage channels.',
        imageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c',
        bannerUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 8,
        specifications: {
          operatingWeightKg: 7800,
          enginePowerHp: 120,
          maxTrenchDepthM: 2.5,
          maxTrenchWidthMm: 450,
          fuelType: 'Diesel',
        },
      },
    ],
  },
  {
    name: 'Lifting & Material Handling',
    slug: 'lifting-and-material-handling',
    description:
      'Cranes, telehandlers, manlifts, and high-altitude equipment for vertical hoisting and site logistics.',
    iconUrl: 'https://cdn.example.com/icons/lifting.svg',
    imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122',
    bannerUrl:
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl:
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    webImageUrl:
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 2,
    machines: [
      {
        name: 'Mobile Hydraulic Crane',
        slug: 'mobile-hydraulic-crane',
        description:
          'All-terrain mobile telescopic crane capable of traveling on public roads and executing heavy lifting operations at high radii.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6',
        bannerUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 1,
        specifications: {
          maxLiftingCapacityTonnes: 50,
          maxBoomLengthM: 40,
          maxTipHeightM: 52,
          enginePowerHp: 280,
          axleConfiguration: '6x6x6',
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Tower Crane',
        slug: 'tower-crane',
        description:
          'Tall stationary balance crane providing optimal lifting height and heavy load coverage across high-rise building projects.',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        bannerUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 2,
        specifications: {
          maxLiftingCapacityTonnes: 12,
          jibLengthM: 65,
          tipLoadTonnes: 2.2,
          freestandingHeightM: 55,
          powerSupply: '400V 3-Phase Electric',
        },
      },
      {
        name: 'Crawler Crane',
        slug: 'crawler-crane',
        description:
          'Heavy lattice boom crane mounted on crawler tracks for high load stability and pick-and-carry capability on unprepared ground.',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12',
        bannerUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 3,
        specifications: {
          maxLiftingCapacityTonnes: 100,
          maxLatticeBoomLengthM: 70,
          operatingWeightTonnes: 98,
          fuelType: 'Diesel',
          pickAndCarryCapable: true,
        },
      },
      {
        name: 'Telehandler',
        slug: 'telehandler',
        description:
          'Telescopic handler merging rough-terrain forklift mobility with extended reach for multi-story material placement.',
        imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866',
        bannerUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 4,
        specifications: {
          maxLiftingCapacityKg: 4000,
          maxLiftHeightM: 17,
          maxForwardReachM: 12.5,
          enginePowerHp: 100,
          fuelType: 'Diesel',
          stabilizersEquipped: true,
        },
      },
      {
        name: 'Articulated Boom Lift',
        slug: 'articulated-boom-lift',
        description:
          'Mobile elevating work platform (cherry picker) with articulating joints to overcome obstacles at heights safely.',
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b',
        bannerUrl:
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 5,
        specifications: {
          workingHeightM: 20.5,
          platformHeightM: 18.5,
          horizontalReachM: 12.2,
          platformCapacityKg: 230,
          powerType: 'Diesel / Electric Hybrid',
        },
      },
      {
        name: 'Electric Scissor Lift',
        slug: 'electric-scissor-lift',
        description:
          'Vertical aerial work platform offering a wide deck and high platform capacity for electrical, HVAC, and ceiling installations.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
        bannerUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 6,
        specifications: {
          workingHeightM: 12,
          platformCapacityKg: 450,
          deckExtensionM: 1.2,
          powerType: 'Battery Electric 24V/48V',
          indoorOutdoorRated: true,
        },
      },
      {
        name: 'Rough Terrain Forklift',
        slug: 'rough-terrain-forklift',
        description:
          'Heavy industrial forklift with high ground clearance and deep tread pneumatic tires for moving pallets and lumber on mud/gravel.',
        imageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c',
        bannerUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 7,
        specifications: {
          liftCapacityKg: 5000,
          mastLiftHeightM: 4.5,
          enginePowerHp: 75,
          groundClearanceMm: 350,
          fuelType: 'Diesel',
        },
      },
    ],
  },
  {
    name: 'Concrete & Compaction Equipment',
    slug: 'concrete-and-compaction',
    description:
      'Equipment dedicated to mixing, delivering, pumping, finishing, and compacting concrete and structural foundations.',
    iconUrl: 'https://cdn.example.com/icons/concrete.svg',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6',
    bannerUrl:
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl:
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
    webImageUrl:
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 3,
    machines: [
      {
        name: 'Transit Concrete Mixer',
        slug: 'transit-concrete-mixer',
        description:
          'Commercial truck chassis equipped with a rotating mixing drum to transport ready-mix concrete without segregation.',
        imageUrl: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755',
        bannerUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 1,
        specifications: {
          drumCapacityM3: 7,
          drumDischargeSpeedRpm: 14,
          truckAxle: '6x4',
          enginePowerHp: 280,
          waterTankCapacityL: 450,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Truck-Mounted Concrete Boom Pump',
        slug: 'concrete-boom-pump',
        description:
          'High-output concrete pump with multi-section articulated placing boom for rapid pours on high-rise columns and decks.',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f',
        bannerUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 2,
        specifications: {
          boomReachVerticalM: 36,
          boomSections: 4,
          maxConcreteOutputM3PerHour: 160,
          maxConcretePressureBar: 85,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Vibratory Soil Compactor',
        slug: 'vibratory-soil-compactor',
        description:
          'Single smooth/padfoot drum roller generating high centrifugal force for compacting deep soil and aggregate subgrade layers.',
        imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a',
        bannerUrl:
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 3,
        specifications: {
          operatingWeightTonnes: 11,
          drumWidthMm: 2130,
          vibrationFrequencyHz: 33,
          centrifugalForceKN: 240,
          enginePowerHp: 130,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Tandem Asphalt Roller',
        slug: 'tandem-asphalt-roller',
        description:
          'Double-drum vibrating roller with integrated water sprayers designed for smooth asphalt compaction and roadway resurfacing.',
        imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866',
        bannerUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 4,
        specifications: {
          operatingWeightTonnes: 9.5,
          drumWidthMm: 1680,
          dualDrumVibration: true,
          waterTankCapacityL: 750,
          enginePowerHp: 95,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Reversible Plate Compactor',
        slug: 'reversible-plate-compactor',
        description:
          'Walk-behind compactor providing forward and reverse operation for compacting backfill in tight utility trenches and footings.',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
        bannerUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 5,
        specifications: {
          operatingWeightKg: 420,
          centrifugalForceKN: 55,
          plateWidthMm: 600,
          maxGradabilityPercent: 30,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Mobile Concrete Batching Plant',
        slug: 'mobile-concrete-batching-plant',
        description:
          'Pre-wired, compact mobile plant designed to precisely weigh, dose, and mix aggregates, cement, and water at on-site locations.',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        bannerUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 6,
        specifications: {
          capacityM3PerHour: 60,
          aggregateStorageBins: 4,
          mixerType: 'Twin Shaft Planetary Mixer',
          controlSystem: 'Fully Automated PLC',
          powerKw: 75,
        },
      },
    ],
  },
  {
    name: 'Road Construction & Paving',
    slug: 'road-construction-and-paving',
    description:
      'Specialized machinery for asphalt laying, road profiling, cold milling, and highway surface construction.',
    iconUrl: 'https://cdn.example.com/icons/paving.svg',
    imageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a',
    bannerUrl:
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl:
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
    webImageUrl:
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 4,
    machines: [
      {
        name: 'Tracked Asphalt Paver',
        slug: 'tracked-asphalt-paver',
        description:
          'High-precision tracked paver with heated screed for laying even bituminous asphalt layers on highways and airport runways.',
        imageUrl: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755',
        bannerUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 1,
        specifications: {
          pavingWidthMaxM: 9.0,
          pavingCapacityTonnesPerHour: 700,
          hopperCapacityTonnes: 14,
          screedHeating: 'Electric with Pulse Flow',
          enginePowerHp: 175,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Cold Milling Machine / Road Planer',
        slug: 'cold-milling-machine',
        description:
          'Machine equipped with a rotating cutting drum to mill out deteriorated asphalt or concrete pavement down to specified depth.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6',
        bannerUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 2,
        specifications: {
          millingWidthMm: 2000,
          millingDepthMm: 330,
          operatingWeightTonnes: 28,
          enginePowerHp: 450,
          conveyorDischargeHeightM: 4.8,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Bitumen Pressure Distributor',
        slug: 'bitumen-pressure-distributor',
        description:
          'Truck with insulated tank and computerized spray bar for spraying tack coat or prime coat emulsion at uniform pressure.',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f',
        bannerUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 3,
        specifications: {
          tankCapacityL: 6000,
          sprayBarWidthM: 4.2,
          heatingSystem: 'Diesel Burner with Automatic Temp Controller',
          truckChassis: '4x2 Heavy Duty',
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Pneumatic Tire Roller (PTR)',
        slug: 'pneumatic-tire-roller',
        description:
          'Multi-wheel rubber-tired compactor producing deep kneading action that seals voids and creates an impermeable asphalt surface.',
        imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866',
        bannerUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 4,
        specifications: {
          operatingWeightTonnes: 24,
          numberOfTires: 8,
          tirePressureBar: 7.5,
          compactionWidthMm: 2100,
          enginePowerHp: 110,
          fuelType: 'Diesel',
        },
      },
    ],
  },
  {
    name: 'Demolition & Foundation Drilling',
    slug: 'demolition-and-drilling',
    description:
      'Machines engineered for rock breaking, reinforced concrete demolition, deep foundation piling, and horizontal boring.',
    iconUrl: 'https://cdn.example.com/icons/demolition.svg',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12',
    bannerUrl:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    webImageUrl:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 5,
    machines: [
      {
        name: 'Hydraulic Rock Breaker (Heavy)',
        slug: 'hydraulic-rock-breaker',
        description:
          'Heavy impact percussion hammer mounted on excavators for fracturing bedrock, concrete footings, and bridge piers.',
        imageUrl: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755',
        bannerUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 1,
        specifications: {
          operatingWeightKg: 2800,
          impactRateBpm: 600,
          chiselDiameterMm: 165,
          operatingPressureBar: 180,
          carrierExcavatorWeightTonnes: '28 - 36',
        },
      },
      {
        name: 'Rotary Hydraulic Piling Rig',
        slug: 'rotary-piling-rig',
        description:
          'Large foundation drilling machine capable of drilling bored cast-in-place piles through clay, boulders, and rock strata.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6',
        bannerUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 2,
        specifications: {
          maxDrillingDepthM: 65,
          maxDrillingDiameterMm: 2200,
          maxTorqueKNm: 250,
          operatingWeightTonnes: 72,
          enginePowerHp: 360,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Horizontal Directional Drilling (HDD) Rig',
        slug: 'horizontal-directional-drilling-rig',
        description:
          'Steerable trenchless drilling unit for installing utility pipes, telecom ducts, and gas lines beneath roads and rivers without surface excavation.',
        imageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c',
        bannerUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 3,
        specifications: {
          pullbackForceKN: 320,
          spindleTorqueNm: 12000,
          maxDrillDistanceM: 500,
          pipeDiameterCapacityMm: 800,
          enginePowerHp: 160,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Hydraulic Concrete Crusher / Pulverizer',
        slug: 'concrete-pulverizer',
        description:
          'Secondary demolition shear attachment that crushes reinforced concrete and separates rebar for recycling.',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f',
        bannerUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 4,
        specifications: {
          operatingWeightKg: 2300,
          jawOpeningMm: 880,
          crushingForceTonnes: 95,
          continuousRotationDeg: 360,
          carrierExcavatorWeightTonnes: '20 - 30',
        },
      },
    ],
  },
  {
    name: 'Hauling & Heavy Transportation',
    slug: 'hauling-and-transportation',
    description:
      'Heavy site haulers, tippers, lowbed equipment trailers, and dust suppression tankers.',
    iconUrl: 'https://cdn.example.com/icons/transport.svg',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b',
    bannerUrl:
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl:
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
    webImageUrl:
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 6,
    machines: [
      {
        name: 'Heavy Dump Truck / Tipper',
        slug: 'heavy-dump-truck-tipper',
        description:
          'Multi-axle commercial tipper vehicle for transporting sand, aggregate, blasted rock, and excavated spoil.',
        imageUrl: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755',
        bannerUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 1,
        specifications: {
          grossVehicleWeightTonnes: 35,
          payloadCapacityTonnes: 22,
          bodyVolumeM3: 16,
          wheelConfiguration: '8x4',
          enginePowerHp: 380,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Articulated Dump Truck (ADT)',
        slug: 'articulated-dump-truck',
        description:
          'Rough-terrain hauler with center oscillating articulation hinge providing high traction through deep mud and unpaved grades.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6',
        bannerUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 2,
        specifications: {
          payloadCapacityTonnes: 40,
          heapedCapacityM3: 24,
          driveType: '6x6 All-Wheel Drive',
          enginePowerHp: 470,
          retarderEquipped: true,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Water Tanker Dust-Suppression Truck',
        slug: 'water-tanker-truck',
        description:
          'Site water truck with pneumatic water cannon and rear spray bar for haul road dust suppression and compaction moisture conditioning.',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f',
        bannerUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 3,
        specifications: {
          tankCapacityLiters: 15000,
          pumpOutputLMin: 1800,
          waterCannonReachM: 40,
          wheelConfiguration: '6x4',
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Lowbed Machinery Transport Semi-Trailer',
        slug: 'lowbed-heavy-trailer',
        description:
          'Heavy-haul drop-deck trailer with hydraulic folding ramps designed to transport tracked excavators and dozers safely.',
        imageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c',
        bannerUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 4,
        specifications: {
          payloadCapacityTonnes: 60,
          deckHeightMm: 850,
          numberOfAxles: 4,
          rampType: 'Hydraulic Double-Fold Ramps',
          tractorPrimeMoverPowerHp: 480,
        },
      },
    ],
  },
  {
    name: 'Power Generation & Utilities',
    slug: 'power-and-utilities',
    description:
      'Heavy-duty generators, air compressors, light towers, and dewatering pumps powering construction job sites.',
    iconUrl: 'https://cdn.example.com/icons/utilities.svg',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
    bannerUrl:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80',
    mobileImageUrl:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    webImageUrl:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 7,
    machines: [
      {
        name: 'Silent Acoustic Diesel Generator (250 kVA)',
        slug: 'diesel-generator-250kva',
        description:
          'Soundproof containerized 3-phase diesel generating set delivering continuous prime power for high-demand site machinery.',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        bannerUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 1,
        specifications: {
          primePowerKVA: 250,
          voltageV: '415V / 240V',
          frequencyHz: 50,
          soundLevelDbAt7M: 68,
          fuelTankCapacityL: 450,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'High-Pressure Rotary Screw Air Compressor',
        slug: 'industrial-air-compressor',
        description:
          'Trailer-mounted diesel screw compressor for shotcreting, pneumatic jackhammers, sandblasting, and pipe pressure tests.',
        imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866',
        bannerUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 2,
        specifications: {
          freeAirDeliveryCfm: 750,
          workingPressureBar: 12,
          enginePowerHp: 220,
          towableRunningGear: true,
          fuelType: 'Diesel',
        },
      },
      {
        name: 'Mobile Solar / Diesel Hybrid Light Tower',
        slug: 'mobile-light-tower',
        description:
          'Trailer-mounted 9-meter telescopic mast with 4 high-efficiency LED floodlights ensuring 360-degree night work safety.',
        imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122',
        bannerUrl:
          'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 3,
        specifications: {
          mastHeightMaxM: 9.0,
          luminaires: '4 x 350W High-Efficiency LED',
          totalLumens: 180000,
          mastRotationDeg: 340,
          windResistanceSpeedKmh: 100,
          hybridBatterySolarDiesel: true,
        },
      },
      {
        name: 'High-Head Submersible Dewatering Pump',
        slug: 'high-head-dewatering-pump',
        description:
          'Heavy slurry/groundwater drainage pump with high chrome wear-resistant impeller for deep excavation pits and tunneling.',
        imageUrl: 'https://images.unsplash.com/photo-1579273166152-d725a4e2b755',
        bannerUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1920&q=80',
        mobileImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=600&q=80',
        webImageUrl:
          'https://images.unsplash.com/photo-1579273166152-d725a4e2b755?auto=format&fit=crop&w=1200&q=80',
        displayOrder: 4,
        specifications: {
          flowRateM3PerHour: 120,
          maxHeadM: 45,
          dischargeOutletMm: 100,
          motorPowerKw: 15,
          maxSolidParticlePassMm: 25,
          powerSupply: '415V 3-Phase',
        },
      },
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
        bannerUrl: catData.bannerUrl,
        mobileImageUrl: catData.mobileImageUrl,
        webImageUrl: catData.webImageUrl,
        displayOrder: catData.displayOrder,
      },
      create: {
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        iconUrl: catData.iconUrl,
        imageUrl: catData.imageUrl,
        bannerUrl: catData.bannerUrl,
        mobileImageUrl: catData.mobileImageUrl,
        webImageUrl: catData.webImageUrl,
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
          bannerUrl: machineData.bannerUrl,
          mobileImageUrl: machineData.mobileImageUrl,
          webImageUrl: machineData.webImageUrl,
          displayOrder: machineData.displayOrder,
          specifications: machineData.specifications,
        },
        create: {
          categoryId: category.id,
          name: machineData.name,
          slug: machineData.slug,
          description: machineData.description,
          imageUrl: machineData.imageUrl,
          bannerUrl: machineData.bannerUrl,
          mobileImageUrl: machineData.mobileImageUrl,
          webImageUrl: machineData.webImageUrl,
          displayOrder: machineData.displayOrder,
          specifications: machineData.specifications,
        },
      });

      seededMachineCount += 1;
    }
  }

  return { seededCategoryCount, seededMachineCount };
}
