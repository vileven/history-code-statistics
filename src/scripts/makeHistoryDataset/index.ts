import { execSync } from 'child_process';
import createLog from '../../utils/log';
import periodIterator from '../../utils/periodIterator';
import fs from 'fs';

export type LanguageResultData = {
    [languageName: string | 'SUM']: {
        blank: number;
        comment: number;
        code: number;
        nFiles: number;
    };
};

type ClocResult = {
    header: {
        cloc_url: string;
        cloc_version: string;
        elapsed_seconds: number;
        n_files: number;
        n_lines: number;
    };
} & LanguageResultData;

const log = createLog('makeHistoryDataset');

export function makeHistoryDataset(
    from: Date,
    period: number,
    scanDirPath: string,
    branch: string
) {
    const consoleParams = { cwd: scanDirPath } as const;
    const setOfLanguages = new Set<string>();
    const emptyQueue: LanguageResultData[] = [];

    log('start iterating\n');
    const resultDatasets = [...periodIterator(from, period)].map((date, iter) => {
        log(`iteration number ${iter + 1}, date = ${date}`);

        execSync(`git checkout $(git rev-list -n1 --before=${date} ${branch})`, consoleParams);
        const clocResult = JSON.parse(execSync(`cloc --json .`, consoleParams).toString());

        if ('header' in clocResult) {
            delete clocResult.header;
        }

        const codeInfo: LanguageResultData = clocResult;

        Object.keys(codeInfo).forEach((language) => setOfLanguages.add(language));

        if (!('SUM' in codeInfo)) {
            emptyQueue.push(codeInfo);
        }

        return { date, codeInfo } as const;
    });
    execSync(`git checkout ${branch}`, consoleParams);

    let codeInfo = emptyQueue.pop();
    while (codeInfo) {
        for (const language of setOfLanguages) {
            codeInfo[language] = {
                blank: 0,
                comment: 0,
                code: 0,
                nFiles: 0
            };
        }

        codeInfo = emptyQueue.pop();
    }

    fs.writeFileSync('chartdata.json', JSON.stringify(resultDatasets));

    return { resultDatasets, setOfLanguages };
}
