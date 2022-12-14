import {
  Box,
  Chip,
  ChipProps,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { NamedObject } from '../../../models/NamedObject'

interface Props {
  selected: NamedObject | NamedObject[]
  multiple?: boolean
}
export default function TagChips({ selected, multiple }: Props) {
  const theme = useTheme()
  // todo: can monitor length of note and if it is overflowing?
  const displayedTagsAmount = useMediaQuery(theme.breakpoints.up('sm')) ? 2 : 1

  const tagPluralOrSingle = multiple ? 'tags' : 'tag'
  selected = Array.isArray(selected) ? selected : [selected]

  const StyledChip = (props: ChipProps) => (
    <Chip {...props} sx={{ cursor: 'inherit', ...props.sx }} />
  )

  console.log(selected)
  return (
    <Tooltip title={'add ' + tagPluralOrSingle}>
      <Box
        sx={{
          display: 'flex',
          // flexWrap: 'wrap',
          gap: 0.5,
        }}
      >
        {
          selected.length ? (
            selected.slice(0, displayedTagsAmount + 1).map((value, i) =>
              i < displayedTagsAmount ? (
                <StyledChip key={value._id} label={value.name} />
              ) : (
                <StyledChip
                  key={value.name}
                  // @ts-ignoreNext typescript being dumb
                  label={`+${selected.length - displayedTagsAmount}...`}
                />
              )
            )
          ) : (
            <StyledChip
              label={'no ' + tagPluralOrSingle}
              color="default"
              sx={{ fontStyle: 'italic' }}
            />
          )
          // : <Tag color="primary" />
        }
      </Box>
    </Tooltip>
  )
}
