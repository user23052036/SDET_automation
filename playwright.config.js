// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */

// we have all the configeration key value pairs
// timeout tells the whole test case can run upto 40sec and expect timeout is for 
// individual assestion to become true, here const is a variable

const config = ({
  testDir: './tests',
  timeout: 40*1000, // overwriting the existing timeout
  expect: {
    timeout: 5*1000
  },
  reporter: 'html', // get html report after after running the test cases

  use: {
    browserName: 'webkit',
    // webkit is playwright specific engine derived from safari

    headless : false
  },
});


module.exports = config // so that it is available across all the files in our project
