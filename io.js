class ioDevice {
  constructor() {
    this.ioQueue = [];
    this.runningTime = 0;
    this.status = new StatusIO("waiting");
  }

  getIOQueue() {
    return this.ioQueue;
  }

  enqueueProcess(
    pName,
    runningTime = 0,
    respondTime = 0,
    status = new StatusIO("waiting")
  ) {
    this.ioQueue.push({ pName, runningTime, respondTime, status });
  }

  setStatusIO(status) {
    this.status.setStatusIO(status);
  }

  getStatusIO() {
    return this.status.getStatusIO();
  }

  dequeueProcess() {
    return this.ioQueue.shift();
  }

  isEmpty() {
    return this.ioQueue.length === 0;
  }
}

class StatusIO {
  constructor(initialStatusIO) {
    this.statusIO = initialStatusIO;
  }

  getStatusIO() {
    return this.statusIO;
  }

  setStatusIO(newStatusIO) {
    this.statusIO = newStatusIO;
  }
}
