
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define translations
const translations = {
  en: {
    // ... (keeping all existing translations)
    
    // Ecosystem Tab Content - NEW CONTENT
    ecosystemTabTitle: 'Ecosystem',
    ecosystemIntro: '🌐 MXI is an ecosystem, not just a token: it is a complete infrastructure designed to operate as a self-sustaining digital economy, capable of integrating products, services, technology, and community within the same interconnected environment. Each element is designed to feed the others, generating flow, utility, and real growth for users, entrepreneurs, and investors.',
    ecosystemApproach: '🚀 Our approach turns MXI into a living, scalable, and functional environment, where all solutions connect to create continuous and decentralized value.',
    ecosystemComponentsTitle: 'Components of the MXI Ecosystem',
    ecosystemComponentsIntro: 'The following lists and explains the pillars that make MXI a true ecosystem:',
    
    ecosystemComponent1Title: '1. Token MXI (core of the ecosystem) 🪙',
    ecosystemComponent1Desc: 'The token is the basis upon which the entire MXI economy is built: transactions, rewards, votes, payments, governance, and access to services.',
    
    ecosystemComponent2Title: '2. MXI Multilayer Wallet 📱',
    ecosystemComponent2Desc: 'Smart wallet with quantum security architecture, prepared for future threats and focused on protecting assets, identities, and transactions.',
    
    ecosystemComponent3Title: '3. MXI DeFi Platform 🏦',
    ecosystemComponent3Desc: 'Includes:',
    ecosystemComponent3Point1: '- Staking and automated rewards',
    ecosystemComponent3Point2: '- Liquidity pools',
    ecosystemComponent3Point3: '- Decentralized loans for entrepreneurs',
    ecosystemComponent3Point4: '- Sustainable performance mechanisms',
    
    ecosystemComponent4Title: '4. MXI Launchpad for entrepreneurs 🚀',
    ecosystemComponent4Desc: 'Space for new projects to receive financing within the ecosystem using MXI, boosting the real economy and innovation.',
    
    ecosystemComponent5Title: '5. MXI Pay & MXI Card 💳',
    ecosystemComponent5Desc: 'An interoperable card that allows using MXI in businesses, daily payments, global purchases, and withdrawals. Designed to integrate digital finance and daily life.',
    
    ecosystemComponent6Title: '6. Quantum Security System 🛡️',
    ecosystemComponent6Desc: 'Our infrastructure adopts algorithms resistant to quantum computing, anticipating the technological challenges of the next decade.',
    
    ecosystemComponent7Title: '7. Marketplace and Web3 Integrations 🛒',
    ecosystemComponent7Desc: 'Projects, services, products, and utilities that use MXI as a means of payment and exchange, strengthening the circulation of value.',
    
    ecosystemComponent8Title: '8. Community Governance Program 🤝',
    ecosystemComponent8Desc: 'The community votes, proposes, and decides the course of the ecosystem. If MXI grows, everyone wins.',
    
    ecosystemComponent9Title: '9. MXI Academy (training & community) 🎓',
    ecosystemComponent9Desc: 'Financial education, blockchain, and project development to empower entrepreneurs and investors.',
    
    ecosystemSummaryTitle: 'Summary',
    ecosystemSummaryIntro: 'MXI is an ecosystem because it integrates:',
    ecosystemSummaryPoint1: '✔ Token',
    ecosystemSummaryPoint2: '✔ Wallet',
    ecosystemSummaryPoint3: '✔ Quantum Security',
    ecosystemSummaryPoint4: '✔ DeFi Platform',
    ecosystemSummaryPoint5: '✔ Card and Payments',
    ecosystemSummaryPoint6: '✔ Launchpad',
    ecosystemSummaryPoint7: '✔ Marketplace',
    ecosystemSummaryPoint8: '✔ Governance',
    ecosystemSummaryPoint9: '✔ Training',
    ecosystemSummaryPoint10: '✔ Community',
    ecosystemSummaryConclusion: '✨ Everything connected to create a real decentralized economy, where cooperation multiplies the value.',
    
    // ... (rest of existing translations)
  },
  es: {
    // ... (keeping all existing translations)
    
    // Ecosystem Tab Content - NEW CONTENT
    ecosystemTabTitle: 'Ecosistema',
    ecosystemIntro: '🌐 MXI es un ecosistema, no es solo un token: es una infraestructura completa diseñada para operar como una economía digital autosostenible, capaz de integrar productos, servicios, tecnología y comunidad dentro de un mismo entorno interconectado. Cada elemento está diseñado para alimentar a los demás, generando flujo, utilidad y crecimiento real tanto para usuarios, emprendedores e inversores.',
    ecosystemApproach: '🚀 Nuestro enfoque convierte a MXI en un entorno vivo, escalable y funcional, donde todas las soluciones se conectan para crear valor continuo y descentralizado.',
    ecosystemComponentsTitle: 'Componentes del Ecosistema MXI',
    ecosystemComponentsIntro: 'A continuación, se enumeran y explican los pilares que hacen de MXI un verdadero ecosistema:',
    
    ecosystemComponent1Title: '1. Token MXI (núcleo del ecosistema) 🪙',
    ecosystemComponent1Desc: 'El token es la base sobre la cual se construye toda la economía MXI: transacciones, recompensas, votaciones, pagos, gobernanza y acceso a servicios.',
    
    ecosystemComponent2Title: '2. MXI Wallet Multicapa 📱',
    ecosystemComponent2Desc: 'Billetera inteligente con arquitectura de seguridad cuántica, preparada para amenazas futuras y enfocada en proteger activos, identidades y transacciones.',
    
    ecosystemComponent3Title: '3. Plataforma DeFi MXI 🏦',
    ecosystemComponent3Desc: 'Incluye:',
    ecosystemComponent3Point1: '- Staking y recompensas automatizadas',
    ecosystemComponent3Point2: '- Pools de liquidez',
    ecosystemComponent3Point3: '- Préstamos descentralizados para emprendedores',
    ecosystemComponent3Point4: '- Mecanismos de rendimiento sostenibles',
    
    ecosystemComponent4Title: '4. MXI Launchpad para emprendedores 🚀',
    ecosystemComponent4Desc: 'Espacio para que nuevos proyectos reciban financiamiento dentro del ecosistema usando MXI, impulsando la economía real y la innovación.',
    
    ecosystemComponent5Title: '5. MXI Pay & Tarjeta MXI 💳',
    ecosystemComponent5Desc: 'Una tarjeta interoperable que permite usar MXI en comercios, pagos diarios, compras globales y retiros. Diseñada para integrar finanzas digitales y vida cotidiana.',
    
    ecosystemComponent6Title: '6. Sistema de Seguridad Cuántica 🛡️',
    ecosystemComponent6Desc: 'Nuestra infraestructura adopta algoritmos resistentes a la computación cuántica, anticipándose a los retos tecnológicos de la próxima década.',
    
    ecosystemComponent7Title: '7. Marketplace e Integraciones Web3 🛒',
    ecosystemComponent7Desc: 'Proyectos, servicios, productos y utilidades que usan MXI como medio de pago y de intercambio, fortaleciendo la circulación del valor.',
    
    ecosystemComponent8Title: '8. Programa de Gobernanza Comunitaria 🤝',
    ecosystemComponent8Desc: 'La comunidad vota, propone y decide el rumbo del ecosistema. Si MXI crece, todos ganan.',
    
    ecosystemComponent9Title: '9. MXI Academy (formación & comunidad) 🎓',
    ecosystemComponent9Desc: 'Educación financiera, blockchain y desarrollo de proyectos para empoderar a emprendedores e inversores.',
    
    ecosystemSummaryTitle: 'Resumen',
    ecosystemSummaryIntro: 'MXI es un ecosistema porque integra:',
    ecosystemSummaryPoint1: '✔ Token',
    ecosystemSummaryPoint2: '✔ Wallet',
    ecosystemSummaryPoint3: '✔ Seguridad cuántica',
    ecosystemSummaryPoint4: '✔ Plataforma DeFi',
    ecosystemSummaryPoint5: '✔ Tarjeta y pagos',
    ecosystemSummaryPoint6: '✔ Launchpad',
    ecosystemSummaryPoint7: '✔ Marketplace',
    ecosystemSummaryPoint8: '✔ Gobernanza',
    ecosystemSummaryPoint9: '✔ Formación',
    ecosystemSummaryPoint10: '✔ Comunidad',
    ecosystemSummaryConclusion: '✨ Todo conectado para crear una economía descentralizada real, donde la cooperación multiplica el valor.',
    
    // ... (rest of existing translations)
  },
  pt: {
    // ... (keeping all existing translations)
    
    // Ecosystem Tab Content - NEW CONTENT
    ecosystemTabTitle: 'Ecossistema',
    ecosystemIntro: '🌐 MXI é um ecossistema, não apenas um token: é uma infraestrutura completa projetada para operar como uma economia digital autossustentável, capaz de integrar produtos, serviços, tecnologia e comunidade dentro do mesmo ambiente interconectado. Cada elemento é projetado para alimentar os outros, gerando fluxo, utilidade e crescimento real para usuários, empreendedores e investidores.',
    ecosystemApproach: '🚀 Nossa abordagem transforma o MXI em um ambiente vivo, escalável e funcional, onde todas as soluções se conectam para criar valor contínuo e descentralizado.',
    ecosystemComponentsTitle: 'Componentes do Ecossistema MXI',
    ecosystemComponentsIntro: 'A seguir, listamos e explicamos os pilares que tornam o MXI um verdadeiro ecossistema:',
    
    ecosystemComponent1Title: '1. Token MXI (núcleo do ecossistema) 🪙',
    ecosystemComponent1Desc: 'O token é a base sobre a qual toda a economia MXI é construída: transações, recompensas, votos, pagamentos, governança e acesso a serviços.',
    
    ecosystemComponent2Title: '2. MXI Wallet Multicamadas 📱',
    ecosystemComponent2Desc: 'Carteira inteligente com arquitetura de segurança quântica, preparada para ameaças futuras e focada em proteger ativos, identidades e transações.',
    
    ecosystemComponent3Title: '3. Plataforma DeFi MXI 🏦',
    ecosystemComponent3Desc: 'Inclui:',
    ecosystemComponent3Point1: '- Staking e recompensas automatizadas',
    ecosystemComponent3Point2: '- Pools de liquidez',
    ecosystemComponent3Point3: '- Empréstimos descentralizados para empreendedores',
    ecosystemComponent3Point4: '- Mecanismos de desempenho sustentáveis',
    
    ecosystemComponent4Title: '4. MXI Launchpad para empreendedores 🚀',
    ecosystemComponent4Desc: 'Espaço para novos projetos receberem financiamento dentro do ecossistema usando MXI, impulsionando a economia real e a inovação.',
    
    ecosystemComponent5Title: '5. MXI Pay & Cartão MXI 💳',
    ecosystemComponent5Desc: 'Um cartão interoperável que permite usar MXI em empresas, pagamentos diários, compras globais e saques. Projetado para integrar finanças digitais e vida cotidiana.',
    
    ecosystemComponent6Title: '6. Sistema de Segurança Quântica 🛡️',
    ecosystemComponent6Desc: 'Nossa infraestrutura adota algoritmos resistentes à computação quântica, antecipando os desafios tecnológicos da próxima década.',
    
    ecosystemComponent7Title: '7. Marketplace e Integrações Web3 🛒',
    ecosystemComponent7Desc: 'Projetos, serviços, produtos e utilidades que usam MXI como meio de pagamento e troca, fortalecendo a circulação de valor.',
    
    ecosystemComponent8Title: '8. Programa de Governança Comunitária 🤝',
    ecosystemComponent8Desc: 'A comunidade vota, propõe e decide o rumo do ecossistema. Se o MXI crescer, todos ganham.',
    
    ecosystemComponent9Title: '9. MXI Academy (formação & comunidade) 🎓',
    ecosystemComponent9Desc: 'Educação financeira, blockchain e desenvolvimento de projetos para capacitar empreendedores e investidores.',
    
    ecosystemSummaryTitle: 'Resumo',
    ecosystemSummaryIntro: 'MXI é um ecossistema porque integra:',
    ecosystemSummaryPoint1: '✔ Token',
    ecosystemSummaryPoint2: '✔ Wallet',
    ecosystemSummaryPoint3: '✔ Segurança Quântica',
    ecosystemSummaryPoint4: '✔ Plataforma DeFi',
    ecosystemSummaryPoint5: '✔ Cartão e Pagamentos',
    ecosystemSummaryPoint6: '✔ Launchpad',
    ecosystemSummaryPoint7: '✔ Marketplace',
    ecosystemSummaryPoint8: '✔ Governança',
    ecosystemSummaryPoint9: '✔ Formação',
    ecosystemSummaryPoint10: '✔ Comunidade',
    ecosystemSummaryConclusion: '✨ Tudo conectado para criar uma economia descentralizada real, onde a cooperação multiplica o valor.',
    
    // ... (rest of existing translations)
  },
};

// Create i18n instance
const i18n = new I18n(translations);

// Set default locale
i18n.defaultLocale = 'es';
i18n.enableFallback = true;

// Storage key for language preference
const LANGUAGE_KEY = '@mxi_language';

// Initialize language from storage or device locale
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    } else {
      // Get device locale
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'es';
      
      // Map device locale to supported languages
      if (deviceLocale.startsWith('en')) {
        i18n.locale = 'en';
      } else if (deviceLocale.startsWith('pt')) {
        i18n.locale = 'pt';
      } else {
        i18n.locale = 'es'; // Default to Spanish
      }
    }
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'es';
  }
};

// Save language preference
export const setLanguage = async (language: 'en' | 'es' | 'pt') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.locale = language;
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): 'en' | 'es' | 'pt' => {
  return i18n.locale as 'en' | 'es' | 'pt';
};

export { i18n };
