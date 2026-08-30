/**
 * Application Feature Flags & UI Configuration
 * 
 * Set any flag to true or false to control button visibility across the app:
 * - SHOW_REVIEW_ANSWERKEY: Controls the "Review Answerkey" button on /result page
 * - SHOW_VIEW_RANK: Controls the "View Your Rank" button on /result page & /review-answerkey page
 * - SHOW_DOWNLOAD_SCORECARD: Controls the "Download Scorecard" button on /result page
 */

export const APP_FEATURE_FLAGS = {
  // Set to true to show, false to hide
  SHOW_REVIEW_ANSWERKEY: true,
  SHOW_VIEW_RANK: true,
  SHOW_DOWNLOAD_SCORECARD: true,
};
