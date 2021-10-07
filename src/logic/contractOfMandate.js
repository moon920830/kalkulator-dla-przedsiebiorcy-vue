import constants from 'src/logic/constants'
import helpers from 'src/logic/helpers'
import employeeContributions from 'src/logic/employeeContributions'
import employerContributions from 'src/logic/employerContributions'

const taxRate = constants.TAX_RATES.FIRST_RATE / 100
let totalBasisForRentAndPensionContributions = 0

/**
 * Calculates expenses
 *
 * @param {number} basisForExpenses
 * @param {number} expenseRate
 * @param {number} partOfWorkWithAuthorExpenses
 * @returns {number}
 */
function calculateExpenses (basisForExpenses, expenseRate, partOfWorkWithAuthorExpenses = 0) {
  const partOfWorkWithoutAuthorExpenses = 1 - partOfWorkWithAuthorExpenses

  let expenses = basisForExpenses * partOfWorkWithoutAuthorExpenses * expenseRate

  if (partOfWorkWithAuthorExpenses) {
    expenses += basisForExpenses * partOfWorkWithAuthorExpenses * constants.CONTRACT_OF_MANDATE.AUTHOR_EXPENSES_RATE
  }

  if (expenses > constants.AMOUNT_OF_TAX_THRESHOLD) {
    expenses = constants.AMOUNT_OF_TAX_THRESHOLD
  }

  return helpers.round(expenses, 2)
}

/**
 * Calculates the basis for tax
 *
 * @param {number} grossAmount
 * @param {number} grossAmountMinusEmployeeContributions
 * @param {number} expenses
 * @returns {number}
 */
function calculateBasisForTax (grossAmount, grossAmountMinusEmployeeContributions, expenses) {
  let basisForTax = grossAmount

  if (grossAmountMinusEmployeeContributions > constants.LUMP_SUM_UP_TO_AMOUNT) {
    basisForTax = grossAmountMinusEmployeeContributions - expenses
  }

  return helpers.round(basisForTax)
}

/**
 * Calculates the tax amount
 *
 * @param {number} grossAmount
 * @param {number} basisForTax
 * @param {number} amountOfDeductionOfHealthContributionFromTax
 * @returns {number}
 */
function calculateTaxAmount (grossAmount, basisForTax, amountOfDeductionOfHealthContributionFromTax) {
  let taxAmount = basisForTax * taxRate

  if (grossAmount > constants.LUMP_SUM_UP_TO_AMOUNT) {
    taxAmount -= amountOfDeductionOfHealthContributionFromTax
  }

  return helpers.round(taxAmount)
}

/**
 * Calculates the net amount
 *
 * @param {number} grossAmount
 * @param {number} taxAmount
 * @param {number} employeeContributions
 * @param {number} ppkAmount
 * @returns {number}
 */
function calculateNetAmount (grossAmount, taxAmount, employeeContributions, ppkAmount) {
  return helpers.round(grossAmount - taxAmount - ppkAmount -
    employeeContributions, 2)
}

/**
 * Calculates basisForRentAndPensionContributions
 * @param {number} grossAmount
 * @param {number} totalBasisForRentAndPensionContributions
 * @returns {number}
 */
function calculateBasisForRentAndPensionContributions (grossAmount, totalBasisForRentAndPensionContributions) {
  const newBasicAmountForRentAndPension = grossAmount + totalBasisForRentAndPensionContributions

  if (totalBasisForRentAndPensionContributions > constants.LIMIT_BASIC_AMOUNT_FOR_ZUS) {
    return 0
  }
  if (newBasicAmountForRentAndPension > constants.LIMIT_BASIC_AMOUNT_FOR_ZUS) {
    return constants.LIMIT_BASIC_AMOUNT_FOR_ZUS - totalBasisForRentAndPensionContributions
  }

  return grossAmount
}

/**
 * Returns the monthly results of an employee
 *
 * @param {number} grossAmount
 * @param {number} ppkContributionRate
 * @param {number} partOfWorkWithAuthorExpenses
 * @param {boolean} isPensionContribution
 * @param {boolean} isRentContribution
 * @param {boolean} isSickContribution
 * @param {boolean} isHealthContribution
 * @param {boolean} isYoung
 * @returns {{sickContribution: number, ppkContribution: number, netAmount: number, rentContribution: number, basisForTax: number, grossAmount: number, healthContribution: number, taxAmount: number, pensionContribution: number, expenses: number}}
 */
function getMonthlyResultOfEmployee (
  grossAmount,
  ppkContributionRate,
  partOfWorkWithAuthorExpenses,
  isPensionContribution,
  isRentContribution,
  isSickContribution,
  isHealthContribution,
  isYoung,
) {
  let expenseRate = 0
  let pensionContribution = 0
  let rentContribution = 0
  let sickContribution = 0
  let healthContribution = 0
  let ppkContribution = 0
  let amountOfDeductionOfHealthContributionFromTax = 0
  let basisForTax = 0
  let taxAmount = 0
  let expenses = 0

  const basisForRentAndPensionContributions = calculateBasisForRentAndPensionContributions(grossAmount, totalBasisForRentAndPensionContributions)

  if (grossAmount > constants.LUMP_SUM_UP_TO_AMOUNT) {
    expenseRate = constants.CONTRACT_OF_MANDATE.EXPENSES_RATE
  }

  if (isPensionContribution) {
    pensionContribution = employeeContributions.calculatePensionContribution(basisForRentAndPensionContributions)
  }
  if (isRentContribution) {
    rentContribution = employeeContributions.calculateRentContribution(basisForRentAndPensionContributions)
  }
  if (isSickContribution) {
    sickContribution = employeeContributions.calculateSickContribution(grossAmount)
  }
  if (ppkContributionRate) {
    ppkContribution = employeeContributions.calculatePpkContribution(grossAmount, ppkContributionRate)
  }

  const grossAmountMinusEmployeeContributions = employeeContributions.calculateGrossAmountMinusContributions(grossAmount, pensionContribution, rentContribution, sickContribution)

  if (isHealthContribution) {
    healthContribution = employeeContributions.calculateHealthContribution(grossAmountMinusEmployeeContributions)
    amountOfDeductionOfHealthContributionFromTax = employeeContributions.calculateAmountOfDeductionOfHealthContributionFromTax(grossAmount, grossAmountMinusEmployeeContributions)
  }

  if (!isYoung) {
    expenses = calculateExpenses(grossAmountMinusEmployeeContributions, expenseRate, partOfWorkWithAuthorExpenses)
    basisForTax = calculateBasisForTax(grossAmount, grossAmountMinusEmployeeContributions, expenses)
    taxAmount = calculateTaxAmount(grossAmount, basisForTax, amountOfDeductionOfHealthContributionFromTax)
  }

  const totalContributions = employeeContributions.sumContributions(pensionContribution, rentContribution, sickContribution, healthContribution)
  const netAmount = calculateNetAmount(grossAmount, taxAmount, totalContributions, ppkContribution)

  return {
    netAmount: netAmount,
    grossAmount: grossAmount,
    pensionContribution: pensionContribution,
    rentContribution: rentContribution,
    sickContribution: sickContribution,
    ppkContribution: ppkContribution,
    healthContribution: healthContribution,
    expenses: expenses,
    basisForTax: basisForTax,
    taxAmount: taxAmount,
  }
}

/**
 * Returns the monthly results of an employer
 *
 * @param {number} grossAmount
 * @param {number} accidentContributionRate
 * @param {number} ppkContributionRate
 * @param {boolean} isPensionContribution
 * @param {boolean} isRentContribution
 * @returns {{totalAmount: number, ppkContribution: number, rentContribution: number, grossAmount: number, accidentContribution: number, pensionContribution: number}}
 */
function getMonthlyResultOfEmployer (
  grossAmount,
  accidentContributionRate,
  ppkContributionRate,
  isPensionContribution,
  isRentContribution,
) {
  let pensionContribution = 0
  let rentContribution = 0
  let accidentContribution = 0
  let ppkContribution = 0
  const basisForRentAndPensionContributions = calculateBasisForRentAndPensionContributions(grossAmount, totalBasisForRentAndPensionContributions)

  if (isPensionContribution) {
    pensionContribution = employerContributions.calculatePensionContribution(basisForRentAndPensionContributions)
  }
  if (isRentContribution) {
    rentContribution = employerContributions.calculateRentContribution(basisForRentAndPensionContributions)
  }
  if (accidentContributionRate) {
    accidentContribution = employerContributions.calculateAccidentContribution(grossAmount, accidentContributionRate)
  }
  if (ppkContributionRate) {
    ppkContribution = employerContributions.calculatePpkContribution(grossAmount, ppkContributionRate)
  }

  const totalAmount = grossAmount + pensionContribution + rentContribution + accidentContribution + ppkContribution

  return {
    totalAmount: totalAmount,
    grossAmount: grossAmount,
    pensionContribution: pensionContribution,
    rentContribution: rentContribution,
    accidentContribution: accidentContribution,
    ppkContribution: ppkContribution,
  }
}

/**
 * Returns the yearly results of an employer
 *
 * @param {[]} monthlyInputs
 * @returns {{totalBasisForRentAndPensionContributions: number, rows: *[]}}
 */
function getYearlyResultOfEmployer (monthlyInputs) {
  const results = []
  let i = 0
  totalBasisForRentAndPensionContributions = 0

  monthlyInputs.forEach(input => {
    const result = getMonthlyResultOfEmployer(...Object.values(input))
    result.month = constants.LOCALE_DATE.months[i]
    results.push(result)

    totalBasisForRentAndPensionContributions += result.grossAmount
    i++
  })

  results.push({
    month: constants.LABELS.WHOLE_YEAR,
    totalAmount: results.map(result => result.totalAmount)
      .reduce((current, sum) => current + sum, 0),
    grossAmount: results.map(result => result.grossAmount)
      .reduce((current, sum) => current + sum, 0),
    pensionContribution: results.map(result => result.pensionContribution)
      .reduce((current, sum) => current + sum, 0),
    rentContribution: results.map(result => result.rentContribution)
      .reduce((current, sum) => current + sum, 0),
    accidentContribution: results.map(result => result.accidentContribution)
      .reduce((current, sum) => current + sum, 0),
    ppkContribution: results.map(result => result.ppkContribution)
      .reduce((current, sum) => current + sum, 0),
  })

  return {
    rows: results,
    totalBasisForRentAndPensionContributions: totalBasisForRentAndPensionContributions,
  }
}

/**
 * Returns the yearly results of an employee
 *
 * @param {[]} monthlyInputs
 * @returns {{totalBasisForRentAndPensionContributions: number, rows: *[]}}
 */
function getYearlyResultOfEmployee (monthlyInputs) {
  const results = []
  let i = 0
  totalBasisForRentAndPensionContributions = 0

  monthlyInputs.forEach(input => {
    const result = getMonthlyResultOfEmployee(...Object.values(input))
    result.month = constants.LOCALE_DATE.months[i]
    results.push(result)

    totalBasisForRentAndPensionContributions += result.grossAmount
    i++
  })

  results.push({
    month: constants.LABELS.WHOLE_YEAR,
    netAmount: results.map(result => result.netAmount)
      .reduce((current, sum) => current + sum, 0),
    grossAmount: results.map(result => result.grossAmount)
      .reduce((current, sum) => current + sum, 0),
    pensionContribution: results.map(result => result.pensionContribution)
      .reduce((current, sum) => current + sum, 0),
    rentContribution: results.map(result => result.rentContribution)
      .reduce((current, sum) => current + sum, 0),
    sickContribution: results.map(result => result.sickContribution)
      .reduce((current, sum) => current + sum, 0),
    healthContribution: results.map(result => result.healthContribution)
      .reduce((current, sum) => current + sum, 0),
    ppkContribution: results.map(result => result.ppkContribution)
      .reduce((current, sum) => current + sum, 0),
    taxAmount: results.map(result => result.taxAmount)
      .reduce((current, sum) => current + sum, 0),
  })

  return {
    rows: results,
    totalBasisForRentAndPensionContributions: totalBasisForRentAndPensionContributions,
  }
}

export {
  getMonthlyResultOfEmployee,
  getMonthlyResultOfEmployer,
  getYearlyResultOfEmployer,
  getYearlyResultOfEmployee,
}
