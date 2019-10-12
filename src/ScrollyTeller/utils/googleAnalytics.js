/* global window */

function padNumberWithZeros(number, width) {
  return new Array(+width + 1 - (number.toString()).length).join('0') + number;
}

function orderedSectionName(index, sectionId) {
  return `${padNumberWithZeros(index, 4)}--${sectionId}`;
}

function cappedTimeElapsed({
  maxTimeInSeconds,
  startTime,
}) {
  const elapsedTime = Math.round(
    (new Date() - startTime) / 1000,
  );
  return elapsedTime >= maxTimeInSeconds
    ? maxTimeInSeconds
    : elapsedTime;
}

export function sendEnteredNarrationAnalytics({
  enteringNarrationIndex,
  enteringSectionId,
  enteringSectionIndex,
  pageLoadStartTime,
  maxTimeInSeconds,
}) {
  const section = orderedSectionName(enteringSectionIndex, enteringSectionId);

  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Narration Entry Time (seconds since page load)',
    eventAction: `${section}--${enteringNarrationIndex}`,
    eventLabel: `Entered narration #${enteringNarrationIndex} (EventValue) seconds since page load`,
    eventValue: cappedTimeElapsed({
      maxTimeInSeconds,
      startTime: pageLoadStartTime,
    }),
  });
}

export function sendExitedNarrationAnalytics({
  exitingNarrationIndex,
  exitedSectionId,
  exitedSectionIndex,
  maxTimeInSeconds,
  timeEntered,
}) {
  const section = orderedSectionName(exitedSectionIndex, exitedSectionId);

  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Time in Narration (seconds)',
    eventAction: `${section}--${exitingNarrationIndex}`,
    eventLabel: `Exited ${section}, narration #${exitingNarrationIndex} after (EventValue) seconds`,
    eventValue: cappedTimeElapsed({
      startTime: timeEntered,
      maxTimeInSeconds,
    }),
  });
}

export function sendEnteredSectionAnalytics({
  enteringSectionId,
  enteringSectionIndex,
  pageLoadStartTime,
  maxTimeInSeconds,
}) {
  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Section Entry Time (seconds since page load)',
    eventAction: orderedSectionName(enteringSectionIndex, enteringSectionId),
    eventLabel: `Entered section ${enteringSectionId} (EventValue) seconds since page load`,
    eventValue: cappedTimeElapsed({
      maxTimeInSeconds,
      startTime: pageLoadStartTime,
    }),
  });
}

export function sendExitedSectionAnalytics({
  exitedNarrationIndex,
  exitedSectionId,
  exitedSectionIndex,
  maxTimeInSeconds,
  timeEntered,
}) {
  const section = orderedSectionName(exitedSectionIndex, exitedSectionId);

  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Time in Section (seconds)',
    eventAction: section,
    eventLabel: `Exited ${section}, narration #${exitedNarrationIndex} after (EventValue) seconds`,
    eventValue: cappedTimeElapsed({
      startTime: timeEntered,
      maxTimeInSeconds,
    }),
  });
}

export function sendScrollToAnalytics({
  enteringSectionId,
  enteringSectionIndex,
  enteringNarrationIndex: enterNIndex,
  maxTimeInSeconds,
  pageLoadStartTime,
  exitedSectionId,
  exitedSectionIndex,
  exitedNarrationIndex: exitNIndex,
}) {
  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Scroll From-To (SectionIndex---SectionId---NarrationIndex)',
    eventAction: `From ${orderedSectionName(exitedSectionIndex, exitedSectionId)}--${exitNIndex}`,
    eventLabel: `To ${orderedSectionName(enteringSectionIndex, enteringSectionId)}--${enterNIndex}`,
    eventValue: cappedTimeElapsed({ maxTimeInSeconds, startTime: pageLoadStartTime }),
  });
  window.ga('send', {
    hitType: 'event',
    eventCategory: 'Scroll To-From (SectionIndex---SectionId---NarrationIndex)',
    eventAction: `To ${orderedSectionName(enteringSectionIndex, enteringSectionId)}--${exitNIndex}`,
    eventLabel: `From ${orderedSectionName(exitedSectionIndex, exitedSectionId)}--${enterNIndex}`,
    eventValue: cappedTimeElapsed({ maxTimeInSeconds, startTime: pageLoadStartTime }),
  });
}
