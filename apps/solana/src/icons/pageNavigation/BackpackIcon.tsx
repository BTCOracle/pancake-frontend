import { SvgIcon } from '../type'

export default function BackpackIcon(props: SvgIcon & { color?: string }) {
  const { color, ...restProps } = props

  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...restProps}>
      <path
        d="M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V6C0 5.06667 0.283333 4.25 0.85 3.55C1.41667 2.85 2.13333 2.38333 3 2.15V0H6V2H10V0H13V2.15C13.8667 2.38333 14.5833 2.85 15.15 3.55C15.7167 4.25 16 5.06667 16 6V18C16 18.55 15.8042 19.0208 15.4125 19.4125C15.0208 19.8042 14.55 20 14 20H2ZM2 18H14V6C14 5.45 13.8042 4.97917 13.4125 4.5875C13.0208 4.19583 12.55 4 12 4H4C3.45 4 2.97917 4.19583 2.5875 4.5875C2.19583 4.97917 2 5.45 2 6V18ZM10.5 14H12.5V10H3.5V12H10.5V14Z"
        fill={color}
      />
    </svg>
  )
}
