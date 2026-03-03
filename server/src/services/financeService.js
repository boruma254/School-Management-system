const prisma = require('../config/prisma');
const { stkPush } = require('../utils/mpesaClient');

async function createFeeStructure(data) {
  return prisma.feeStructure.create({
    data: {
      programId: data.programId,
      semester: data.semester,
      amount: data.amount,
    },
  });
}

async function listFeeStructures() {
  return prisma.feeStructure.findMany({
    include: {
      program: true,
    },
  });
}

async function initiateMpesaPayment({ studentId, amount, phoneNumber }) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true },
  });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const accountReference = student.admissionNumber;
  const transactionDesc = 'Tuition payment';

  const stkResponse = await stkPush({
    amount,
    phoneNumber,
    accountReference,
    transactionDesc,
  });

  const payment = await prisma.payment.create({
    data: {
      studentId,
      amount,
      method: 'MPESA',
      transactionRef: stkResponse.CheckoutRequestID,
      status: 'PENDING',
    },
  });

  await prisma.mpesaTransaction.create({
    data: {
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      status: 'PENDING',
      paymentId: payment.id,
    },
  });

  return { stkResponse, payment };
}

async function handleMpesaCallback(callbackBody) {
  const { Body } = callbackBody;
  const stkCallback = Body?.stkCallback;
  if (!stkCallback) return;

  const checkoutRequestId = stkCallback.CheckoutRequestID;
  const resultCode = String(stkCallback.ResultCode);
  const resultDesc = stkCallback.ResultDesc;

  const metaItems = stkCallback.CallbackMetadata?.Item || [];
  const amountItem = metaItems.find((i) => i.Name === 'Amount');
  const phoneItem = metaItems.find((i) => i.Name === 'PhoneNumber');
  const amount = amountItem?.Value ? Number(amountItem.Value) : null;
  const phoneNumber = phoneItem?.Value ? String(phoneItem.Value) : null;

  const mpesaTx = await prisma.mpesaTransaction.update({
    where: { checkoutRequestId },
    data: {
      resultCode,
      resultDesc,
      amount,
      phoneNumber,
      status: resultCode === '0' ? 'SUCCESS' : 'FAILED',
    },
    include: {
      payment: true,
    },
  });

  if (mpesaTx.payment) {
    await prisma.payment.update({
      where: { id: mpesaTx.paymentId },
      data: {
        status: resultCode === '0' ? 'SUCCESS' : 'FAILED',
      },
    });
  }
}

async function listPaymentsByStudent(studentId, currentUser) {
  if (currentUser?.role === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }
    if (student.userId !== currentUser.id) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
  }
  return prisma.payment.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
  });
}

async function getReceipt(paymentId, currentUser) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      student: {
        include: {
          user: true,
          program: true,
        },
      },
      mpesaTransactions: true,
    },
  });

  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }

  if (currentUser?.role === 'STUDENT' && payment.student?.userId !== currentUser.id) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return payment;
}

module.exports = {
  createFeeStructure,
  listFeeStructures,
  initiateMpesaPayment,
  handleMpesaCallback,
  listPaymentsByStudent,
  getReceipt,
};

