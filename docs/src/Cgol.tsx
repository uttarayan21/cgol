import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import { Universe, Cell } from "cgol";
import { memory } from "cgol/cgol_bg.wasm";
import React from "react";

interface CgolProps {
  cellRadius?: number;
  width?: number;
  height?: number;
  aliveColor?: string;
  deadColor?: string;
}

interface CgolState {
  cellRadius: number;
  width: number;
  height: number;
  aliveColor: string;
  deadColor: string;
}

class Cgol extends React.Component<CgolProps, CgolState> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  universe: Universe;
  animationRequestId: number | null;
  constructor(props: CgolProps) {
    super(props);
    this.canvasRef = React.createRef();
    this.canvas = null;
    this.ctx = null;
    this.animationRequestId = null;
    let state: CgolState = {
      cellRadius: 10,
      width: Math.floor(window.innerWidth / 10),
      height: Math.floor(window.innerHeight / 10),
      deadColor: "#FFFFFF",
      aliveColor: "#000000",
    };

    if (this.props.cellRadius) {
      state.cellRadius = this.props.cellRadius;
    }
    if (this.props.width) {
      state.width = this.props.width;
    }
    if (this.props.height) {
      state.height = this.props.height;
    }
    if (this.props.deadColor) {
      state.deadColor = this.props.deadColor;
    }
    if (this.props.aliveColor) {
      state.aliveColor = this.props.aliveColor;
    }
    this.state = state;
    console.log(this.state);
    this.universe = Universe.new(state.width, state.height);
    this.universe.random();

    // Bind functions with this
    this.getIndex = this.getIndex.bind(this);
    this.drawCellGrids = this.drawCellGrids.bind(this);
    this.drawCells = this.drawCells.bind(this);
    this.renderLoop = this.renderLoop.bind(this);
    this.stopRenderLoop = this.stopRenderLoop.bind(this);
  }
  getContext() {
    this.canvas = this.canvasRef.current;
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
    }
  }
  componentDidMount() {
    this.getContext();
    this.drawCellGrids();
    requestAnimationFrame(this.renderLoop);
  }
  getIndex(column: number, row: number) {
    return row * this.state.width + column;
  }
  drawCellGrids() {
    let count = 0;
    for (let r = 0; r < this.state.height; r++) {
      for (let c = 0; c < this.state.width; c++) {
        console.log(r, c, ++count);
        this.ctx?.moveTo((c + 1) * 2 * this.state.cellRadius, (r * 2 + 1) * this.state.cellRadius);
        this.ctx?.arc(
          (2 * c + 1) * this.state.cellRadius,
          (2 * r + 1) * this.state.cellRadius,
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
    let cells: Uint8Array = new Uint8Array(memory.buffer, cells_ptr, this.state.width * this.state.height);

    for (let r = 0; r < this.state.height; r++) {
      for (let c = 0; c < this.state.width; c++) {
        if (this.ctx) {
          let index = this.getIndex(c, r);
          this.ctx.fillStyle = cells[index] === Cell.Dead ? "#FFFFFF" : "green";
        }
        this.ctx?.beginPath();
        this.ctx?.moveTo((c + 1) * 2 * this.state.cellRadius, (r * 2 + 1) * this.state.cellRadius);
        this.ctx?.arc(
          (2 * c + 1) * this.state.cellRadius,
          (2 * r + 1) * this.state.cellRadius,
          this.state.cellRadius - 0.9,
          0,
          Math.PI * 2
        );
        this.ctx?.fill();
      }
    }
  }

  renderLoop() {
    this.drawCells();
    this.universe.tick();
    this.animationRequestId = requestAnimationFrame(this.renderLoop);
  }
  stopRenderLoop() {
    if (this.animationRequestId) {
      cancelAnimationFrame(this.animationRequestId);
      this.animationRequestId = null;
    } else {
      this.animationRequestId = requestAnimationFrame(this.renderLoop);
    }
  }
  render() {
    return (
      <div>
        <CgolHeader />
        <div>
          <Row className="mb-3 d-flex justify-content-center">
            <Button variant="info" onClick={this.stopRenderLoop}>
              Pause/Play
            </Button>
            <Button variant="info" onClick={this.universe.random}>
              Random
            </Button>
          </Row>
          <Row className="d-flex justify-content-center">
            <canvas
              width={this.state.width * this.state.cellRadius * 2}
              height={this.state.height * this.state.cellRadius * 2}
              ref={this.canvasRef}
            ></canvas>
          </Row>
        </div>
      </div>
    );
  }
}

class CgolHeader extends React.Component {
  render() {
    return (
      <Navbar bg="dark" variant="dark" className="mb-4 justify-content-between">
        <Navbar.Brand>Conway's Game Of Life</Navbar.Brand>
      </Navbar>
    );
  }
}

export default Cgol;
