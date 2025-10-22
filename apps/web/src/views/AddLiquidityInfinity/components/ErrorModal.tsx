import { AutoColumn, Box, ColumnCenter, ErrorIcon, Modal, ModalProps, Text } from '@pancakeswap/uikit'

export const ErrorModal: React.FC<
  {
    title?: React.ReactNode
    subTitle?: React.ReactNode
  } & ModalProps
> = ({ title, subTitle, ...props }) => {
  return (
    <Modal title={title} headerBackground="transparent" headerBorderColor="transparent" {...props}>
      <Box width="100%">
        <Box mb="16px" padding="16px">
          <ColumnCenter>
            <ErrorIcon strokeWidth={0.5} width="80px" color="failure" />
          </ColumnCenter>
        </Box>
        <AutoColumn gap="12px" justify="center">
          <Text bold textAlign="center" color="failure">
            {subTitle}
          </Text>
        </AutoColumn>
      </Box>
    </Modal>
  )
}
