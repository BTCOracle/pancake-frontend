import { Language, languageList, useTranslation } from "@pancakeswap/localization";
import { Box, LangSelector } from "../../../components";

export type LocaleSelectorProps = {
  currentLang?: string;
  langs?: Language[];
  setLang?: (lang: Language) => void;
};

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({ currentLang, langs, setLang }) => {
  const { currentLanguage, setLanguage } = useTranslation();
  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setLang?.(language);
  };

  return (
    <Box mt="4px">
      <LangSelector
        currentLang={currentLang ?? currentLanguage?.code}
        langs={langs ?? languageList}
        setLang={handleLanguageChange}
        buttonScale="xs"
        color="textSubtle"
        hideLanguage
      />
    </Box>
  );
};
