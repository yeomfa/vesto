function calculateInverse(matrix) {
  const n = matrix.length;
  const identity = generateIdentityMatrix(n);

  // Construir una matriz extendida [matriz | identidad]
  const augmentedMatrix = [];
  for (let i = 0; i < n; i++) {
    augmentedMatrix.push([...matrix[i], ...identity[i]]);
  }

  // Gauss-Jordan eliminación
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

    // Hacer el pivote igual a 1
    const pivot = augmentedMatrix[i][i];
    for (let j = i; j < 2 * n; j++) {
      augmentedMatrix[i][j] /= pivot;
    }

    // Hacer ceros en las otras filas
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const coefficient = augmentedMatrix[j][i];
        for (let k = i; k < 2 * n; k++) {
          augmentedMatrix[j][k] -= coefficient * augmentedMatrix[i][k];
        }
      }
    }
  }

  // Extraer la matriz invers
   const inverseMatrix = augmentedMatrix.map((row) => row.slice(n));

  return inverseMatrix;
}

function generateIdentityMatrix(n) {
  const identityMatrix = [];
  for (let i = 0; i < n; i++) {
    const row = Array(n).fill(0);
    row[i] = 1;
    identityMatrix.push(row);
  }
  return identityMatrix;
}

const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 2, 9]
];

const inverse = calculateInverse(matrix);

console.log(inverse);

