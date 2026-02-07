/**
 * Comprehensive keyword dictionary for job description analysis
 * Organized by category for efficient extraction
 */

// Programming languages
export const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'csharp',
  'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
  'r', 'matlab', 'perl', 'haskell', 'elixir', 'clojure', 'erlang',
  'objective-c', 'dart', 'lua', 'groovy', 'fortran', 'cobol',
];

// Frontend technologies
export const FRONTEND = [
  'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'vue.js', 'angular',
  'svelte', 'next.js', 'nextjs', 'nuxt', 'nuxtjs', 'gatsby',
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less',
  'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui',
  'styled-components', 'emotion', 'chakra',
  'webpack', 'vite', 'babel', 'rollup', 'parcel', 'esbuild',
  'redux', 'mobx', 'zustand', 'recoil', 'jotai',
  'jquery', 'backbone', 'ember',
];

// Backend technologies
export const BACKEND = [
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastify', 'koa', 'hapi',
  'django', 'flask', 'fastapi', 'tornado',
  'rails', 'ruby on rails', 'sinatra',
  'spring', 'spring boot', 'springboot', 'hibernate',
  '.net', 'dotnet', 'asp.net', 'aspnet', 'entity framework',
  'laravel', 'symfony', 'codeigniter',
  'gin', 'echo', 'fiber', 'beego',
  'actix', 'rocket', 'axum',
  'phoenix', 'ecto',
  'grpc', 'graphql', 'rest', 'restful', 'soap', 'websocket', 'websockets',
];

// Cloud & Infrastructure
export const CLOUD = [
  'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'dynamodb',
  'cloudformation', 'cloudwatch', 'ecs', 'eks', 'fargate', 'sqs', 'sns',
  'gcp', 'google cloud', 'google cloud platform', 'bigquery', 'cloud functions',
  'azure', 'microsoft azure', 'azure devops',
  'docker', 'containerization', 'containers',
  'kubernetes', 'k8s', 'helm', 'istio', 'openshift',
  'terraform', 'pulumi', 'cloudformation',
  'ansible', 'puppet', 'chef', 'saltstack',
  'jenkins', 'circleci', 'travis', 'github actions', 'gitlab ci',
  'nginx', 'apache', 'caddy', 'haproxy',
  'linux', 'unix', 'ubuntu', 'centos', 'redhat', 'debian',
  'serverless', 'microservices', 'service mesh',
  'heroku', 'vercel', 'netlify', 'digitalocean', 'linode',
];

// Databases
export const DATABASES = [
  'sql', 'nosql',
  'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite',
  'oracle', 'sql server', 'mssql',
  'mongodb', 'mongoose', 'dynamodb', 'couchdb', 'couchbase',
  'cassandra', 'scylladb',
  'redis', 'memcached', 'elasticache',
  'elasticsearch', 'opensearch', 'solr', 'lucene',
  'neo4j', 'neptune', 'graphdb', 'dgraph',
  'firebase', 'firestore', 'supabase',
  'prisma', 'sequelize', 'typeorm', 'knex',
];

// Data & ML
export const DATA_ML = [
  'machine learning', 'ml', 'deep learning', 'dl',
  'artificial intelligence', 'ai', 'generative ai', 'llm', 'llms',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
  'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn',
  'jupyter', 'notebook', 'colab',
  'spark', 'pyspark', 'hadoop', 'hive', 'presto',
  'kafka', 'kinesis', 'flink', 'storm',
  'airflow', 'luigi', 'dagster', 'prefect',
  'dbt', 'fivetran', 'stitch',
  'data science', 'data engineering', 'data analyst', 'data analytics',
  'etl', 'elt', 'data pipeline', 'data warehouse', 'data lake',
  'tableau', 'looker', 'power bi', 'metabase', 'superset',
  'nlp', 'natural language processing', 'computer vision', 'cv',
  'hugging face', 'transformers', 'bert', 'gpt',
];

// Mobile
export const MOBILE = [
  'ios', 'android', 'mobile',
  'swift', 'swiftui', 'uikit', 'objective-c',
  'kotlin', 'java android',
  'react native', 'flutter', 'dart',
  'xamarin', 'ionic', 'cordova', 'capacitor',
  'expo', 'detox', 'appium',
];

// Tools & Platforms
export const TOOLS = [
  'git', 'github', 'gitlab', 'bitbucket', 'svn',
  'jira', 'confluence', 'trello', 'asana', 'monday', 'notion', 'linear',
  'figma', 'sketch', 'adobe xd', 'invision', 'zeplin',
  'postman', 'insomnia', 'swagger', 'openapi',
  'datadog', 'splunk', 'new relic', 'grafana', 'prometheus',
  'sentry', 'bugsnag', 'rollbar',
  'slack', 'teams', 'zoom', 'discord',
  'vs code', 'vscode', 'intellij', 'webstorm', 'pycharm', 'vim', 'neovim',
];

// Testing
export const TESTING = [
  'testing', 'unit testing', 'integration testing', 'e2e testing',
  'jest', 'mocha', 'chai', 'jasmine', 'karma',
  'pytest', 'unittest', 'nose',
  'cypress', 'playwright', 'selenium', 'puppeteer',
  'enzyme', 'react testing library', 'rtl',
  'tdd', 'bdd', 'test-driven development',
  'coverage', 'code coverage',
];

// Security
export const SECURITY = [
  'security', 'cybersecurity', 'infosec', 'appsec',
  'oauth', 'oauth2', 'jwt', 'saml', 'sso', 'openid',
  'encryption', 'ssl', 'tls', 'https',
  'penetration testing', 'pen testing', 'vulnerability',
  'owasp', 'xss', 'csrf', 'sql injection',
  'soc2', 'gdpr', 'hipaa', 'pci', 'compliance',
];

// Soft skills
export const SOFT_SKILLS = [
  'communication', 'written communication', 'verbal communication',
  'leadership', 'lead', 'leading', 'mentor', 'mentoring', 'mentorship',
  'teamwork', 'team player', 'collaboration', 'collaborative',
  'problem-solving', 'problem solving', 'analytical', 'critical thinking',
  'adaptability', 'flexible', 'flexibility', 'agile mindset',
  'initiative', 'proactive', 'self-starter', 'self-motivated', 'autonomous',
  'attention to detail', 'detail-oriented', 'meticulous',
  'organized', 'organization', 'time management', 'prioritization',
  'presentation', 'presenting', 'public speaking',
  'stakeholder management', 'cross-functional',
  'creative', 'creativity', 'innovative', 'innovation',
  'customer-focused', 'user-focused', 'empathy',
  'ownership', 'accountability', 'responsibility',
];

// Values & Culture keywords
export const VALUES = [
  'fast-paced', 'fast paced', 'startup', 'start-up',
  'innovative', 'cutting-edge', 'cutting edge', 'bleeding edge',
  'mission-driven', 'mission driven', 'impact', 'impactful',
  'growth mindset', 'learning culture', 'continuous learning',
  'diversity', 'inclusive', 'inclusion', 'belonging', 'dei',
  'remote', 'remote-friendly', 'remote-first', 'hybrid', 'on-site', 'onsite',
  'work-life balance', 'work life balance', 'flexible hours', 'unlimited pto',
  'collaborative environment', 'team-oriented', 'supportive',
  'entrepreneurial', 'scrappy', 'resourceful',
  'transparent', 'transparency', 'open communication',
  'customer-obsessed', 'customer-centric', 'user-centric',
];

// Experience patterns (for regex matching)
export const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*(?:to\s*\d+\s*)?years?\s*(?:of\s+)?(?:experience|exp)/gi,
  /(?:minimum|at least|required:?)\s*(\d+)\+?\s*years?/gi,
  /senior|sr\.|lead|principal|staff|junior|jr\.|entry[- ]level|mid[- ]level/gi,
  /experience\s+(?:with|in|building|developing|working)/gi,
];

// Education patterns
export const EDUCATION_PATTERNS = [
  /b\.?s\.?|bachelor'?s?(?:\s+degree)?/gi,
  /m\.?s\.?|master'?s?(?:\s+degree)?/gi,
  /ph\.?d\.?|doctorate/gi,
  /computer science|software engineering|electrical engineering/gi,
  /mathematics|statistics|physics|data science/gi,
  /degree\s+in\s+[\w\s]+/gi,
  /(?:bs|ms|ba|ma)[\s/](?:cs|ee|ce|se)/gi,
  /equivalent\s+(?:experience|work\s+experience)/gi,
];

// Industry terms
export const INDUSTRY = [
  'fintech', 'financial technology', 'banking', 'finance', 'trading',
  'healthcare', 'healthtech', 'medtech', 'biotech', 'pharma',
  'e-commerce', 'ecommerce', 'retail', 'marketplace',
  'edtech', 'education', 'learning',
  'saas', 'b2b', 'b2c', 'enterprise', 'platform',
  'gaming', 'esports', 'entertainment',
  'social media', 'social network', 'consumer',
  'logistics', 'supply chain', 'transportation',
  'real estate', 'proptech',
  'insurtech', 'insurance',
  'adtech', 'advertising', 'marketing tech', 'martech',
  'govtech', 'civic tech', 'government',
  'cleantech', 'climate', 'sustainability', 'green tech',
  'legaltech', 'legal',
  'hrtech', 'hr', 'human resources', 'recruiting',
];

// Combine all technical skills
export const ALL_TECH_SKILLS = [
  ...LANGUAGES,
  ...FRONTEND,
  ...BACKEND,
  ...CLOUD,
  ...DATABASES,
  ...DATA_ML,
  ...MOBILE,
  ...TESTING,
  ...SECURITY,
];

// Map for quick lookups by category
export const SKILL_CATEGORIES: Record<string, string[]> = {
  languages: LANGUAGES,
  frontend: FRONTEND,
  backend: BACKEND,
  cloud: CLOUD,
  databases: DATABASES,
  data_ml: DATA_ML,
  mobile: MOBILE,
  tools: TOOLS,
  testing: TESTING,
  security: SECURITY,
};
