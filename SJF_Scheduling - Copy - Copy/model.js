class Process {
  static validStatus = ["new", "ready", "running", "waiting", "terminate"];
  static validIoStatus = ["new", "waiting", "running", "terminate"];
  constructor(
    pName,
    pAtime,
    pBtime,
    pWtime = 0,
    pStatus,
    pTtime = 0,
    runningTime = 0,
    respondTime = 0,
    ioStatus
  ) {
    if (Process.validStatus.includes(pStatus)) {
      this.pStatus = pStatus;
    } else {
      this.pStatus = Process.validStatus[0];
    }

    if (Process.validIoStatus.includes(ioStatus)) {
      this.ioStatus = ioStatus;
    } else {
      this.ioStatus = Process.validIoStatus[0];
    }
    this.pName = pName;
    this.pAtime = pAtime;
    this.pBtime = pBtime;
    (this.pInitialBtime = pBtime), (this.pWtime = pWtime);
    this.pTtime = pTtime;
    this.respondTime = respondTime;
    this.runningTime = runningTime;
    this.ioStatus = Process.validIoStatus[0];
  }
}
