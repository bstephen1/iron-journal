import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Skeleton,
} from '@mui/material'
import StyledDivider from 'components/StyledDivider'

interface Props {
  title?: string
  readOnly?: boolean
  Content?: JSX.Element
}
export default function RecordCardSkeleton({
  title = 'Record',
  readOnly,
  Content,
}: Props) {
  return (
    <Card elevation={3} sx={{ px: 1, m: 0.5 }}>
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
      <StyledDivider elevation={0} sx={{ height: 2, my: 0 }} />

      <CardContent>
        {Content ? (
          Content
        ) : (
          <>
            <Skeleton height="50px" />
            <Skeleton height="50px" />
            <Skeleton height="50px" />
          </>
        )}
      </CardContent>
      {!readOnly && (
        <CardActions sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
          <Skeleton variant="circular" height="50px" width="50px" />
        </CardActions>
      )}
    </Card>
  )
}
