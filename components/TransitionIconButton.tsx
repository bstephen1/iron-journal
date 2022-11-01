import { Grow, IconButton, IconButtonProps } from '@mui/material'

interface Props extends IconButtonProps {
  isVisible?: boolean
  children?: JSX.Element
}
export default function TransitionIconButton({
  isVisible = true,
  children,
  ...iconButtonProps
}: Props) {
  return (
    <Grow in={isVisible}>
      <IconButton {...iconButtonProps}>{children}</IconButton>
    </Grow>
  )
}
