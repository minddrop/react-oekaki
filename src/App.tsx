import React, { useCallback, useEffect, useRef, useState } from 'react'

type Coordinate = {
  x: number
  y: number
}

type Pointer = {
  x: number
  y: number
}

const getSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

const App = ({ width, height }: { width: number; height: number }) => {
  const [isPainting, setIsPainting] = useState(false)
  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(
    undefined
  )
  const [size, setSize] = useState({ width, height })

  const startPaint = useCallback((pointer: Pointer) => {
    const coordinates = getCoordinates(pointer)
    if (coordinates) {
      setIsPainting(true)
      setMousePosition(coordinates)
    }
  }, [])

  const mouseEventModifier = useCallback((event: MouseEvent) => {
    const pointer = { x: event.pageX, y: event.pageY }
    return pointer
  }, [])

  const touchEventModifier = useCallback((event: TouchEvent) => {
    event.preventDefault()
    const pointer = { x: event.touches[0].pageX, y: event.touches[0].pageY }
    return pointer
  }, [])

  const getCoordinates = (p: Pointer): Coordinate | undefined => {
    if (!canvasRef.current) return
    const canvas: HTMLCanvasElement = canvasRef.current
    return {
      x: p.x - canvas.offsetLeft,
      y: p.y - canvas.offsetTop
    }
  }

  const paint = useCallback(
    (pointer: Pointer) => {
      if (isPainting) {
        const newMousePosition = getCoordinates(pointer)
        if (mousePosition && newMousePosition) {
          drawLine(mousePosition, newMousePosition)
          setMousePosition(newMousePosition)
        }
      }
    },
    [isPainting, mousePosition]
  )

  const startMousePaint = useCallback(
    mouseEvent => {
      const pointerEvent = mouseEventModifier(mouseEvent)
      startPaint(pointerEvent)
    },
    [mouseEventModifier, startPaint]
  )

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas: HTMLCanvasElement = canvasRef.current
    canvas.addEventListener('mousedown', startMousePaint)
    return () => {
      canvas.removeEventListener('mousedown', startMousePaint)
    }
  }, [mouseEventModifier, startMousePaint])

  const mousePaint = useCallback(
    (mouseEvent: MouseEvent) => {
      const pointerEvent = mouseEventModifier(mouseEvent)
      paint(pointerEvent)
    },
    [mouseEventModifier, paint]
  )

  const startTouchPaint = useCallback(
    touchEvent => {
      const pointerEvent = touchEventModifier(touchEvent)
      startPaint(pointerEvent)
    },
    [startPaint, touchEventModifier]
  )

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas: HTMLCanvasElement = canvasRef.current
    canvas.addEventListener('touchstart', startTouchPaint)
    return () => {
      canvas.removeEventListener('touchstart', startTouchPaint)
    }
  }, [startTouchPaint, touchEventModifier])

  const drawLine = (from: Coordinate, to: Coordinate) => {
    if (!canvasRef.current) return
    const context = canvasRef.current.getContext('2d')
    if (context) {
      context.strokeStyle = 'red'
      context.lineJoin = 'round'
      context.lineWidth = 5
      context.beginPath()
      context.moveTo(from.x, from.y)
      context.lineTo(to.x, to.y)
      context.closePath()
      context.stroke()
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.addEventListener('mousemove', mousePaint)
    return () => {
      canvas.removeEventListener('mousemove', mousePaint)
    }
  }, [mousePaint, paint])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.addEventListener('touchmove', touchPaint)
    return () => {
      canvas.removeEventListener('touchmove', touchPaint)
    }
  })

  const touchPaint = useCallback(
    touchEvent => {
      const pointerEvent = touchEventModifier(touchEvent)
      paint(pointerEvent)
    },
    [paint, touchEventModifier]
  )

  const exitPaint = useCallback(() => {
    setIsPainting(false)
  }, [])

  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
    setSize(getSize())
    if (!imageData) return
    ctx?.putImageData(imageData, 0, 0)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.addEventListener('mouseup', exitPaint)
    canvas.addEventListener('mouseleave', exitPaint)
    canvas.addEventListener('touched', exitPaint, false)
    return () => {
      canvas.removeEventListener('mouseup', exitPaint)
      canvas.removeEventListener('mouseleave', exitPaint)
      canvas.removeEventListener('touched', exitPaint)
    }
  }, [exitPaint])

  useEffect(() => {
    if (!canvasRef.current) return
    window.addEventListener('resize', resizeCanvas)
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  return (
    <>
      <span>
        height:{size.height} width:{size.width}
      </span>
      <canvas ref={canvasRef} height={size.height} width={size.width} />
    </>
  )
}

App.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight
}

export default App
