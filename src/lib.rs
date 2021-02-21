// mod utils;
use std::fmt;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// #[wasm_bindgen]
// extern "C" {
//     fn alert(s: &str);
// }

// #[wasm_bindgen]
// pub fn greet() {
//     alert("Hello, cgol!");
// }
#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl Universe {
    // Note we are using the indices with 0,1,2 not 1,2,3
    fn index(&self, column: u32, line: u32) -> Option<usize> {
        let index: usize = (column + line * self.width) as usize;
        if index > (self.height * self.width) as usize {
            return None;
        } else {
            return Some(index);
        }
    }
    fn live_neighbours(&self, column: u32, line: u32) -> u8 {
        let mut count = 0;
        // Here the delta_line line is the amount of line that is to be moved
        // We use self.height - 1 instead of -1 is because in case of line 0 it fails
        // and we want to wrap the world to the edges
        // cloned is probably not nessacary for simple u8's
        for delta_line in [self.height - 1, 0, 1].iter().cloned() {
            for delta_column in [self.width - 1, 0, 1].iter().cloned() {
                if delta_line == 0 && delta_column == 0 {
                    // It becomes the same element
                    continue;
                }
                let neighbour_line = (line + delta_line) % self.height;
                let neighbour_column = (column + delta_column) % self.width;
                let index = self.index(neighbour_column, neighbour_line).unwrap();
                count += self.cells[index] as u8;
            }
        }

        return count;
    }
}

// This impl is only for exporting functions to js
#[wasm_bindgen]
impl Universe {
    pub fn new(width: u32, height: u32) -> Self {
        // pub fn new() -> Self {
        // let width = 64;
        // let height = 64;

        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 || i % 17 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();
        Self {
            width,
            height,
            cells,
        }
    }
    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn tick(&mut self) {
        let mut next_state = self.cells.clone();

        for line in 0..self.height {
            for column in 0..self.width {
                let index = self.index(column, line).unwrap();
                let cell = self.cells[index];
                let new_cell_state = match (cell, self.live_neighbours(column, line)) {
                    (Cell::Alive, live) => match live {
                        0 | 1 => Cell::Dead,
                        2 | 3 => Cell::Alive,
                        _ => Cell::Dead,
                    },
                    (Cell::Dead, 3) => Cell::Alive,
                    (same, _) => same,
                };
                next_state[index] = new_cell_state;
            }
        }
        self.cells = next_state;
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // chunks will seperate the array of cells in chunks of size self.width
        // so each chunk is basically a line
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                write!(
                    f,
                    "{}",
                    match cell {
                        Cell::Dead => '◻',
                        Cell::Alive => '◼',
                    }
                )?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}
