
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define translations
const translations = {
  en: {
    // ... (keeping all existing English translations)
    onlyUseCommissionsOrChallenges: 'Informative Notice: Tournaments are being implemented. They will be updated until optimal functionality and quality are achieved, as the Project develops.',
    // ... rest of translations
  },
  es: {
    // ... (keeping all existing Spanish translations)
    onlyUseCommissionsOrChallenges: 'Aviso Informativo: Los torneos están siendo implementados. Se estará actualizando hasta alcanzar una funcionalidad y calidad óptima, a medida que se desarrolle el Proyecto.',
    // ... rest of translations
  },
  pt: {
    // ... (keeping all existing Portuguese translations)
    onlyUseCommissionsOrChallenges: 'Aviso Informativo: Os torneios estão sendo implementados. Serão atualizados até atingir funcionalidade e qualidade ideais, à medida que o Projeto se desenvolve.',
    // ... rest of translations
  },
};

// ... rest of the file remains the same
