// Restrictions
// const decitionVariables = 2; // x1, x2, ...
// const isMaximization = true;

// z = '120x1 + 200x2';
// const zObj = {x1: 120, x2: 200};

// x1 + x2 >= 65
// x1 + 0 >= 23
// 0 + x2 >= 23
// 60x1 + 24x2 >= 23
// const restrictionsObj = [
//   {x1: 1, x2: 1, comparison: '=', result: 65},
//   {x1: 1, x2: 0, comparison: '>=', result: 23},
//   {x1: 0, x2: 1, comparison: '>=', result: 20},
//   {x1: 60, x2: 24, comparison: '<=', result: 3000},
// ];

class OptimizationProblem {
  id = Date.now().toString();
  slackVariables = {};
  artificialVariables = {};
  equations = [];
  zStandard = {};
  standardArrays = {};
  iterations = [];
  status = true;

  constructor(isMaximization, z, restrictions, decitionVariables) {
    this.isMaximization = isMaximization;
    this.z = z;
    this.restrictions = restrictions;
    this.decitionVariables = decitionVariables;

    this.#buildStandardModel();
    this.solveProblem();
  }

  // Problem type
  get problemType() {
    return this.isMaximization ? 'maximization' : 'minimization';
  }

  // Build Standardized odel
  #buildStandardModel() {
    const zMaxValue = Math.max(...Object.values(this.z));
    const artificialsForZ = {};
    const slacksForZ = {};

    this.equations = this.restrictions
      .map((restriction, i) => {
        const { comparison } =  restriction;
        const equation = {...restriction};

        // Get slack
        const [slackName, slackValue] = this.#getSlack(i, comparison);
        if (slackValue !== 0) {
          equation[slackName] = slackValue;
          equation.comparison = '=';
          slacksForZ[slackName] = 0; 
          this.slackVariables[slackName] = slackValue;
        }

        // Get artificial
        if(slackValue !== 1) {
          const [artName, artValue] = this.#getArtificial(i);

          equation[artName] = artValue;
          this.artificialVariables[artName] = artValue;
          artificialsForZ[artName] = this.isMaximization 
            ? zMaxValue * -10
            : zMaxValue * 10;
        }

        return equation;
      });

    this.zStandard = {
      ...this.z,
      ...slacksForZ,
      ...artificialsForZ,
    }

    this.#buildStandardArrays();
  }

  // Get slack
  #getSlack(i, comparison) {
    const slackName = `s${i + 1}`;
    let slackValue = 0;

    if (comparison === '=') return [slackName, slackValue];

    slackValue = comparison === '>=' ? -1: 1; 

    return [slackName, slackValue];
  } 

  // Get artificial
  #getArtificial(i) {
    const artificialName = `u${i + 1}`;
    const artificialValue = 1;

    return [artificialName, artificialValue];
  }

  // Build arrays
  #buildStandardArrays() {
    this.standardArrays.x = Object.keys(this.zStandard);

    const toMultiply = this.isMaximization ? 1 : -1;
    this.standardArrays.c = Object.entries(this.zStandard).map(([key, value]) => {
      if (key.startsWith('s')) return {[`${key}`]: value};
      
      return {[`${key}`]: value * toMultiply};
    });

    this.standardArrays.b = this.restrictions.map(restriction => restriction.result);

    this.standardArrays.A = this.equations.map(equation => {
      const row = [];

      this.standardArrays.x.forEach(x => {
        if (x in equation) row.push(equation[x]);
        else row.push(0);
      })

      return row;

    });
  }

  // Solve Problem
  solveProblem() {
    // 1) Build base arrays xBase, cBase, B, BInverse
    let {xBase, cBase, B } = this.#buildInitBaseArrays();
    const cValues = Array.from(this.standardArrays.c, obj => [Object.values(obj).at(0)]);
    const cTransposed = MatrixCalc.transposedMatrix(cValues);
    const bValues = this.standardArrays.b.map(value => [value]);

    while(true) {
      console.log("ITERACION: ");
      const BInverse = MatrixCalc.inverseMatrix(B);
      const cBaseTransposed = MatrixCalc.transposedMatrix(cBase);
      // console.log(this.standardArrays.b);
      // console.log('x base:', xBase);
      // console.log('c base:', cBase);
      // console.log('B', B);
      // console.log('b inverse', BInverse);
      // [][][][] x []
      //            []
      //            []
      //            []

      // 2) Calc reduced cost r
      // console.log(this.standardArrays.A);
      // console.log('cBase transposed', cBaseTransposed);


      // cBaseTransposed * BInverse
      const cBaseTransposedPerBInverse = MatrixCalc.multiplyMatrix(cBaseTransposed, BInverse);
      // console.log('cbt * B inverse:', cBaseTransposedPerBInverse);


      // cbt * bInverse * a
      const cBaseTransposedPerBInversePerA = MatrixCalc.multiplyMatrix(cBaseTransposedPerBInverse, this.standardArrays.A);
      // console.log('cbt * B inverse * A:', cBaseTransposedPerBInversePerA);

      // r = cbt * bInverse * a - ct
      const r = MatrixCalc.subtractMatrices(cBaseTransposedPerBInversePerA, cTransposed);
      const rFlat = r.flat();

      // Get enters variable
      const minValueR = Math.min(...rFlat);
      const entersIndex = rFlat.findIndex(value => value === minValueR);
      const entersVariable = this.standardArrays.x[entersIndex];
      console.log('r:', r);
      console.log('Min index in r [Enters]:', entersIndex);
      console.log('Var [Enters]:', entersVariable);

      // console.log('bValues: ', bValues);
      // console.log('cValues: ', cValues);

      // 3) Calc Breverse*b
      const BInversePerB = MatrixCalc.multiplyMatrix(BInverse, bValues);
      console.log('B inverse per b', BInversePerB);

      if (minValueR >= 0) {
        const z = MatrixCalc.multiplyMatrix(cBaseTransposed, BInversePerB); 
        const BInversePerBRound = MatrixCalc.roundMatrix(BInversePerB);
        console.log('z', z);
        console.log('B inverse per b', BInversePerBRound);
        console.log('ultima iteracion');
        const xOptimized = {};
        this.standardArrays.x.forEach(key => {
          const value = BInversePerBRound[xBase.indexOf(key)];
          if (value) xOptimized[key] = value[0]; 
          else xOptimized[key] = 0;
        });
        console.log(xOptimized);
        this.status = true;

        const xBaseToSave = [...xBase];
        const cBaseToSave = cBase.map(val => val[0]);
        const BToSave = B.map(row => [...row]);
        const rToSave = [...r]; 

        const iterationData = {
          xOptimized,
          xBase: xBaseToSave,
          cBase: cBaseToSave,
          B: BToSave,
          r: rToSave,
          z: z.flat()[0],
        }

        if(xBase.some(variable => variable.startsWith('u'))) this.status = false;
        this.iterations.push(iterationData);

        break;
      }

      // 4) Calc Breverse*A, select the same row as the minimum value in r, [enters]
      const BInversePerA = MatrixCalc.multiplyMatrix(BInverse, this.standardArrays.A);
      console.log('B inverse * A:', BInversePerA);

      // Select row in BInversePerA
      const selectedRow = BInversePerA.map(row => row[entersIndex]);
      console.log('Selected row', selectedRow);


      // 5) Calc Breverse*b / selected row of Breverse*A, select minumum value (except infinity and negative values) [comes out]
      const BInversePerBFlat = BInversePerB.flat();
      // console.log(BInversePerBFlat);
      const teta = BInversePerBFlat.map((value, i) => value / selectedRow[i]);
      console.log('Teta: ', teta);
      const comesOutArray = [...teta].sort((a, b) => a - b);
      const comesOutValue = comesOutArray.find(value => value >= 0);
      const comesOutIndex = teta.indexOf(comesOutValue);
      const comesOutVariable = xBase[comesOutIndex];

      console.log('Min index comes out:', comesOutIndex); 
      console.log('Var [Comes out]:', comesOutVariable); 

      // z = cbt * bInverse * b
      const z = MatrixCalc.multiplyMatrix(cBaseTransposed, BInversePerB); 
      console.log('z', z);

      console.log('/////////////////////////////////////');
      console.log(xBase);
      console.log(cBase);
      console.log(B);
      console.log(r);
      console.log(entersVariable);
      console.log(comesOutVariable);

      // Save iteration data
      const xBaseToSave = [...xBase];
      const cBaseToSave = cBase.map(val => val[0]);
      const BToSave = B.map(row => [...row]);
      const rToSave = [...r]; 

      const iterationData = {
        xBase: xBaseToSave,
        cBase: cBaseToSave,
        B: BToSave,
        r: rToSave,
        entersVariable,
        comesOutVariable,
      }

      this.iterations.push(iterationData);


      // 6) Next iteration with new values
      xBase[comesOutIndex] = entersVariable;
      cBase[comesOutIndex] = cValues[entersIndex];
      B = this.#buildB(xBase);

      // Todo - Next iteration?
      // Todo - Have solution?
    }
  }

  // Build base arrys
  #buildInitBaseArrays() {
    // x base
    const xBase = this.standardArrays.x
      .filter(variable => this.slackVariables[variable] === 1 || variable in this.artificialVariables);

    // c base
    const cBase = xBase
      .map(variable => {
        const variableObj = this.standardArrays.c
          .find(varObj => variable in varObj);

        console.log([variableObj[variable]]); 
        return [variableObj[variable]];
      });

    // B
    const B = this.#buildB(xBase);

    return {
      xBase,
      cBase,
      B,
      // BReserve,
    } 
  }
  
  #buildB(xBase) {
    const B = this.equations.map(equation => {
      const row = [];

      // [s4, u1, u2, u3]
      xBase.forEach(x => {
        if (x in equation) row.push(equation[x]);
        else row.push(0);
      })

      return row;
    });

    return B;
  }
}
