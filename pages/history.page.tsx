import {
  Box,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Switch,
  TextField,
  useMediaQuery,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import dayjs from 'dayjs'

import StyledDivider from 'components/StyledDivider'
import { DATE_FORMAT, DEFAULT_CLOTHING_OFFSET } from 'lib/frontend/constants'
import {
  useBodyweightHistory,
  useExercises,
  useRecords,
} from 'lib/frontend/restService'
import Bodyweight from 'models/Bodyweight'
import Exercise from 'models/AsyncSelectorOption/Exercise'
import { useQueryState } from 'next-usequerystate'
import { useEffect, useMemo, useState } from 'react'
import { useMeasure } from 'react-use'
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ComboBoxField } from 'components/form-fields/ComboBoxField'
import SelectFieldAutosave from 'components/form-fields/SelectFieldAutosave'
import SetTypeSelect from 'components/session/records/SetTypeSelect'
import {
  ArrayMatchType,
  ArrayMatchTypeDescription,
} from 'models/query-filters/MongoQuery'
import ExerciseSelector from 'components/form-fields/selectors/ExerciseSelector'
import { RecordQuery } from 'models/query-filters/RecordQuery'
import { DB_UNITS } from 'models/Set'
import { DEFAULT_SET_TYPE } from 'models/Record'

interface GraphBodyweight extends Bodyweight {
  epochDate: number
}

// todo: filter should be passable as url query so you can direct link to the page from a specific record?
export default function HistoryPage() {
  const { exercises, mutate: mutateExercises } = useExercises()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const { data: bodyweightData } = useBodyweightHistory()
  const [showBodyweight, setShowBodyweight] = useState(true)
  const [includeUnofficial, setIncludeUnofficial] = useState(false)
  const [clothingOffset, setClothingOffset] = useState(DEFAULT_CLOTHING_OFFSET)
  const [showSmoothedBw, setShowSmoothedBw] = useState(false)
  const [recordQuery, setRecordQuery] = useState<RecordQuery>({})
  const [setType, setSetType] = useState(DEFAULT_SET_TYPE)

  const { records } = useRecords(recordQuery)

  const updateFilter = (changes: RecordQuery) =>
    setRecordQuery((prevFilter) => ({ ...prevFilter, ...changes }))

  const [urlExercise, setUrlExercise] = useQueryState('exercise')
  const isDesktop = useMediaQuery('(pointer: fine)')

  const unofficialBWs = useMemo(
    () => bodyweightData?.filter((bw) => bw.type === 'unofficial'),
    [bodyweightData]
  )
  const officialBWs = useMemo(
    () => bodyweightData?.filter((bw) => bw.type === 'official'),
    [bodyweightData]
  )

  // to track width we want to use the size of the graph container, since that will be smaller than window width
  const [graphContainerRef, { width: graphContainerWidth }] = useMeasure()

  // Track the full window height so the graph can be fullscreen.
  // Have to init as 0 so nextjs doesn't error out in SSR trying to find the window.
  const [windowHeight, setWindowHeight] = useState(0)
  useEffect(() => {
    setWindowHeight(window.innerHeight)
    const handleWindowResize = () => {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleWindowResize)
    // supposedly removing eventListener on return prevents memory leaks
    return window.removeEventListener('resize', handleWindowResize)
  }, [])

  const graphBodyweightData = useMemo((): GraphBodyweight[] => {
    if (!unofficialBWs || !officialBWs) return []

    const officialData = showBodyweight ? officialBWs : []

    const unofficialData = includeUnofficial
      ? unofficialBWs
          .map((bw) => ({ ...bw, value: bw.value - clothingOffset }))
          // ignore unofficial weigh-ins if an official weigh-in for that day exists
          .filter(
            (bw) =>
              !officialData.some((officialBw) => officialBw.date === bw.date)
          )
      : []

    const data = [...unofficialData, ...officialData]

    return data
      .map((bw) => ({ ...bw, epochDate: dayjs(bw.date).unix() }))
      .sort((a, b) => a.epochDate - b.epochDate)
  }, [
    unofficialBWs,
    officialBWs,
    showBodyweight,
    includeUnofficial,
    clothingOffset,
  ])

  // add epochDate
  // add representative value...? Like, find highest weight in all sets... or most reps? total reps? largest distance? lowest time? longest time?
  // representative value super flexible... could make it a select box
  // hmm... kinda feels like it might be better to just show history cards, not a graph
  // but the graph seems like it would be nice for visualizing 1RM over time (or 6RM, etc).
  // Wouldn't the main thing be ensuring you are doing progressive overload tho?
  // So in that case you'd want to make sure volume is going up. Which includes reps, sets, weight.
  // But it's not just weights x reps x sets because that only incentivizes high reps.

  // const graphRecordData = useMemo(() => {
  //   return records.map
  // })

  const convertEpochToDate = (value: number) =>
    dayjs.unix(value).format('YYYY-MM-DD')

  const getStartIndex = (dayRange = 60) => {
    let i = graphBodyweightData.length - 1

    if (i < 0) return 0

    let mostRecentDate = graphBodyweightData[i].date
    const startDate = dayjs(mostRecentDate)
      .add(-dayRange, 'day')
      .format(DATE_FORMAT)

    while (mostRecentDate > startDate) {
      // return if we reached the beginning of the array without hitting the limit
      if (!i) return i

      mostRecentDate = graphBodyweightData[--i].date
    }

    // if we did hit the limit we've gone past it by one
    return i + 1
  }

  // todo: scroll snap?
  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <ExerciseSelector
          exercise={exercise}
          handleChange={(exercise) => {
            setExercise(exercise)
            updateFilter({ exercise: exercise?.name })
          }}
          exercises={exercises}
          mutate={mutateExercises}
          variant="standard"
        />
      </Grid>
      <Grid xs={12} sm={6}>
        <ComboBoxField
          label="Modifiers"
          emptyPlaceholder="No filter"
          options={exercise?.modifiers ?? []}
          initialValue={[]}
          variant="standard"
          handleSubmit={(modifier) => updateFilter({ modifier })}
          helperText=""
        />
      </Grid>
      <Grid xs={12} sm={6}>
        <SelectFieldAutosave
          fullWidth
          label="Modifier Match Type"
          options={Object.values(ArrayMatchType)}
          handleSubmit={(modifierMatchType) =>
            updateFilter({ modifierMatchType })
          }
          initialValue={
            recordQuery.modifierMatchType ?? ArrayMatchType.Equivalent
          }
          variant="standard"
          helperText={ArrayMatchTypeDescription[
            recordQuery.modifierMatchType ?? 'none'
          ].replaceAll('values', 'modifiers')}
        />
      </Grid>
      <Grid xs={12}>
        <SetTypeSelect
          units={DB_UNITS}
          setType={setType}
          handleSubmit={(changes) => {
            setSetType({ ...setType, ...changes })
            updateFilter(changes)
          }}
          sets={[]}
          emptyOption="no filter"
        />
      </Grid>
      <Grid xs={8} alignItems="center" display="flex">
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={showBodyweight}
                onChange={() => setShowBodyweight(!showBodyweight)}
              />
            }
            label="Show bodyweight"
          />
          <FormControlLabel
            disabled={!showBodyweight}
            control={
              <Switch
                checked={includeUnofficial}
                onChange={() => setIncludeUnofficial(!includeUnofficial)}
              />
            }
            label="Include unofficial weigh-ins"
          />
          <FormControlLabel
            disabled={!showBodyweight}
            control={
              <Switch
                checked={showSmoothedBw}
                onChange={() => setShowSmoothedBw(!showSmoothedBw)}
              />
            }
            label="Use smoothed line"
          />
        </FormGroup>
      </Grid>
      <Grid xs={4}>
        <TextField
          variant="standard"
          type="number"
          label="clothing offset"
          autoComplete="off"
          value={clothingOffset}
          disabled={!showBodyweight || !includeUnofficial}
          onChange={(e) =>
            setClothingOffset(
              isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)
            )
          }
          onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
          InputProps={{
            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
          }}
        />
      </Grid>
      {/* todo: add multiple exercises */}
      <Grid xs={12}>
        <StyledDivider />
      </Grid>
      <Grid xs={12} height="100%" flex="1 1 auto"></Grid>
      <Grid container xs={12} justifyContent="center">
        {/* apparently Grid can't accept a ref (even though it works...) so adding a Box to capture the container width */}
        <Box ref={graphContainerRef} width="100%" height="100%">
          {bodyweightData && (
            // need to specify a height or the grid and container will both defer to each other and result in zero height
            <ResponsiveContainer height={windowHeight}>
              <LineChart
                data={graphBodyweightData}
                margin={{
                  top: 20,
                  right: 5,
                  left: 15,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="epochDate"
                  type="number"
                  tickFormatter={(value) =>
                    dayjs.unix(value).format(DATE_FORMAT)
                  }
                  domain={['auto', 'auto']}
                  angle={-25}
                  scale="time"
                  textAnchor="end"
                  tickMargin={10}
                  height={80}
                />
                <YAxis
                  name="weight"
                  dataKey="value"
                  type="number"
                  unit=" kg"
                  domain={['auto', 'auto']}
                ></YAxis>
                {/* line color is "stroke" */}
                {showSmoothedBw ? (
                  <Line
                    name="bodyweight (smoothed)"
                    dataKey="value"
                    type="basis"
                  />
                ) : (
                  <Line name="bodyweight" dataKey="value" type="monotone" />
                )}
                {/* need to add record data to the same data set, and I guess also sort by epochDate. And combine with BW so if a record and bodyweight have the same date they'd be the same data point */}
                {/* {exercise && (
                  <Line name={exercise.name} dataKey="value" type="monotone" />
                )} */}
                <Tooltip
                  trigger={isDesktop ? 'hover' : 'click'}
                  labelFormatter={convertEpochToDate}
                  formatter={(value, _, { payload }) =>
                    `${value} kg${
                      payload.type === 'unofficial' ? ' (unofficial)' : ''
                    }`
                  }
                />
                {/* todo: only show if multiple lines */}
                <Legend verticalAlign="top" height={30} />
                <Brush
                  dataKey="epochDate"
                  tickFormatter={convertEpochToDate}
                  // these doesn't accept percentages...
                  width={graphContainerWidth * 0.6}
                  // could only eyeball this trying to get it centered.
                  x={graphContainerWidth * 0.2}
                  // todo: startIndex ~30 days prior to highest date
                  startIndex={getStartIndex()}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}
