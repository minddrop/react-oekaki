import React, { useCallback, useEffect, useRef, useState } from 'react'

type Coordinate = {
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

  const startPaint = useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event)
    if (coordinates) {
      setIsPainting(true)
      setMousePosition(coordinates)
    }
  }, [])

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) return
    const canvas: HTMLCanvasElement = canvasRef.current
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas: HTMLCanvasElement = canvasRef.current
    canvas.addEventListener('mousedown', startPaint)
    return () => {
      canvas.removeEventListener('mousedown', startPaint)
    }
  }, [startPaint])

  const paint = useCallback(
    (event: MouseEvent) => {
      if (isPainting) {
        const newMousePosition = getCoordinates(event)
        if (mousePosition && newMousePosition) {
          drawLine(mousePosition, newMousePosition)
          setMousePosition(newMousePosition)
        }
      }
    },
    [isPainting, mousePosition]
  )

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
    canvas.addEventListener('mousemove', paint)
    return () => {
      canvas.removeEventListener('mousemove', paint)
    }
  }, [paint])

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
    return () => {
      canvas.removeEventListener('mouseup', exitPaint)
      canvas.removeEventListener('mouseleave', exitPaint)
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
      <canvas ref={canvasRef} height={size.height} width={size.width} />
    </>
  )
}

App.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight
}

export default App
