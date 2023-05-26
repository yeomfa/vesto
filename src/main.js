'use strict';

// Restrictions
const decitionVariables = 2; // x1, x2, ...
const isMaximization = true;

// z = '120x1 + 200x2';
const zObj = {x1: 120, x2: 200};

// x1 + x2 >= 65
// x1 + 0 >= 23
// 0 + x2 >= 23
// 60x1 + 24x2 >= 23
const restrictionsObj = [
  {x1: 1, x2: 1, comparison: '=', result: 65},
  {x1: 1, x2: 0, comparison: '>=', result: 23},
  {x1: 0, x2: 1, comparison: '>=', result: 20},
  {x1: 60, x2: 24, comparison: '<=', result: 3000},
];

// DOM
const homeBtn = document.querySelector('.home-btn');
const solveBtn = document.querySelector('.solve-btn');
const startBtn = document.querySelector('.start-btn');
const sections = document.querySelectorAll('.section');
const btns = document.querySelectorAll('.btn');

class App {
  decitionVariables = 2;
  isMaximization = true;
  z = {};
  restrictions = {};

  constructor() {
    console.log('Hello from App!');

    // Event handlers
    homeBtn.addEventListener('click', this.#showSection);
    solveBtn.addEventListener('click', this.#showSection);
    startBtn.addEventListener('click', this.#showSection.bind(solveBtn));
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

    // Add active class
    btns.forEach(btn => {
      btn.classList.remove('active');
    })

    btn.classList.add('active');
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
