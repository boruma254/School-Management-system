const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');

const SALT_ROUNDS = 10;

async function registerUser(data, currentUser) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    const err = new Error('Only admin can register users');
    err.statusCode = 403;
    throw err;
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser.id,
      action: 'CREATE_USER',
      entity: `User:${user.id}`,
    },
  });

  return user;
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

async function refresh(refreshToken) {
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      const err = new Error('User not found or inactive');
      err.statusCode = 401;
      throw err;
    }
    const accessToken = generateAccessToken(user);
    return { accessToken };
  } catch (err) {
    const e = new Error('Invalid refresh token');
    e.statusCode = 401;
    throw e;
  }
}

async function requestStudentSignup(data) {
  const {
    fullName,
    email,
    password,
    admissionNumber,
    currentSemester,
  } = data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    const err = new Error('Email already in use');
    err.statusCode = 400;
    throw err;
  }

  const existingStudent = await prisma.student.findUnique({
    where: { admissionNumber },
  });
  if (existingStudent) {
    const err = new Error('Admission number already exists');
    err.statusCode = 400;
    throw err;
  }

  const program = await prisma.program.findFirst();
  if (!program) {
    const err = new Error('No programs found. Please contact admin.');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        isActive: false, // student must wait for admin approval
      },
    });

    await tx.student.create({
      data: {
        admissionNumber,
        programId: program.id,
        currentSemester: currentSemester || 1,
        status: 'PENDING',
        userId: createdUser.id,
        departmentId: program.departmentId || null,
      },
    });

    return createdUser;
  });

  return {
    message: 'Signup request created. Wait for admin approval before logging in.',
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  };
}

module.exports = {
  registerUser,
  login,
  refresh,
  requestStudentSignup,
};

