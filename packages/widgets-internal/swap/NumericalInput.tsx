import { useTranslation } from "@pancakeswap/localization";
import { SwapCSS } from "@pancakeswap/uikit";
import { escapeRegExp } from "@pancakeswap/utils/escapeRegExp";
import clsx from "clsx";
import { memo } from "react";
import { truncateDecimals } from "../utils/numbers";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

export type NumericalInputProps = {
  value: string | number | undefined;
  onUserInput: (input: string) => void;
  fontSize?: string;
  maxDecimals?: number;
} & SwapCSS.InputVariants &
  Omit<React.HTMLProps<HTMLInputElement>, "ref" | "onChange" | "as">;

export const NumericalInput = memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  error,
  align,
  className,
  loading,
  maxDecimals,
  ...rest
}: NumericalInputProps) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(truncateDecimals(nextUserInput, maxDecimals));
    }
  };

  const { t } = useTranslation();

  return (
    <input
      className={clsx(
        className,
        SwapCSS.inputVariants({
          error,
          align,
          loading,
        })
      )}
      {...rest}
      value={truncateDecimals(value?.toString(), maxDecimals)}
      onChange={(event) => {
        // replace commas with periods, because we exclusively uses period as the decimal separator
        enforcer(event.target.value.replace(/,/g, "."));
      }}
      // universal input options
      inputMode="decimal"
      title={t("Token Amount")}
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      type="text"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder={placeholder || "0.0"}
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  );
});
