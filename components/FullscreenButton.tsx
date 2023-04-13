import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import { Box, IconButton } from '@mui/material'
import { useState } from 'react'

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const elem = document.querySelector('body')

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      document.exitFullscreen()
    } else {
      await elem?.requestFullscreen()
    }
  }

  // Components don't re-render when document changes, so have to add an event listener.
  // User could exit fullscreen via eg keyboard, not just the button, so this prevents
  // the button from getting out of sync.
  addEventListener('fullscreenchange', () => {
    setIsFullscreen(!!document.fullscreenElement)
  })

  return (
    <Box px={1}>
      <IconButton color="secondary" onClick={toggleFullscreen}>
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Box>
  )
}
