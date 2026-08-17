export interface SubtopicNode {
  title: string;
  icon: string;
  concepts: string[];
}

export interface CurriculumTopicDetails {
  title: string;
  tag: string;
  description: string;
  estimatedTime: string;
  prerequisites: string;
  keyConceptsCount: number;
  difficulty: string;
  resources: {
    ppt: boolean;
    notes: boolean;
    diagrams: number;
    activities: number;
  };
  tree: {
    rootTitle: string;
    children: SubtopicNode[];
  };
  objectives: string[];
  misconceptions: string[];
  connections: string[];
}

export const SEEDED_CURRICULUM_DATA: Record<string, CurriculumTopicDetails> = {
  "photosynthesis": {
    title: "3.3 Photosynthesis",
    tag: "Core Topic",
    description: "The process by which green plants prepare their own food using sunlight, carbon dioxide and water.",
    estimatedTime: "40 min",
    prerequisites: "3.1, 3.2",
    keyConceptsCount: 6,
    difficulty: "Medium",
    resources: {
      ppt: true,
      notes: true,
      diagrams: 3,
      activities: 2
    },
    tree: {
      rootTitle: "3.3 Photosynthesis",
      children: [
        {
          title: "3.3.1 Definition",
          icon: "BookOpen",
          concepts: ["What is Photosynthesis?", "Where does it occur?"]
        },
        {
          title: "3.3.2 Raw Materials",
          icon: "Flask",
          concepts: ["Sunlight", "Carbon Dioxide", "Water", "Chlorophyll"]
        },
        {
          title: "3.3.3 Process",
          icon: "Cog",
          concepts: ["Absorption of Light Energy", "Conversion of Energy", "Chemical Reaction"]
        },
        {
          title: "3.3.4 Products",
          icon: "Leaf",
          concepts: ["Glucose (Food)", "Oxygen"]
        },
        {
          title: "3.3.5 Significance",
          icon: "Star",
          concepts: ["Food for Plants", "Oxygen for Living Things", "Energy Source"]
        },
        {
          title: "3.3.6 Applications",
          icon: "Target",
          concepts: ["In Agriculture", "In Ecosystem", "For Life on Earth"]
        }
      ]
    },
    objectives: [
      "Define photosynthesis and explain its importance.",
      "List the raw materials required for photosynthesis.",
      "Describe the process of photosynthesis with the help of a diagram."
    ],
    misconceptions: [
      "Plants get food from soil.",
      "Oxygen is absorbed during photosynthesis.",
      "Photosynthesis occurs only during the day."
    ],
    connections: [
      "Why plants grow in sunlight.",
      "Why we feel fresh in the morning.",
      "How forests help in maintaining life on Earth."
    ]
  },
  "agricultural practices": {
    title: "1.1 Agricultural Practices",
    tag: "Core Topic",
    description: "Overview of agricultural methods and historical evolution of crop production in human civilization.",
    estimatedTime: "45 min",
    prerequisites: "None",
    keyConceptsCount: 4,
    difficulty: "Easy",
    resources: {
      ppt: true,
      notes: true,
      diagrams: 1,
      activities: 1
    },
    tree: {
      rootTitle: "1.1 Agricultural Practices",
      children: [
        {
          title: "1.1.1 Crop Types",
          icon: "Leaf",
          concepts: ["Kharif Crops", "Rabi Crops", "Seasonal sowing timelines"]
        },
        {
          title: "1.1.2 Traditional Tools",
          icon: "Hammer",
          concepts: ["Wooden plough", "Hoe", "Animal-driven seed drills"]
        },
        {
          title: "1.1.3 Modern Farming",
          icon: "Cog",
          concepts: ["Tractors", "Combine harvesters", "Drip irrigation systems"]
        }
      ]
    },
    objectives: [
      "Distinguish between Kharif and Rabi crop seasons.",
      "Describe early traditional agricultural implements.",
      "Explain how industrial machinery optimized crop yields."
    ],
    misconceptions: [
      "All crops can grow in any season.",
      "Fertilizers and manures are the same thing.",
      "Irrigation just means throwing water on fields."
    ],
    connections: [
      "Organic food vs GMOs in supermarkets.",
      "Rainfall dependency in rural Indian villages.",
      "Vertical farming in skyscrapers."
    ]
  },
  "properties of rational numbers": {
    title: "1.1 Properties of Rational Numbers",
    tag: "Core Math",
    description: "Understanding properties like closure, commutativity, and associativity under rational operations.",
    estimatedTime: "50 min",
    prerequisites: "Fraction operations",
    keyConceptsCount: 5,
    difficulty: "Hard",
    resources: {
      ppt: true,
      notes: true,
      diagrams: 2,
      activities: 3
    },
    tree: {
      rootTitle: "1.1 Properties of Rational Numbers",
      children: [
        {
          title: "1.1.1 Closure",
          icon: "Lock",
          concepts: ["Addition closure", "Multiplication closure", "Division exceptions (zero)"]
        },
        {
          title: "1.1.2 Commutativity",
          icon: "RefreshCw",
          concepts: ["a + b = b + a", "Subtraction exceptions (a - b != b - a)"]
        },
        {
          title: "1.1.3 Associativity",
          icon: "FolderGit2",
          concepts: ["Groupings in addition", "Groupings in multiplication"]
        }
      ]
    },
    objectives: [
      "Apply closure properties to rational numbers.",
      "Prove why subtraction is non-commutative on rational sets.",
      "Use additive and multiplicative identity properties in algebra."
    ],
    misconceptions: [
      "Rational numbers only refer to proper fractions.",
      "Commutativity applies to division.",
      "Zero is not a rational number."
    ],
    connections: [
      "Dividing pizzas into equal slices.",
      "Ratios in cake baking recipes.",
      "Digital pixel aspect ratios."
    ]
  }
};

// Fallback generator for dynamically uploaded textbooks
export const generateFallbackCurriculum = (topicName: string): CurriculumTopicDetails => {
  return {
    title: topicName,
    tag: "Topic Overview",
    description: `Detailed syllabus analysis and educational lesson resources for "${topicName}".`,
    estimatedTime: "45 min",
    prerequisites: "Previous topic sections",
    keyConceptsCount: 4,
    difficulty: "Medium",
    resources: {
      ppt: true,
      notes: true,
      diagrams: 1,
      activities: 1
    },
    tree: {
      rootTitle: topicName,
      children: [
        {
          title: "Section 1: Introduction",
          icon: "BookOpen",
          concepts: ["Fundamental Definition", "Historical Context", "Core Premises"]
        },
        {
          title: "Section 2: Key Methodology",
          icon: "Cog",
          concepts: ["System Components", "Step-by-step Process", "Operational Laws"]
        },
        {
          title: "Section 3: Applications",
          icon: "Target",
          concepts: ["Practical Uses", "Technological Integrations", "Industry Impact"]
        }
      ]
    },
    objectives: [
      `Explain the core concepts and scope of ${topicName}.`,
      `Identify the primary steps or components involved.`,
      `Apply theoretical knowledge of ${topicName} to practical real-world problems.`
    ],
    misconceptions: [
      "Assuming the process occurs instantly.",
      "Confusing secondary effects with core functions.",
      "Overlooking basic dependencies or prerequisites."
    ],
    connections: [
      "Current news headlines and industrial case studies.",
      "Everyday interactions in daily home life.",
      "Advanced career pathways in science and engineering."
    ]
  };
};
