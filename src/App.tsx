import React, {useRef} from 'react'

const App = ({width,height}:{
  width: number;
  height: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <>
    <canvas ref={canvasRef} height={height} width={width} />
    </>
  )
}

App.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export default App;
