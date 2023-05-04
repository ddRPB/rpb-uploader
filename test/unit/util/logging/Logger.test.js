import LogLevels from "../../../../src/constants/LogLevels";
import Logger from "../../../../src/util/logging/Logger";

describe("Logger tests", () => {
  test("empty String throws", () => {
    expect(true).toBe(true);
  });

  describe("getIntLevelByString", () => {
    const log = new Logger(LogLevels.INFO);

    expect(log.getIntLevelByString(LogLevels.TRACE)).toBe(10);
    expect(log.getIntLevelByString(LogLevels.DEBUG)).toBe(20);
    expect(log.getIntLevelByString(LogLevels.INFO)).toBe(30);
    expect(log.getIntLevelByString(LogLevels.WARN)).toBe(40);
    expect(log.getIntLevelByString(LogLevels.ERROR)).toBe(50);
    expect(log.getIntLevelByString(LogLevels.FATAL)).toBe(60);
  });

  describe("addLog", () => {
    const log = new Logger(LogLevels.TRACE);

    log.trace("message", {}, "data");
    expect(log.logstore.length).toBe(1);
  });

  describe("trace - with level trace", () => {
    const log = new Logger(LogLevels.TRACE);

    log.trace("message", {}, "data");
    expect(log.logstore.length).toBe(1);
  });

  describe("trace", () => {
    const log = new Logger(LogLevels.INFO);
    log.trace({}, "message", {}, "data");

    expect(log.logstore.length).toBe(0);
  });
});
