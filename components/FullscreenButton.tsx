import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import { Box, IconButton } from '@mui/material'
import { useState } from 'react'

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  let elem: HTMLBodyElement | null = null

  // document doesn't exist in initial server render so need to guard against it
  if (typeof window !== 'undefined') {
    elem = document.querySelector('body')

    // Components don't re-render when document changes, so have to add an event listener.
    // User could exit fullscreen via eg keyboard, not just the button, so this prevents
    // the button from getting out of sync.
    addEventListener('fullscreenchange', () => {
      setIsFullscreen(!!document.fullscreenElement)
    })
  }

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      // this would cause SSR to error if isFullscreen didn't init as false
      document.exitFullscreen()
    } else {
      await elem?.requestFullscreen()
    }
  }

  return (
    <Box px={1}>
      <IconButton color="secondary" onClick={toggleFullscreen}>
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Box>
  )
}
