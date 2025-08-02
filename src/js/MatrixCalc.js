class MatrixCalc {
  static inverseMatrix(matrix) {
    const n = matrix.length;
    const identity = this.#generateIdentityMatrix(n);

    // Construct an extended array [array | identity]
    const augmentedMatrix = [];
    for (let i = 0; i < n; i++) {
      augmentedMatrix.push([...matrix[i], ...identity[i]]);
    }

    // Gauss-Jordan elimination
    for (let i = 0; i < n; i++) {
      // Swap rows if the pivot is zero
      if (augmentedMatrix[i][i] === 0) {
        for (let j = i + 1; j < n; j++) {
          if (augmentedMatrix[j][i] !== 0) {
            [augmentedMatrix[i], augmentedMatrix[j]] = [augmentedMatrix[j], augmentedMatrix[i]];
            break;
          }
        }
      }

      // Make the pivot equal to 1
      const pivot = augmentedMatrix[i][i];
      for (let j = i; j < 2 * n; j++) {
        augmentedMatrix[i][j] /= pivot;
      }

      // Make zeros in the other rows
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const coefficient = augmentedMatrix[j][i];
          for (let k = i; k < 2 * n; k++) {
            augmentedMatrix[j][k] -= coefficient * augmentedMatrix[i][k];
          }
        }
      }
    }

    // Extract the inverse matrix
    const inverseMatrix = augmentedMatrix.map((row) => row.slice(n));

    return inverseMatrix;
  }

  static #generateIdentityMatrix(n) {
    const identityMatrix = [];
    for (let i = 0; i < n; i++) {
      const row = Array(n).fill(0);
      row[i] = 1;
      identityMatrix.push(row);
    }
    return identityMatrix;
  }

  //  FirstMatrix.columns === secondMatrix.rows 
  static multiplyMatrix(firstMatrix, secondMatrix) {
    const rowsFirstMatrix = firstMatrix.length;
    const columnsFirstMatrix = firstMatrix[0].length;
    const columnsSecondMatrix = secondMatrix[0].length;

    // Comprobar si las matrices se pueden multiplicar
    if (columnsFirstMatrix !== secondMatrix.length) {
      throw new Error("Las matrices no se pueden multiplicar");
    }

    // Crear matriz resultante
    let result = new Array(rowsFirstMatrix);
    for (let i = 0; i < rowsFirstMatrix; i++) {
      result[i] = new Array(columnsSecondMatrix);
    }

    // Calcular el producto de las matrices
    for (let i = 0; i < rowsFirstMatrix; i++) {
      for (let j = 0; j < columnsSecondMatrix; j++) {
        let suma = 0;
        for (let k = 0; k < columnsFirstMatrix; k++) {
          suma += firstMatrix[i][k] * secondMatrix[k][j];
        }
        result[i][j] = suma;
      }
    }

    // console.log(firstMatrix);
    // console.log(secondMatrix);
    // console.log(result);
    return result;
  }

  // [[]] - [[]]
  static subtractMatrices(firstMatrix, secondMatrix) {
    if (firstMatrix[0].length !== secondMatrix[0].length) {
      throw new Error('Matrices must have the same dimensions');
    }

    const rows = firstMatrix.length;
    const columns = firstMatrix[0].length;
    const result = [];

    for (let i = 0; i < rows; i++) {
      result[i] = [];
      for (let j = 0; j < columns; j++) {
        result[i][j] = (+firstMatrix[i][j]).toFixed(2) - +secondMatrix[i][j].toFixed(2);
      }
    }

    return result;
  }

  static roundMatrix(matrix) {
    const roundResult = matrix.map(row => {
      const [value] = row; 
      return [(+value.toFixed(2))];
    })

    return roundResult;
  }

  static transposedMatrix(matrix) {
    const transposedResult = [matrix.flat()]; 
    return transposedResult;
  }

}

// A
const a = [
  [1, 1, 0, 0, 0, 1, 0, 0],
  [1, 0, -1, 0, 0, 0, 1, 0],
  [0, 1, 0, -1, 0, 0, 0, 1,],
  [60, 24, 0, 0, 1, 0, 0, 0]
];

// c
const c = [
  [-120],
  [-200],
  [0],
  [0],
  [0],
  [-1000],
  [-1000],
  [-1000]
];

const cTransposed = MatrixCalc.transposedMatrix(c);

// b
const b = [
  [65],
  [23], 
  [20], 
  [3000]
];

const bTransposed = MatrixCalc.transposedMatrix(b);
// console.log('b transposed', bTransposed);

// bBase
const B = [
  [0, 0, 1, 1],
  [-1, 0, 1, 0],
  [0, -1, 0, 1],
  [0, 0, 60, 24],
]

const bInverse = MatrixCalc.inverseMatrix(B);
// console.log('B inverse: ', bInverse);


// Ct
const cb = [
  [0],
  [0],
  [-120],
  [-200]
];

// const cbTransposed = MatrixCalc.transposedMatrix(cb);
// console.log('cb transposed', cbTransposed);


// // cbt * bInverse
// const cbtPerBInverse = MatrixCalc.multiplyMatrix(cbTransposed, bInverse);
// console.log('cbt * B inverse:', cbtPerBInverse);


// // cbt * bInverse * a
// const cbtPerBInversePerA = MatrixCalc.multiplyMatrix(cbtPerBInverse, a);
// console.log('cbt * B inverse * A:', cbtPerBInversePerA);

// // cbt * bInverse * a - ct
// const r = MatrixCalc.subtractMatrices(cbtPerBInversePerA, cTransposed);
// console.log('r:', r);

// bInverse * b
// const bInversePerB = MatrixCalc.multiplyMatrix(bInverse, b)
// console.log(bInversePerB);

// console.log(MatrixCalc.roundMatrix(bInversePerB));

// const z = MatrixCalc.multiplyMatrix(cbTransposed, bInversePerB).flat()[0];
// console.log(MatrixCalc.multiplyMatrix(cbTransposed, bInversePerB).flat()[0]);
