// backend/src/middleware/validationMiddleware.js

/**
 * Higher-order validation helper that checks required body fields
 * @param {Array<string>} requiredFields
 */
export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Validation failed: Missing required field(s): ${missing.join(', ')}`,
        code: 'VALIDATION_FAILED',
        missingFields: missing
      });
    }

    next();
  };
};

export const validateAssignment = validateBody(['courseId', 'title', 'subject', 'dueDate']);

export const validateCourse = validateBody(['title', 'subject', 'code']);

export const validateLesson = validateBody(['title', 'moduleTitle']);

export const validateQuiz = validateBody(['title', 'subject']);

export const validateQuestion = validateBody(['questionText', 'options', 'correctOptionIndex']);

export const validateSubmission = (req, res, next) => {
  const assignmentId = req.body.assignmentId || req.params.id;
  if (!assignmentId) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: assignmentId is required for submission.',
      code: 'VALIDATION_FAILED'
    });
  }
  next();
};

export const validateNote = validateBody(['title', 'content']);

export const validateTeacherQuestion = validateBody(['title', 'question', 'teacherId']);

export const validateAICoachPrompt = (req, res, next) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a study question or topic for the AI Coach.',
      code: 'INVALID_AI_PROMPT'
    });
  }

  if (prompt.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'AI Coach prompts must be 2000 characters or fewer.',
      code: 'AI_PROMPT_TOO_LONG'
    });
  }

  req.body.prompt = prompt;
  next();
};

export const validateGrade = (req, res, next) => {
  const grade = req.body.grade;
  if (grade === undefined || grade === null || isNaN(Number(grade)) || Number(grade) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: A valid non-negative numeric grade is required.',
      code: 'INVALID_GRADE'
    });
  }
  next();
};

