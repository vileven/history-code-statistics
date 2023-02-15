export type LogFun = (str: string) => void;

const createLog =
    (prefix: string): LogFun =>
    (str: string) => {
        console.log(`💙${prefix}: ${str}`);
    };

export default createLog;
