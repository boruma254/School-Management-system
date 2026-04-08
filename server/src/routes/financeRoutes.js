const express = require("express");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  createFeeStructure,
  listFeeStructures,
  initiateMpesa,
  listStudentPayments,
  getReceipt,
  getMyFeeSummary,
  feeStructureValidation,
  mpesaInitValidation,
  studentIdParamValidation,
  receiptParamValidation,
} = require("../controllers/financeController");

const router = express.Router();

router.get(
  "/fee-structures",
  authorizeRoles("ADMIN", "FINANCE"),
  listFeeStructures,
);

router.get(
  "/students/me/fee-summary",
  authorizeRoles("STUDENT"),
  getMyFeeSummary,
);
router.post(
  "/fee-structures",
  authorizeRoles("ADMIN", "FINANCE"),
  feeStructureValidation,
  createFeeStructure,
);

router.post(
  "/mpesa/stk-push",
  authorizeRoles("STUDENT", "ADMIN", "FINANCE"),
  mpesaInitValidation,
  initiateMpesa,
);

router.get(
  "/students/:studentId/payments",
  authorizeRoles("ADMIN", "FINANCE", "STUDENT"),
  studentIdParamValidation,
  listStudentPayments,
);

router.get(
  "/receipts/:paymentId",
  authorizeRoles("ADMIN", "FINANCE", "STUDENT"),
  receiptParamValidation,
  getReceipt,
);

module.exports = router;
