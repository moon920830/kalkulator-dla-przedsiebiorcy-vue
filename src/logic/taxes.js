import constants from 'src/logic/constants'
import helpers from 'src/logic/helpers'

let year = helpers.getDefaultYear()

let params = {
  firstTaxRate: constants.PARAMS[year].TAX_RATES.FIRST_RATE / 100,
  secondTaxRate: constants.PARAMS[year].TAX_RATES.SECOND_RATE / 100,
  linearTaxRate: constants.PARAMS[year].TAX_RATES.LINEAR_RATE / 100,
  taxReducingAmount: constants.PARAMS[year].TAX_REDUCING_AMOUNT,
  amountOfTaxThreshold: constants.PARAMS[year].AMOUNT_OF_TAX_THRESHOLD,
}

/**
 * Sets parameters for the year
 * @param newYear
 */
function setYear (newYear) {
  year = newYear

  params = {
    firstTaxRate: constants.PARAMS[year].TAX_RATES.FIRST_RATE / 100,
    secondTaxRate: constants.PARAMS[year].TAX_RATES.SECOND_RATE / 100,
    linearTaxRate: constants.PARAMS[year].TAX_RATES.LINEAR_RATE / 100,
    taxReducingAmount: constants.PARAMS[year].TAX_REDUCING_AMOUNT,
    amountOfTaxThreshold: constants.PARAMS[year].AMOUNT_OF_TAX_THRESHOLD,
  }
}
/**
 * Calculates the income tax using general rules
 *
 * @param {number} grossAmount
 * @param {number} basisForTax
 * @param {number} amountOfDeductionOfHealthContributionFromTax
 * @param {boolean} isFreeAmount
 * @param {number} totalBasisForTax
 * @param {boolean} isAidForMiddleClass
 * @returns {number}
 */
function calculateIncomeTaxUsingGeneralRules (
  grossAmount,
  basisForTax,
  amountOfDeductionOfHealthContributionFromTax,
  isFreeAmount,
  totalBasisForTax,
  isAidForMiddleClass = false,
) {
  let taxReducingAmount = 0

  if (isFreeAmount) {
    taxReducingAmount = params.taxReducingAmount
  }

  let taxAmount = basisForTax * params.firstTaxRate - amountOfDeductionOfHealthContributionFromTax - taxReducingAmount

  const newTotalBasisForTax = basisForTax + totalBasisForTax

  // If the total basis for the tax tax is grater than the amount of the tax threshold, there is second tax rate
  if (totalBasisForTax > params.amountOfTaxThreshold) {
    taxAmount = basisForTax * params.secondTaxRate - amountOfDeductionOfHealthContributionFromTax
  } else if (newTotalBasisForTax > params.amountOfTaxThreshold) {
    // first rate
    taxAmount = (params.amountOfTaxThreshold - totalBasisForTax) * params.firstTaxRate - amountOfDeductionOfHealthContributionFromTax - taxReducingAmount
    // second rate
    taxAmount += (newTotalBasisForTax - params.amountOfTaxThreshold) * params.secondTaxRate
  }

  if (isAidForMiddleClass) {
    taxAmount -= calculateAidForMiddleClass(grossAmount)
  }

  if (taxAmount < 0) {
    taxAmount = 0
  }

  return helpers.round(taxAmount)
}

/**
 * Calculates the income tax using linear rules
 *
 * @param {number} basisForTax
 * @param {number} amountOfDeductionOfHealthContributionFromTax
 * @returns {number}
 */
function calculateIncomeTaxUsingLinearRules (
  basisForTax,
  amountOfDeductionOfHealthContributionFromTax,
) {
  let taxAmount = basisForTax * params.linearTaxRate - amountOfDeductionOfHealthContributionFromTax

  if (taxAmount < 0) {
    taxAmount = 0
  }
  return helpers.round(taxAmount)
}

/**
 * Calculates the income tax using lump sum rules
 *
 * @param {number} basisForTax
 * @param {number} lumpSumTaxRate
 * @param {number} amountOfDeductionOfHealthContributionFromTax
 * @returns {number}
 */
function calculateIncomeTaxUsingLumpSumRules (
  basisForTax,
  lumpSumTaxRate,
  amountOfDeductionOfHealthContributionFromTax,
) {
  let taxAmount = basisForTax * lumpSumTaxRate - amountOfDeductionOfHealthContributionFromTax

  if (taxAmount < 0) {
    taxAmount = 0
  }
  return helpers.round(taxAmount)
}

/**
 * Calculates the aid for a middle class of society
 *
 * @param {number} grossAmount
 * @returns {number}
 */
function calculateAidForMiddleClass (grossAmount) {
  grossAmount = helpers.round(grossAmount)

  if (grossAmount >= 5701 && grossAmount < 8549) {
    return helpers.round(grossAmount * 0.0668 - 380.50, 2)
  }
  if (grossAmount >= 8549 && grossAmount < 11141) {
    return helpers.round(grossAmount * -0.0735 + 819.08, 2)
  }
  return 0
}

export default {
  setYear,
  calculateIncomeTaxUsingLumpSumRules,
  calculateIncomeTaxUsingLinearRules,
  calculateIncomeTaxUsingGeneralRules,
  calculateAidForMiddleClass,
}