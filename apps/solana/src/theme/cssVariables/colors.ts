import { darkColors as pcsDarkColors, lightColors as pcsLightColors } from '@pancakeswap/uikit'

export const darkColors: Record<keyof typeof colors, string> = {
  // app main bg color
  primary: pcsDarkColors.primary,
  primary10: pcsDarkColors.primary10,
  primary20: pcsDarkColors.primary20,
  primary60: pcsDarkColors.primary60,
  destructive10: pcsDarkColors.destructive10,
  destructive20: pcsDarkColors.destructive20,
  destructive60: pcsDarkColors.destructive60,
  destructive: pcsDarkColors.destructive,
  positive60: pcsDarkColors.positive60,
  secondary: pcsDarkColors.secondary,
  secondary10: 'rgba(34, 209, 248, 0.1)',
  secondary20: pcsDarkColors.secondary20,
  secondary60: pcsDarkColors.secondary60,

  // component color
  background: pcsDarkColors.background,
  backgroundAlt: pcsDarkColors.backgroundAlt,
  backgroundDisabled: pcsDarkColors.backgroundDisabled,
  gradientBubblegum: pcsDarkColors.gradientBubblegum,
  backgroundOverlay: pcsDarkColors.backgroundOverlay,
  backgroundDark: '#0b1022',
  backgroundDark50: '#0b102280',
  backgroundMedium: '#161E32',
  backgroundLight: '#1C243E',
  backgroundLight50: '#1C243E88',
  backgroundLight30: '#1C243E4d',
  backgroundTransparent12: 'rgba(171, 196, 255, 0.12)',
  backgroundTransparent07: 'rgba(171, 196, 255, 0.07)',
  backgroundTransparent10: 'rgba(171, 196, 255, 0.1)',

  // text
  textPrimary: pcsDarkColors.text,
  textSecondary: pcsDarkColors.secondary,
  textSubtle: pcsDarkColors.textSubtle,
  textTertiary: '#abc4ff80',
  textRevertPrimary: '#181F35',

  textLink: '#22D1F8',

  textQuaternary: '#C4D6FF',
  textQuinary: '#1C243E',
  textSenary: 'rgba(196, 214, 255, 0.5)',
  textSeptenary: '#22D1F8',
  textPurple: '#8C6EEF',
  textPink: '#FF4EA3',

  // button
  buttonPrimary: '#22D1F8',
  buttonPrimary__01: '#22D1F8',
  buttonPrimary__02: '#39D0D8',
  buttonSolidText: '#0B1022',
  buttonSecondary: '#8C6EEF',

  // switch
  switchOn: '#22D1F8',
  switchOff: '#ABC4FF',

  // select
  selectActive: pcsDarkColors.textSubtle,
  textDisabled: pcsDarkColors.textDisabled,
  selectActiveSecondary: '#22D1F8',
  selectInactive: '#abc4ff1a',

  // chart
  chart01: '#abc4ff',
  chart02: '#39D0D8',
  chart03: '#8C6EEF',
  chart04: '#2B6AFF',
  chart05: '#FF7043',
  chart06: '#FED33A',
  chart07: '#4F53F3',
  chart08: '#22D1F8',
  chart09: '#8C6EEF33',

  // Icon
  iconBg: '#8CA7E8',
  iconEmptyStroke: pcsDarkColors.primary60,
  iconBorder: pcsDarkColors.cardBorder,

  // success/warning/error/info
  success: pcsDarkColors.success,
  failure: pcsDarkColors.failure,
  warning20: pcsDarkColors.warning20,
  warning50: pcsDarkColors.yellow,
  semanticSuccess: '#22D1F8',
  semanticError: '#FF4EA3',
  semanticWarning: '#FED33A',
  semanticNeutral: '#ABC4FF',
  semanticFocus: '#A259FF',
  semanticFocusShadow: '#A259FF33',

  // Tab
  tabFolderTabListBg: 'var(--background-light-opacity)',

  // Step
  stepActiveBg: 'var(--tertiary)',
  stepHoofBg: 'var(--tertiary)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: '#22D1F8',
  priceFloatingDown: '#FF4EA3',
  priceFloatingFlat: '#888888',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: pcsLightColors.backgroundAlt,
  tooltipText: pcsLightColors.text,
  dropdown: pcsDarkColors.dropdown,

  invertedContrast: pcsDarkColors.invertedContrast,

  popoverBg: '#141f3a',

  // customize (by V3 frontend coder)
  scrollbarThumb: 'rgba(255, 255, 255, 0.2)',

  // badge
  badgePurple: 'rgba(140, 110, 239, 0.5)',
  badgeBlue: 'rgba(34, 209, 248, 0.5)',

  // divider
  dividerBg: 'rgba(171, 196, 255, 0.12)',

  // input
  input: pcsDarkColors.input,
  inputMask: 'rgba(39, 38, 44, 0.35)',
  inputBorder: pcsDarkColors.inputSecondary,
  inputBg: pcsDarkColors.input,
  inputSecondary: pcsDarkColors.inputSecondary,

  // card
  cardBorder01: pcsDarkColors.cardBorder,
  cardBg: pcsDarkColors.card,
  cardSecondary: pcsDarkColors.cardSecondary,

  // customize (by V3 frontend coder)
  backgroundApp: pcsDarkColors.background,
  solidButtonBg: 'linear-gradient(272.03deg, #39D0D8 2.63%, #22D1F8 95.31%)',
  outlineButtonBg: 'linear-gradient(272.03deg, rgba(57, 208, 216, 0.1) 2.63%, rgba(34, 209, 248, 0.1) 95.31%)',
  filledProgressBg: 'linear-gradient(270deg, #8C6EEF 0%, #4F53F3 100%)',
  transparentContainerBg: 'linear-gradient(271.31deg, rgba(96, 59, 200, 0.2) 1.47%, rgba(140, 110, 239, 0.12) 100%)',
  modalContainerBg: pcsDarkColors.secondary20,
  infoButtonBg: '#ABC4FF33',
  warnButtonBg: '#FED33A33',
  warnButtonLightBg: '#FED33A1A',
  buttonBg01: '#ABC4FF1F',
  lightPurple: pcsDarkColors.textSubtle,
  background01: '#090D1D',
  background02: 'rgba(22, 22, 22, 0.5)',
  background03: '#FF4EA31A',
  text01: '#D6CC56',
  text02: '#fff',
  text03: '#b5b7da',
  tertiary: pcsDarkColors.tertiary,
  /** it's designer's variable name in Figma */
  brandGradient: 'linear-gradient(244deg, #7748FC 8.17%, #39D0D8 101.65%)',
  dividerDashGradient: 'repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px)',

  tokenAvatarBg: 'linear-gradient(127deg, rgba(171, 196, 255, 0.20) 28.69%, rgba(171, 196, 255, 0.00) 100%) #0b102280',

  panelCardShadow: '0px 8px 24px rgba(79, 83, 243, 0.12)',
  panelCardBorder: 'unset'
}

export const lightColors: Partial<typeof darkColors> = {
  // app main color
  primary: pcsLightColors.primary,
  primary10: pcsLightColors.primary10,
  primary20: pcsLightColors.primary20,
  primary60: pcsLightColors.primary60,
  destructive10: pcsLightColors.destructive10,
  destructive20: pcsLightColors.destructive20,
  destructive60: pcsLightColors.destructive60,
  destructive: pcsLightColors.destructive,
  positive60: pcsLightColors.positive60,
  secondary: pcsLightColors.secondary,
  secondary10: 'rgba(34, 209, 248, 0.1)',
  secondary20: pcsLightColors.secondary20,
  secondary60: pcsLightColors.secondary60,

  // component color
  background: pcsLightColors.background,
  backgroundAlt: pcsLightColors.backgroundAlt,
  backgroundDisabled: pcsLightColors.backgroundDisabled,
  gradientBubblegum: pcsLightColors.gradientBubblegum,
  backgroundOverlay: pcsLightColors.backgroundOverlay,
  backgroundDark: '#EDEDFF',
  backgroundDark50: '#EDEDFF80',
  backgroundMedium: '#EDEDFF',
  backgroundLight: '#F5F8FF',
  backgroundLight50: '#F5F8FF88',
  backgroundLight30: '#F5F8FF4d',
  backgroundTransparent12: 'rgba(171, 196, 255, 0.12)',
  backgroundTransparent07: 'rgba(171, 196, 255, 0.07)',
  backgroundTransparent10: 'rgba(171, 196, 255, 0.1)',

  // text
  textPrimary: pcsLightColors.text,
  textSecondary: pcsLightColors.secondary,
  textSubtle: pcsLightColors.textSubtle,
  textDisabled: pcsLightColors.textDisabled,
  textTertiary: '#474ABB99',
  textRevertPrimary: '#ECF5FF',

  textLink: '#22D1F8',

  textQuaternary: '#C4D6FF',
  textQuinary: '#1C243E',
  textSenary: 'rgba(196, 214, 255, 0.5)',
  textSeptenary: '#22D1F8',
  textPurple: '#8C6EEF',
  textPink: '#FF4EA3',

  // button
  buttonPrimary: '#4F53F3',
  buttonPrimary__01: '#4F53F3',
  buttonPrimary__02: '#8C6EEF',
  buttonSolidText: '#ECF5FF',
  buttonSecondary: '#39D0D8',

  // switch
  switchOn: '#8C6EEF',
  switchOff: '#8C6EEF80',

  // select
  selectActive: pcsLightColors.textSubtle,
  selectActiveSecondary: '#8C6EEF',
  selectInactive: '#abc4ffef',

  // chart
  chart01: '#abc4ff',
  chart02: '#39D0D8',
  chart03: '#8C6EEF',
  chart04: '#2B6AFF',
  chart05: '#FF7043',
  chart06: '#FED33A',
  chart07: '#4F53F3',
  chart08: '#22D1F8',
  chart09: '#8C6EEF33',

  // Icon
  iconBg: '#8C6EEF',
  iconEmptyStroke: pcsLightColors.primary60,
  iconBorder: pcsLightColors.cardBorder,

  // success/warning/error/info
  success: pcsLightColors.success,
  failure: pcsLightColors.failure,
  warning20: pcsLightColors.warning20,
  warning50: pcsLightColors.yellow,
  semanticSuccess: '#39D0D8',
  semanticError: '#FF4EA3',
  semanticWarning: '#B89900',
  semanticNeutral: '#ABC4FF',
  semanticFocus: '#A259FF',
  semanticFocusShadow: '#A259FF33',

  // Tab
  tabFolderTabListBg: 'var(--background-dark)',

  // Step
  stepActiveBg: 'var(--tertiary)',
  stepHoofBg: 'var(--tertiary)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: '#22D1F8',
  priceFloatingDown: '#FF4EA3',
  priceFloatingFlat: '#888888',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: pcsDarkColors.backgroundAlt,
  tooltipText: pcsDarkColors.text,
  dropdown: pcsLightColors.dropdown,

  invertedContrast: pcsLightColors.invertedContrast,

  popoverBg: '#fff',

  // customize (by V3 frontend coder)
  scrollbarThumb: 'rgba(196, 214, 255, 0.5)',

  // badge
  badgePurple: 'rgba(140, 110, 239, 0.5)',
  badgeBlue: 'rgba(34, 209, 248, 0.5)',

  // divider
  dividerBg: 'rgba(171, 196, 255, 0.3)',

  // input
  input: pcsLightColors.input,
  inputMask: '#fff3',
  inputBorder: pcsLightColors.inputSecondary,
  inputBg: pcsLightColors.input,
  inputSecondary: pcsLightColors.inputSecondary,

  //
  // card
  cardBorder01: pcsLightColors.cardBorder,
  cardBg: pcsLightColors.card,
  cardSecondary: pcsLightColors.cardSecondary,

  // customize (by V3 frontend coder)
  backgroundApp: pcsLightColors.background,

  solidButtonBg: 'linear-gradient(272deg, #4F53F3 2.63%, #8C6EEF 95.31%)',
  outlineButtonBg: 'linear-gradient(270deg, #8C6EEF1a 0%, #4F53F31a 100%)',
  filledProgressBg: 'linear-gradient(270deg, #8C6EEF 0%, #4F53F3 100%)',
  transparentContainerBg: '#F5F8FF',
  modalContainerBg: pcsLightColors.secondary20,
  infoButtonBg: '#ABC4FF33',
  warnButtonBg: '#FED33A33',
  warnButtonLightBg: '#FED33A1A',
  buttonBg01: '#ABC4FF1F',
  lightPurple: pcsLightColors.textSubtle,
  background01: '#EDEDFF',
  background02: '#ABC4FF33',
  background03: '#FF4EA31A',
  text01: '#D6CC56',
  text02: '#000',
  text03: '#474ABB',
  tertiary: pcsLightColors.tertiary,
  /** it's designer's variable name in Figma */
  brandGradient: 'linear-gradient(244deg, #7748FC 8.17%, #39D0D8 101.65%)',
  dividerDashGradient: 'repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px)',

  tokenAvatarBg: 'linear-gradient(127deg, rgba(171, 196, 255, 0.20) 28.69%, rgba(171, 196, 255, 0.00) 100%) #fffe',

  panelCardShadow: 'none',
  panelCardBorder: '1px solid rgba(171, 196, 255, 0.50)'
}
/**
 * note: it is not colors value, but colors css variable
 * color info may change in run-time by setting page, so use runtime css variable
 */
export const colors = {
  // app main bg color
  primary: 'var(--primary)',
  primary10: 'var(--primary10)',
  primary20: 'var(--primary20)',
  primary60: 'var(--primary60)',
  destructive10: 'var(--destructive10)',
  destructive20: 'var(--destructive20)',
  destructive60: 'var(--destructive60)',
  destructive: 'var(--destructive)',
  positive60: 'var(--positive60)',
  secondary: 'var(--secondary)',
  secondary10: 'var(--secondary10)',
  secondary20: 'var(--secondary20)',
  secondary60: 'var(--secondary60)',

  // component color
  background: 'var(--background)',
  backgroundAlt: 'var(--background-alt)',
  backgroundDisabled: 'var(--background-disabled)',
  backgroundDark: 'var(--background-dark)',
  backgroundDark50: 'var(--background-dark50)',
  backgroundMedium: 'var(--background-medium)',
  backgroundLight: 'var(--background-light)',
  backgroundLight50: 'var(--background-light50)',
  backgroundLight30: 'var(--background-light30)',
  backgroundTransparent12: 'var(--background-transparent12)',
  backgroundTransparent07: 'var(--background-transparent07)',
  backgroundTransparent10: 'var(--background-transparent10)',
  backgroundOverlay: 'var(--background-overlay)',
  gradientBubblegum: 'var(--background-gradient-bubblegum)',

  // text
  /** white */
  textPrimary: 'var(--text-primary)',
  /** #abc4ff */
  textSecondary: 'var(--text-secondary)',
  textSubtle: 'var(--text-subtle)',
  textDisabled: 'var(--text-disabled)',
  /** #abc4ff80 */
  textTertiary: 'var(--text-tertiary)',
  textRevertPrimary: 'var(--text-revert-primary)',

  textLink: 'var(--text-link)',

  textQuaternary: 'var(--text-quaternary)',
  textQuinary: 'var(--text-quinary)',
  textSenary: 'var(--text-senary)',
  textSeptenary: 'var(--text-septenary)',
  textPurple: 'var(--text-purple)',
  textPink: 'var(--text-pink)',

  // button
  buttonPrimary: 'var(--button-primary)',
  buttonPrimary__01: 'var(--button-primary__01)',
  buttonPrimary__02: 'var(--button-primary__02)',
  buttonSolidText: 'var(--button-solid-text)',
  buttonSecondary: 'var(--button-secondary)',

  // switch
  switchOn: 'var(--switch-on)',
  switchOff: 'var(--switch-off)',
  selectActive: 'var(--select-active)',
  selectActiveSecondary: 'var(--select-active-secondary)',
  selectInactive: 'var(--select-inactive)',

  // chart
  chart01: 'var(--chart01)',
  chart02: 'var(--chart02)',
  chart03: 'var(--chart03)',
  chart04: 'var(--chart04)',
  chart05: 'var(--chart05)',
  chart06: 'var(--chart06)',
  chart07: 'var(--chart07)',
  chart08: 'var(--chart08)',
  chart09: 'var(--chart09)',

  // Icon
  iconBg: 'var(--icon-bg)',
  iconEmptyStroke: 'var(--icon-empty-stroke)',
  iconBorder: 'var(--icon-border)',

  // success/warning/error/info
  success: 'var(--success)',
  failure: 'var(--failure)',
  warning20: 'var(---warning20)',
  warning50: 'var(---warning50)',
  semanticSuccess: 'var(--semantic-success)',
  semanticError: 'var(--semantic-error)',
  semanticWarning: 'var(--semantic-warning)',
  semanticNeutral: 'var(--semantic-neutral)',
  semanticFocus: 'var(--semantic-focus)',
  semanticFocusShadow: 'var(--semantic-focus-shadow)',

  // Tab
  tabFolderTabListBg: 'var(--tab-folder-tab-list-bg)',

  // Step
  stepActiveBg: 'var(--step-active-bg)',
  stepHoofBg: 'var(--step-hoof-bg)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: 'var(--price-floating-up)',
  priceFloatingDown: 'var(--price-floating-down)',
  priceFloatingFlat: 'var(--price-floating-flat)',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: 'var(--tooltip-bg)',
  tooltipText: 'var(--tooltip-text)',
  dropdown: 'var(--dropdown)',

  invertedContrast: 'var(--inverted-contrast)',

  popoverBg: 'var(--popover-bg)',

  // customize component theme (by V3 frontend coder)
  scrollbarThumb: 'var(--scrollbar-thumb)',

  // badge
  badgePurple: 'var(--badge-purple)',
  badgeBlue: 'var(--badge-blue)',

  // divider
  dividerBg: 'var(--divider-bg)',

  // input
  input: 'var(--input)',
  inputMask: 'var(--input-mask)',
  inputBorder: 'var(--input-border)',
  inputBg: 'var(--input-bg)',
  inputSecondary: 'var(--input-secondary)',

  // card
  cardBorder01: 'var(--card-border-01)',
  cardBg: 'var(--card-bg)',
  cardSecondary: 'var(--card-secondary)',

  // customize (by V3 frontend coder)
  backgroundApp: 'var(--background-app)',
  solidButtonBg: 'var(--solid-button-bg)',
  outlineButtonBg: 'var(--outline-button-bg)',
  filledProgressBg: 'var(--filled-progress-bg)',
  transparentContainerBg: 'var(--transparent-container-bg)',
  modalContainerBg: 'var(--modal-container-bg)',
  infoButtonBg: 'var(--info-button-bg)',
  warnButtonBg: 'var(--warn-button-bg)',
  warnButtonLightBg: 'var(--warn-button-light-bg)',
  buttonBg01: 'var(--button-bg-01)',
  lightPurple: 'var(--divider-bg-light-purple)',
  background01: 'var(--background-01)',
  background02: 'var(--background-02)',
  background03: 'var(--background-03)',
  text01: 'var(--text-01)',
  text02: 'var(--text-02)',
  text03: 'var(--text-03)',
  tertiary: 'var(--tertiary)',
  /** it's designer's variable name in Figma */
  brandGradient: 'var(--brand-gradient)',
  dividerDashGradient: 'var(--divider-dash-gradient)',

  tokenAvatarBg: 'var(--token-avatar-bg)',

  panelCardShadow: 'var(--panel-card-shadow)',
  panelCardBorder: 'var(--panel-card-border)'
}
