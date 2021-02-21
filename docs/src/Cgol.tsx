import { Universe, Cell } from "cgol";
import { memory } from "cgol/cgol_bg.wasm";
import React from "react";
interface CgolProps {
  cellRadius?: number;
  width?: number;
  height?: number;
}

interface CgolState {
  cellRadius: number;
  width: number;
  height: number;
}
class Cgol extends React.Component<CgolProps, CgolState> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  universe: Universe;
  constructor(props: CgolProps) {
    super(props);
    // this.loadWasm();
    this.canvasRef = React.createRef();
    this.canvas = null;
    this.ctx = null;
    let cellRadius = 10;
    let width = Math.floor(window.innerWidth / cellRadius);
    let height = Math.floor(window.innerHeight / cellRadius);
    if (this.props.cellRadius) {
      cellRadius = this.props.cellRadius;
    }
    if (this.props.width) {
      width = this.props.width;
    }
    if (this.props.height) {
      height = this.props.height;
    }

    this.universe = Universe.new(width, height);
    this.state = {
      width: width,
      height: height,
      cellRadius: cellRadius,
    };
    this.renderFrame = this.renderFrame.bind(this);
    this.drawCellGrids = this.drawCellGrids.bind(this);
    this.drawCells = this.drawCells.bind(this);
  }
  getContext() {
    this.canvas = this.canvasRef.current;
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
    }
  }
  componentDidMount() {
    this.getContext();
    this.renderFrame();
  }
  drawCellGrids() {
    for (let r = 0; r <= this.state.height; r++) {
      for (let c = 0; c <= this.state.width; c++) {
        this.ctx?.moveTo((r + 1) * 2 * this.state.cellRadius, (c * 2 + 1) * this.state.cellRadius);
        this.ctx?.arc(
          (2 * r + 1) * this.state.cellRadius,
          (2 * c + 1) * this.state.cellRadius,
          this.state.cellRadius,
          0,
          Math.PI * 2
        );
      }
    }
    this.ctx?.stroke();
  }
  drawCells() {
    let cells_ptr: number = this.universe.cells();
    // let cells: Uint8Array = new Uint8Array(memory.buffer, cells_ptr, width * height);
  }

  async renderFrame() {
    this.drawCellGrids();
  }
  render() {
    return (
      <div className="cgol">
        <canvas
          width={this.state.width * this.state.cellRadius * 2}
          height={this.state.height * this.state.cellRadius * 2}
          ref={this.canvasRef}
        ></canvas>
      </div>
    );
  }
}

export default Cgol;
