import { forwardRef } from 'react'
import { SvgIcon } from '../type'

export default forwardRef(function SwapPoolItemIcon(props: SvgIcon, ref: any) {
  const { width = 14, height = 14, color = '#7A6EAA', strokeWidth = 1, ...rest } = props
  return (
    <svg ref={ref} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="chakra-icon" {...rest}>
      <path
        d="M0.57274 9.98627H10.9675L8.64605 12.9303L8.64602 12.9303C8.47076 13.1527 8.62675 13.4863 8.9156 13.4863H10.2102C10.3587 13.4863 10.4986 13.4192 10.5919 13.3016L10.5923 13.3011L13.6066 9.47796L13.6068 9.47771C14.0044 8.97167 13.6452 8.22913 12.9995 8.22913H0.57274C0.383703 8.22913 0.229883 8.38297 0.229883 8.57199V9.64342C0.229883 9.83246 0.383722 9.98627 0.57274 9.98627ZM5.35658 1.07082L5.35659 1.07081C5.53192 0.84843 5.37581 0.514844 5.08703 0.514844H3.79238C3.6439 0.514844 3.50412 0.58195 3.41082 0.699318L3.41032 0.699945L0.396039 4.52316L0.395833 4.52343C-0.00137421 5.02896 0.356764 5.77199 1.00131 5.77199H13.4299C13.6191 5.77199 13.7727 5.61802 13.7727 5.42913V4.3577C13.7727 4.16881 13.6191 4.01484 13.4299 4.01484H3.03514L5.35658 1.07082Z"
        fill={color}
        stroke={color}
        strokeWidth={parseFloat(strokeWidth.toString()) * 0.2}
      />
    </svg>
  )
})
