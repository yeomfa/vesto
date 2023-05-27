
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
  slackVariables = {};
  artificialVariables = {};
  equations = [];
  zStandard = {};
  standardArrays = {};
  baseArrays = {};

  constructor(isMaximization, z, restrictions) {
    this.isMaximization = isMaximization;
    this.z = z;
    this.restrictions = restrictions;

    this.#buildStandardModel();
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
    // 1) Build base arrays xBase, cBase, B, BReserve
    const {xBase, cBase, B, BReserve } = this.#buildBaseArrays();

    // 2) Calc reduced cost r
    // 3) Calc Breverse*A, select the same row as the minimum value in r, [enters]
    // 4) Calc Breverse*b
    // 5) Calc Breverse*b / selected row of Breverse*A, select minumum value (except infinity and negative values) [comes out]
    // 6) Next iteration with new values

    console.log("Solving problem...");
  }

  // Build base arrys
  #buildBaseArrays() {
    // x base
    this.baseArrays.xBase = this.standardArrays.x
      .filter(variable => this.slackVariables[variable] === 1 || variable in this.artificialVariables);

    // c base
    this.baseArrays.cBase = this.baseArrays.xBase
      .map(variable => {
        const variableObj = this.standardArrays.c
          .find(varObj => variable in varObj);

        return variableObj[variable];
      });

    // B
    this.baseArrays.B = this.equations.map(equation => {
      const row = [];

      this.baseArrays.xBase.forEach(x => {
        if (x in equation) row.push(equation[x]);
        else row.push(0);
      })

      return row;
    });

    console.log(this.baseArrays.xBase);
    console.log(this.baseArrays.cBase);
    console.log(this.baseArrays.B);

    return {
      xBase: this.baseArrays.xBase,
      // cBase,
      // B,
      // BReserve,
    } 
  }

  // Parse Equations
  parseEquation(equation) {
    const equationParsed = Object.entries(equation)
      .map(([varName, varValue], i) => {
        let operator = '';
        let value = varValue;

        if(varValue < 0) {
          operator = ' - ';
          value = varValue === -1 ? 0 : varValue * -1;
        } else {
          if(i !== 0) {
            operator = ' + ';
            value = varValue === 1 ? 0 : varValue;
          }
        }  

        return `${operator}${value}${varName}`;
      });

    return equationParsed.join('');
  }

}
