'use strict';

// DOM
// Buttons
const homeBtn = document.querySelector('.home-btn');
const solveBtn = document.querySelector('.solve-btn');
const startBtn = document.querySelector('.start-btn');
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

class App {
  decitionVariables = 2;
  isMaximization = true;
  z = {};
  restrictions = [];
  OPs = [];

  constructor() {
    console.log('Hello from App!');

    // Event handlers
    homeBtn.addEventListener('click', this.#showSection);
    solveBtn.addEventListener('click', this.#showSection);
    startBtn.addEventListener('click', this.#showSection.bind(solveBtn));
    addRestBtn.addEventListener('click', this.#createRestriction.bind(this));
    execSolveBtn.addEventListener('click', this.#newOP.bind(this));

    // Number variables observer 
    const variablesObserver = new MutationObserver(this.#loadVariables.bind(this));
    variablesObserver.observe(numberVariablesInput, {
      characterData: true,
      subtree: true,
    });
  }

  #showSection() {
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
    const [mutation] = mutations;
    this.decitionVariables = +mutation.target.textContent;

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

    const optimizationProblem = new OptimizationProblem(this.isMaximization, this.z, this.restrictions);
    this.OPs.push(optimizationProblem);
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
