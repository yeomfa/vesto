'use strict';

// DOM
// Buttons
const homeBtn = document.querySelector('.home-btn');
const problemsBtn = document.querySelector('.problems-btn');
const startBtn = document.querySelector('.start-btn');
const createBtn = document.querySelector('.create-btn');
const optionBtns = document.querySelectorAll('.btn-option');
const addRestBtn = document.querySelector('.add-rest-btn');
const execSolveBtn = document.querySelector('.solve-exec-btn'); 

// Sections
const sections = document.querySelectorAll('.section');

// Inputs
const problemTypeInput = document.querySelector('.problem-type');
const numberVariablesInput = document.querySelector('.number-variables');

// Container
const zFunctionCont = document.querySelector('.z-function-cont');
const restrictionsCont = document.querySelector('.restrictions-container');
const standardModelCont = document.querySelector('.model-container');
const problemsCont = document.querySelector('.problems-container');
const iterationsCont = document.querySelector('.iterations-container');

// Links
const problemsLink = document.querySelector('.link-problems');

// Msg
const addProblemMsg = document.querySelector('.add-problem-msg');

class App {
  decitionVariables = 2;
  isMaximization = true;
  z = {};
  restrictions = [];
  OPs = [];
  selectedProblem;

  constructor() {

    // Event handlers
    homeBtn.addEventListener('click', this.#showSection);
    problemsBtn.addEventListener('click', this.#showSection);
    startBtn.addEventListener('click', this.#showSection.bind(problemsBtn));
    createBtn.addEventListener('click', this.#showSection);
    addRestBtn.addEventListener('click', this.#createRestriction.bind(this));
    execSolveBtn.addEventListener('click', this.#newOP.bind(this));

    problemsLink.addEventListener('click', this.#showSection.bind(problemsBtn));

    problemsCont.addEventListener('click', this.#deleteProblem.bind(this));
    problemsCont.addEventListener('click', this.#selectProblem.bind(this));

    // Number variables observer 
    const variablesObserver = new MutationObserver(this.#loadVariables.bind(this));
    variablesObserver.observe(numberVariablesInput, {
      characterData: true,
      subtree: true,
    });

    this.#loadProblems();
  }

  // Problems
  #loadProblems() {
    problemsCont.innerHTML = '';

    if(this.OPs.length === 0) { 
      const msg =  `
        <div class="add-problem-msg">
          <span>No hay registro de problemas</span> 
        </div>
      `;
      problemsCont.insertAdjacentHTML('afterbegin', msg);
      return;
    }

    this.OPs.forEach((op, i) => {
      const html = `
        <article class="problem" data-problem-id="${op.id}">
          <span class="problem-title">${i + 1} - OP</span> 
          <div class="problem-element">
            <span>Variables</span> 
            <span class="problem-variables">${op.decitionVariables}</span> 
          </div>
          <div class="problem-element">
            <span>Restricciones</span> 
            <span class="problem-restrictions">${op.restrictions.length}</span> 
          </div>
          <div class="problem-element">
            <span>Iteraciones</span> 
            <span class="problem-iterations">${op.iterations.length}</span> 
          </div>
          <div class="problem-element">
            <span>Estado</span> 
            <span class="problem-status ${op.status ? 'ok' : 'err'}">${op.status ? 'Ok' : 'Err'}</span> 
          </div>
          <div class="problem-options">
            <span class="op op-show" data-section="iterations">Ver</span>
            <span class="op op-delete">Eliminar</span>
          </div>
        </article>
      `;

      problemsCont.insertAdjacentHTML('beforeend', html);
    });
  }

  #selectProblem(e) {
    const el = e.target; 
    if (el.classList.contains('op-show')) {
      const problem = el.closest('.problem');
      const problemId = problem.dataset.problemId;
      this.selectedProblem = this.OPs.find(op => op.id === problemId );

      this.#showSection.call(el);
      this.#showIterations();
    }
  }

  #showIterations() {
    iterationsCont.innerHTML = ''; 
    this.selectedProblem.iterations.forEach((iter, i) => {
      const {
        xBase,
        cBase,
        B,
        r,
        entersVariable,
        comesOutVariable,
      } = iter;
      const html = `
        <div class="iterations-container">
          <h3 class="section-subtitle">ITERACIÓN #${i + 1}</h3>
          <div class="iteration-content">
            <div class="top-iteration">
              <h3>Matrices Base</h3>
              <div class="array-base-container-${i}">

              </div>
            </div>
            <div class="bottom-iteration">
              <h3>Solución</h3>
              <div class="solution-container-${i}">

              </div>
            </div>
          </div>
        </div>
      `;
      iterationsCont.insertAdjacentHTML('beforeend', html);
      const arrayBaseCont = document.querySelector(`.array-base-container-${i}`);
      const solutionCont = document.querySelector(`.solution-container-${i}`);
      console.log(solutionCont);

      // Base array's
      this.#createArrayTemplate(xBase, 'x base', arrayBaseCont);
      this.#createArrayTemplate(cBase, 'c base', arrayBaseCont);
      this.#createArrayTemplate(B, 'B', arrayBaseCont);

      // Solution
      this.#createArrayTemplate(r, 'r', solutionCont);
      this.#createArrayTemplate([entersVariable], 'Entra >', solutionCont);
      this.#createArrayTemplate([comesOutVariable], 'Sale <', solutionCont);

    });
  }

  #deleteProblem(e) {
    const el = e.target;

    // Match class
    if (el.classList.contains('op-delete')) {
      const problem = el.closest('.problem');
      const problemId = problem.dataset.problemId;
      this.OPs = this.OPs.filter(op => op.id != problemId);
    }

    this.#loadProblems();
  }

  #showSection() {
    console.log(this);
    const btn = this;
    const sectionName = btn.dataset.section;
    const section = [...sections].find(sec => sec.classList.contains(`${sectionName}-section`));

    // Hide all sections
    sections.forEach(section => {
      section.classList.add('hidden');
    })

    // Remove hidden class
    section.classList.remove('hidden');

    if (!btn.classList.contains('btn-option')) return;

    // Add active class
    optionBtns.forEach(btn => {
      btn.classList.remove('active');
    })

    btn.classList.add('active');
  }

  #loadVariables(mutations) {
    if (mutations) {
      const [mutation] = mutations;
      this.decitionVariables = +mutation.target.textContent;
    }

    zFunctionCont.innerHTML = '';
    restrictionsCont.innerHTML = '';
    
    // Z function
    const zTemplate = this.#createVariables();

    zFunctionCont.insertAdjacentHTML('afterbegin', zTemplate);

    // Restriction
    this.#createRestriction();
  }

  #createRestriction() {
    const comparisonTemplate = `
      <select class="input-field comparison">
        <option selected value=">=">≥</option>
        <option value="<=">≤</option>
        <option value="=">=</option>
      </select>
    `;

    const resultTemplate = `
      <span class="input-field result" role="textbox" contenteditable></span>
    `;

    const initDiv = `
      <div class="variables-values restriction-cont">
    `;

    const endDiv = `
      </div>
    `;

    const html = this.#createVariables();

    if (!html) return;
    
    const restTemplate = initDiv + html + comparisonTemplate + resultTemplate + endDiv;
    restrictionsCont.insertAdjacentHTML('beforeend', restTemplate);
  }

  #createVariables() {
    const variablesArray = [];

    for (let i = 0; i < this.decitionVariables; i++) {
      const varTemplate = `
        <div class="var">
          <span class="input-field x-var"  data-id="${i + 1}" role="textbox" contenteditable></span>
          <p class="variable">X<span class="subscript">${i + 1}</span></p>
        </div>
      `; 

      variablesArray.push(varTemplate);
    }

    const html = variablesArray.join(' + ');

    return html;
  }

  #newOP(e) {
    e.preventDefault();

    // Get Problem Type
    this.isMaximization = problemTypeInput.value === 'maximization' ? true : false;

    // Get Z Function
    this.#getFunctionValues();

    // Get Restrictions
    this.#getRestrictions();

    const optimizationProblem = new OptimizationProblem(this.isMaximization, this.z, this.restrictions, this.decitionVariables);
    this.OPs.push(optimizationProblem);

    // Show standard model section
    this.#showSection.call(execSolveBtn);

    // Show standard model
    this.#showStandardModel(optimizationProblem);

    // Settled selected problem
    this.selectedProblem = optimizationProblem;

    // Load problems
    this.#loadProblems();

    // Clear inputs
    numberVariablesInput.textContent = 2; 
    this.#loadVariables();
    this.restrictions = [];
    this.z = [];
  }

  #showStandardModel(OP) {
    const { A, b, c, x } = OP.standardArrays;
    const arrC = Object.values(c).map(variable => Object.values(variable)[0]);

    // Clear container
    standardModelCont.innerHTML = '';

    this.#createArrayTemplate(x, 'x', standardModelCont);
    this.#createArrayTemplate(arrC, 'c', standardModelCont);
    this.#createArrayTemplate(b, 'b', standardModelCont);
    this.#createArrayTemplate(A, 'A', standardModelCont);
  }

  #getFunctionValues() {
    const allFunctionVars = zFunctionCont.querySelectorAll('.x-var');
    allFunctionVars.forEach(inputVar => {
      this.z[`x${inputVar.dataset.id}`] = +inputVar.textContent;
    })
  }

  #getRestrictions() {
    const allRestrictions = restrictionsCont.querySelectorAll('.restriction-cont');
    allRestrictions.forEach(rest => {
      const restriction = {};

      // Get X Vars Values
      const allVars = rest.querySelectorAll('.x-var');
      allVars.forEach(varInput => {
        restriction[`x${varInput.dataset.id}`] = +varInput.textContent;
      })

      // Get Comparison
      const comparison = rest.querySelector('.comparison').value;
      restriction.comparison = comparison;

      // Get Result
      const result = +rest.querySelector('.result').textContent;
      restriction.result = result;

      this.restrictions.push(restriction);
    });
  }

  #createArrayTemplate(array, index = '', container) {
    let arrTemplate = '';
    const isMatrix = typeof array[0] === 'object';

    if (isMatrix) {
      array.forEach(arr => {
        const arrString = arr
          .map(value => `<span class="array-el">${value}</span>`)
          .join('');
        arrTemplate += `<span class="array-row">${arrString}</span>`;
      });
    }

    if (!isMatrix) {
      const arrString = array
        .map(value => `<span class="array-el">${value}</span>`)
        .join('');

      arrTemplate = `<span class="array-row">${arrString}</span>`;
    }

    const html = `
      <div class="letter-arr-container">
        <p class="array-letter">${index}</p>
        <div class="array-container">
            ${ arrTemplate } 
        </div>
      </div>
    `; 

    container.insertAdjacentHTML('beforeend', html);
  }
}

const app = new App();

// const problem = new OptimizationProblem(false, zObj, restrictionsObj);
// console.log(problem);
// problem.buildStandardModel();

// console.log(problem.equations);
// console.log(problem.slackVariables);
// console.log(problem.artificialVariables);
// console.log(problem.zStandard);
// console.log(problem.standardArrays);
// console.log(problem.parseEquation(problem.zStandard));
// console.log(problem.problemType);
// problem.solveProblem();
