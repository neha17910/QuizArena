/**
 * Evaluates whether a submitted answer is correct based on question type
 */
function evaluateAnswer(question, submittedAnswer) {
  if (!question) return { isCorrect: false };
  if (submittedAnswer === undefined || submittedAnswer === null) {
    return { isCorrect: false };
  }

  const { questionType, correctAnswer, options } = question;

  switch (questionType) {
    case 'mcq':
    case 'true_false':
    case 'image_based':
    case 'code_based': {
      // Find matching option or direct comparison
      if (typeof submittedAnswer === 'string' && typeof correctAnswer === 'string') {
        const isMatch = submittedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        if (isMatch) return { isCorrect: true };
      }
      // Check if submittedAnswer matches the correct option's id or text
      const correctOption = options?.find((opt) => opt.isCorrect || opt.id === correctAnswer || opt.text === correctAnswer);
      if (correctOption) {
        if (
          submittedAnswer === correctOption.id ||
          submittedAnswer === correctOption.text ||
          (typeof submittedAnswer === 'string' && submittedAnswer.trim().toLowerCase() === correctOption.text.trim().toLowerCase())
        ) {
          return { isCorrect: true };
        }
      }
      return { isCorrect: false };
    }

    case 'multiple_select': {
      // Both submittedAnswer and correctAnswer should be arrays
      const correctIds = options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) || [];
      const userSelected = Array.isArray(submittedAnswer) ? submittedAnswer : [submittedAnswer];

      if (correctIds.length === 0 && Array.isArray(correctAnswer)) {
        correctIds.push(...correctAnswer);
      }

      // Check if same length and all elements match
      if (userSelected.length !== correctIds.length) {
        return { isCorrect: false };
      }

      const allMatch = correctIds.every((id) => userSelected.includes(id));
      return { isCorrect: allMatch };
    }

    case 'fill_in_blank':
    case 'short_answer': {
      const userStr = String(submittedAnswer).trim().toLowerCase();
      if (Array.isArray(correctAnswer)) {
        const matchesAny = correctAnswer.some((ans) => String(ans).trim().toLowerCase() === userStr);
        return { isCorrect: matchesAny };
      }
      const correctStr = String(correctAnswer || '').trim().toLowerCase();
      return { isCorrect: userStr === correctStr };
    }

    case 'numerical': {
      const userNum = parseFloat(submittedAnswer);
      if (isNaN(userNum)) return { isCorrect: false };

      if (typeof correctAnswer === 'object' && correctAnswer !== null && correctAnswer.value !== undefined) {
        const target = parseFloat(correctAnswer.value);
        const tolerance = parseFloat(correctAnswer.tolerance || 0);
        return { isCorrect: Math.abs(userNum - target) <= tolerance };
      }

      const targetNum = parseFloat(correctAnswer);
      return { isCorrect: Math.abs(userNum - targetNum) < 0.0001 };
    }

    case 'matching': {
      // submittedAnswer is expected to be an object or array of { left, right } pairs
      if (!Array.isArray(submittedAnswer) || !Array.isArray(correctAnswer)) {
        return { isCorrect: false };
      }
      if (submittedAnswer.length !== correctAnswer.length) {
        return { isCorrect: false };
      }
      const allPairsMatch = correctAnswer.every((correctPair) => {
        return submittedAnswer.some(
          (userPair) =>
            userPair.left?.toLowerCase() === correctPair.left?.toLowerCase() &&
            userPair.right?.toLowerCase() === correctPair.right?.toLowerCase()
        );
      });
      return { isCorrect: allPairsMatch };
    }

    case 'poll': {
      // Poll questions have no wrong answers, every answer counts
      return { isCorrect: true, isPoll: true };
    }

    default:
      return { isCorrect: false };
  }
}

/**
 * Calculates awarded points based on correctness, time bonus, negative marking, and streak
 */
function calculateScore({
  question,
  isCorrect,
  timeRemaining = 0,
  totalTime = 30,
  currentStreak = 0,
  settings = {}
}) {
  const basePoints = question.points || settings.positiveMarking || 100;
  const negativeMarking = settings.negativeMarking || 0;

  if (!isCorrect) {
    return {
      awardedPoints: negativeMarking > 0 ? -negativeMarking : 0,
      newStreak: 0,
      timeBonus: 0
    };
  }

  // Speed bonus: up to 50% extra points for instant response
  const timeRatio = Math.max(0, Math.min(1, timeRemaining / (totalTime || 30)));
  const timeBonus = Math.round(50 * timeRatio);

  // Streak bonus: 10 extra points per streak beyond 2
  const streakBonus = currentStreak >= 2 ? Math.min(30, (currentStreak - 1) * 10) : 0;

  const awardedPoints = basePoints + timeBonus + streakBonus;
  const newStreak = currentStreak + 1;

  return {
    awardedPoints,
    newStreak,
    timeBonus,
    streakBonus
  };
}

module.exports = {
  evaluateAnswer,
  calculateScore
};
