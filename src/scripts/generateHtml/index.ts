import { LanguageResultData } from '../makeHistoryDataset';
import createLog from '../../utils/log';

export type DataSets = Array<{ readonly date: string; readonly codeInfo: LanguageResultData }>;

const log = createLog('generate-html');

interface Dataset {
    label: string;
    data: { x: string; y: number }[];
    pointRadius: 5;
}
interface Chart {
    id: string;
    title: string;
    datasets: Dataset[];
}

export function generateHTML(resultDatasets: DataSets, setOfLanguages: Set<string>) {
    log('start generating HTML');
    const getDataset = (key: string, getter: (o: LanguageResultData[string]) => number) => {
        return resultDatasets.map(({ date, codeInfo }) => {
            const datum = codeInfo[key];

            return { x: date, y: getter(datum ?? {}) };
        });
    };

    const charts: Chart[] = [
        {
            id: 'chart1',
            title: 'Number of files',
            datasets: [
                ...[...setOfLanguages.values()].map(
                    (key) =>
                        ({
                            label: key,
                            data: getDataset(key, ({ nFiles = 0 }) => nFiles),
                            pointRadius: 5
                        } as Dataset)
                )
            ]
        },
        {
            id: 'chart2',
            title: 'Number of code lines',
            datasets: [
                ...[...setOfLanguages.values()].map(
                    (key) =>
                        ({
                            label: key,
                            data: getDataset(
                                key,
                                ({ code = 0, blank = 0, comment = 0 }) => code + blank + comment
                            ),
                            pointRadius: 5
                        } as Dataset)
                )
            ]
        },
        ...[...setOfLanguages.values()].map((key, index) => {
            return {
                id: 'chart' + (3 + index),
                title: 'Distribution of code lines: ' + key,
                datasets: [
                    {
                        label: 'code',
                        data: getDataset(key, ({ code = 0 }) => code),
                        pointRadius: 5
                    },
                    {
                        label: 'comment',
                        data: getDataset(key, ({ comment = 0 }) => comment),
                        pointRadius: 5
                    },
                    {
                        label: 'blank',
                        data: getDataset(key, ({ blank = 0 }) => blank),
                        pointRadius: 5
                    }
                ] as Dataset[]
            };
        })
    ];

    log('generated chart data:');
    console.log(charts);

    const generateMarkup = () => {
        let result = '';
        const rowStart = '<div class="row">';
        const rowEnd = '</div>';

        charts.forEach((chart, index) => {
            if ((index + 1) % 2 === 1) {
                result += rowStart;
            }
            result += `
                    <div class="cell">
                        <canvas id="${chart.id}"></canvas>
                    </div>
                `;
            if ((index + 1) % 2 === 0) {
                result += rowEnd;
            }
        });

        if (charts.length % 2 === 1) {
            result += rowEnd;
        }

        log('generated chart markup');

        return result;
    };

    const generateChartScriptSection = () => {
        const result = charts
            .map((chart) => {
                // language=JavaScript
                return `
                    const ctx${chart.id} = document.getElementById('${chart.id}');
    
                    new Chart(ctx${chart.id}, {
                       type: 'line',
                       data: {datasets: ${JSON.stringify(chart.datasets)}},
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top'
                                },
                                title: {
                                    display: true,
                                    text: '${chart.title}'
                                }
                            }
                        }
                    });
            `;
            })
            .join('\n');

        log('generated script section data');
        return result;
    };

    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Code history charts</title>
        <style>
            .container {
                height: 100vh;
            }
            .row {
                padding-left: 5%;
                padding-right: 5%;
                padding-bottom: 30px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .cell {
                width: 45%;
            }
        </style>
    </head>
    <body>
        <div class="container">
            ${generateMarkup()}
        </div>


        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        <script>
            ${generateChartScriptSection()}
        </script>
    </body>
</html>
`;
}
