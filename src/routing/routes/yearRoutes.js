const express = require("express");
const router = express.Router();
const getYearCategorySummary = require("../controllers/yearController/getYearCategorySummary");
const getYearCategoriesByMonths = require("../controllers/yearController/getYearCategoriesByMonths");
const getYearMonthsTotalsSummary = require("../controllers/yearController/getYearMonthsTotalsSummary");
const getYearTopTrackedCategories = require("../controllers/yearController/getYearTopTrackedCategories");
const getYearTopMonths = require("../controllers/yearController/getYearTopMonths");
const getMonths = require("../controllers/yearController/getMonths");
const getYearInfo = require("../controllers/yearController/getYearInfo");
const getYearsInfo = require("../controllers/yearController/getYearsInfo");
const getYearTotals = require("../controllers/yearController/getYearTotals");
const getYears = require("../controllers/yearController/getYears");

router.get("/category-summary/:userId/:year/:month?", getYearCategorySummary); // dashboard page table
router.get("/category-by-month/:userId/:status/:year", getYearCategoriesByMonths); // years page category by month table
router.get("/months-totals/:userId/:status/:year", getYearMonthsTotalsSummary); // years page months totals line graph
router.get("/top-categories/:userId/:year/:month?", getYearTopTrackedCategories); // dashboard page top 5 categories in a year doughnut chart
router.get("/top-months/:userId/:status/:year", getYearTopMonths); // years page top 5 months in a year doughnut chart
router.get('/year-totals/:userId/:year', getYearTotals); // dashboard page totals bar graph
router.get("/months/:userId/:year", getMonths); // dashboard page months

router.get("/:userId/:status/:year", getYearInfo); // years page single year
router.get("/:userId/:status", getYearsInfo); // overview page all years
router.get("/:userId", getYears); // dashboard page years

module.exports = router;
