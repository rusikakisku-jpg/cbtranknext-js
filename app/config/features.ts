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
  SHOW_VIEW_RANK: false,
  SHOW_DOWNLOAD_SCORECARD: true,

  /**
   * Home Page Latest Blogs Section:
   * - Set to true to show latest 5 blog posts on the home page.
   * - Set to false to completely hide the blog posts section from the home page.
   * Can also be controlled via process.env.SHOW_HOMEPAGE_BLOGS ('true' / 'false').
   */
  SHOW_HOMEPAGE_BLOGS: process.env.SHOW_HOMEPAGE_BLOGS !== undefined
    ? process.env.SHOW_HOMEPAGE_BLOGS === 'true'
    : true,
};
