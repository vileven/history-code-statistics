import parseDuration from 'parse-duration';
import createLog from './utils/log';
import { makeHistoryDataset } from './scripts/makeHistoryDataset';
import { generateHTML } from './scripts/generateHtml';
import fs from 'fs';

const scanDir = process.env.SCAN_DIR || '.';
const period = parseDuration(process.env.PERIOD || '2w');
const branch = process.env.GIT_BRANCH || 'main';
const from = new Date(process.env.FROM_DATE || '2022-05-25');
const outputPath = process.env.OUTPUT_PATH || 'index.html';
const languages = process.env.LANGUAGES || 'all';

const log = createLog('initial-script-runner');

log('params');
console.dir({ scanDir, period, branch, from });

const { resultDatasets, setOfLanguages } = makeHistoryDataset(from, period, scanDir, branch);

const resultSet = languages !== 'all' ? new Set(languages.split(',')) : setOfLanguages;
const html = generateHTML(resultDatasets, resultSet);

fs.writeFileSync(outputPath, html);

log('successfully finished generation');
