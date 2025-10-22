import React, { useCallback, useMemo } from "react";
import Select, { OptionProps } from "../Select/Select";
import { Language } from "./types";

interface Props {
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
}

const LangSelectorV2: React.FC<React.PropsWithChildren<Props>> = ({ currentLang, langs, setLang }) => {
  // Convert Language objects to OptionProps
  const options: OptionProps[] = useMemo(() => {
    return langs.map((lang) => ({
      label: lang.language,
      value: lang.locale,
    }));
  }, [langs]);

  const currentLangObj = useMemo(() => langs.find((lang) => lang.code === currentLang), [langs, currentLang]);

  const handleOptionChange = useCallback(
    (option: OptionProps) => {
      const selectedLang = langs.find((lang) => lang.locale === option.value);

      console.log("selectedLang", selectedLang);
      if (selectedLang) {
        setLang(selectedLang);
      }
    },
    [langs, setLang]
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <Select
        options={options}
        onOptionChange={handleOptionChange}
        placeHolderText={currentLangObj?.language || "English"}
        listStyle={{
          maxHeight: "200px",
          overflowY: "auto",
        }}
        textStyle={{
          paddingRight: "16px",
        }}
      />
    </div>
  );
};

export default React.memo(LangSelectorV2, (prev, next) => prev.currentLang === next.currentLang);
