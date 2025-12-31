import { createWriteStream } from "fs";
import { join } from "path";
import pino from "pino";
import { Transform } from "stream";

const __dirname = import.meta.dirname;

// Transform stream for clean logs with level
const cleanLogStream = new Transform({
  transform(chunk, encoding, callback) {
    const log = JSON.parse(chunk.toString());
    this.push(`[${log.time}] [${log.level}] ${log.msg}\n`);
    callback();
  },
});

const fileStream = createWriteStream(join(__dirname, "app.log"), { flags: "a" });
cleanLogStream.pipe(fileStream);

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: label => {
        return { level: label.toUpperCase() };
      },
    },
  },
  pino.multistream([
    // Console with colors
    {
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      }),
    },
    // File with clean format
    { stream: cleanLogStream },
  ])
);

export default logger;
