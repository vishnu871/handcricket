
export const HAND_VALUES = [0, 1, 2, 3, 4, 5, 6];

export function createInitialMatch(players) {
  if (!players?.player1 || !players?.player2) {
    throw new Error("Both players are required to start a match.");
  }

  return {
    status: "playing",
    inningsNumber: 1,
    players,
    battingPlayerId: "player1",
    bowlingPlayerId: "player2",
    innings: [],
    currentInnings: createInnings(1, "player1", "player2"),
    target: null,
    winner: null,
    resultMessage: null,
    lastBall: null,
  };
}

function createInnings(number, battingPlayerId, bowlingPlayerId) {
  return {
    number,
    battingPlayerId,
    bowlingPlayerId,
    runs: 0,
    wickets: 0,
    balls: 0,
    history: [],
  };
}

function getPlayerName(match, playerId) {
  return match.players[playerId].name;
}

export function getOvers(balls) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

export function getCurrentBattingPlayer(match) {
  return match.players[match.battingPlayerId];
}

export function getCurrentBowlingPlayer(match) {
  return match.players[match.bowlingPlayerId];
}

export function playBall(match, batsmanNumber, bowlerNumber) {
  if (match.status !== "playing") {
    throw new Error("The match is not currently accepting deliveries.");
  }

  if (
    !HAND_VALUES.includes(batsmanNumber) ||
    !HAND_VALUES.includes(bowlerNumber)
  ) {
    throw new Error("Both players must show a number between 0 and 6.");
  }

  const current = match.currentInnings;
  const isWicket = batsmanNumber === bowlerNumber;
  const runs = isWicket ? 0 : batsmanNumber;

  const ballNumber = current.balls + 1;
  const updatedInnings = {
    ...current,
    runs: current.runs + runs,
    wickets: current.wickets + (isWicket ? 1 : 0),
    balls: ballNumber,
  };

  const ball = {
    ballNumber,
    batsmanNumber,
    bowlerNumber,
    runs,
    wicket: isWicket,
    over: getOvers(ballNumber),
    batsman: getPlayerName(match, match.battingPlayerId),
    bowler: getPlayerName(match, match.bowlingPlayerId),
  };

  updatedInnings.history = [...current.history, ball];

  const updatedMatch = {
    ...match,
    currentInnings: updatedInnings,
    lastBall: ball,
  };

  const inningsEnded = isWicket;

  if (inningsEnded) {
    const completedInnings = [
      ...match.innings,
      updatedInnings,
    ];

    if (match.inningsNumber === 1) {
      return {
        ...updatedMatch,
        innings: completedInnings,
        target: updatedInnings.runs + 1,
        status: "innings_break",
        resultMessage: `${getPlayerName(
          match,
          match.battingPlayerId
        )}'s innings is over. ${getPlayerName(
          match,
          match.bowlingPlayerId
        )} needs ${updatedInnings.runs + 1} runs to win.`,
      };
    }

    return finishMatch({
      ...updatedMatch,
      innings: completedInnings,
    });
  }

  if (
    match.inningsNumber === 2 &&
    updatedInnings.runs >= match.target
  ) {
    return finishMatch({
      ...updatedMatch,
      innings: [...match.innings, updatedInnings],
    });
  }

  return updatedMatch;
}

export function startSecondInnings(match) {
  if (match.status !== "innings_break") {
    throw new Error("The first innings has not finished.");
  }

  return {
    ...match,
    status: "playing",
    inningsNumber: 2,
    battingPlayerId: "player2",
    bowlingPlayerId: "player1",
    currentInnings: createInnings(2, "player2", "player1"),
    resultMessage: null,
    lastBall: null,
  };
}

function finishMatch(match) {
  const firstInnings = match.innings[0];
  const secondInnings = match.currentInnings;

  let winner = null;
  let resultMessage;

  if (secondInnings.runs > firstInnings.runs) {
    winner = secondInnings.battingPlayerId;
    resultMessage = `${getPlayerName(
      match,
      winner
    )} wins the match!`;
  } else if (secondInnings.runs < firstInnings.runs) {
    winner = firstInnings.battingPlayerId;
    resultMessage = `${getPlayerName(
      match,
      winner
    )} wins the match!`;
  } else {
    resultMessage = "The match is tied!";
  }

  return {
    ...match,
    status: "completed",
    innings: match.innings,
    winner,
    resultMessage,
  };
}

export function getBallResult(ball) {
  if (!ball) return null;

  return ball.wicket ? "wicket" : ball.runs;
}
