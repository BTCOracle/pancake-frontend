import { QRCodeSVG } from 'qrcode.react'

const QRCode = ({
  url,
  image,
  size = 288,
  logoSize = 72,
}: {
  url: string
  image?: string
  size?: number
  logoSize?: number
}) => (
  <QRCodeSVG
    value={url}
    size={size}
    level="H"
    includeMargin
    imageSettings={
      image
        ? {
            src: image,
            x: undefined,
            y: undefined,
            height: logoSize,
            width: logoSize,
            excavate: true,
          }
        : undefined
    }
  />
)

export default QRCode
