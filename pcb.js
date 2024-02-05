class Job {
  constructor(pName, aTime, bTime, wTime) {
    this.pName = pName;
    this.aTime = aTime;
    this.bTime = bTime;
    this.initialBurstTime = bTime;
    this.wTime = wTime;
    this.tTime = 0;
    this.status = new Status("new");
  }

  setArrivalTime(aTime) {
    this.aTime = aTime;
  }

  setBurstTime(bTime) {
    this.bTime = bTime;
  }

  getBurstTime() {
    return this.bTime;
  }

  setWaitingTime(wTime) {
    this.wTime = wTime;
  }

  setStatus(status) {
    this.status.setStatus(status);
  }

  getStatus() {
    return this.status.getStatus();
  }

  setTurnaroundTime(tTime) {
    this.tTime = tTime;
  }

  getTurnaroundTime() {
    return this.tTime;
  }

  setInitialBurstTime(initialBurstTime) {
    this.initialBurstTime = initialBurstTime;
  }

  getInitialBurstTime() {
    return this.initialBurstTime;
  }

  createRow() {
    let row = document.createElement("tr");
    row.innerHTML = `
        <td>${this.pName}</td>
        <td>${this.aTime}</td>
        <td>${this.bTime}</td>
        <td>${this.wTime}</td>
        <td>${this.status.getStatus()}</td>
      `;
    return row;
  }
}

class Status {
  constructor(initialStatus) {
    this.status = initialStatus;
  }

  getStatus() {
    return this.status;
  }

  setStatus(newStatus) {
    this.status = newStatus;
  }
}

class ReadyQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(process) {
    this.queue.push(process);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  getQueue() {
    return this.queue;
  }

  sortQueueByBurstTime() {
    this.queue.sort((a, b) => a.bTime - b.bTime);
  }

  createRowRq(process) {
    let rowr = document.createElement("tr");
    rowr.innerHTML = `
          <td>${process.pName}</td>
          <td>${process.aTime}</td>
          <td>${process.bTime}</td>
          <td>${process.wTime}</td>
        `;
    return rowr;
  }
}

class Terminate {
  constructor() {
    this.terminateList = [];
  }

  addProcess(process, oldBurstTime, turnaroundTime) {
    process.setBurstTime(oldBurstTime);
    process.setTurnaroundTime(turnaroundTime);

    if (!this.hasProcess(process)) {
      this.terminateList.push(process);
    }
  }

  hasProcess(processToCheck) {
    return this.terminateList.some(process => process.pName === processToCheck.pName);
  }

  getTerminateList() {
    return this.terminateList;
  }

  createRowT(process) {
    let rowt = document.createElement("tr");
    rowt.innerHTML = `
              <td>${process.pName}</td>
              <td>${process.aTime}</td>
              <td>${process.bTime}</td>
              <td>${process.wTime}</td>
              <td>${process.getTurnaroundTime()}</td>
              <td>${process.status.getStatus()}</td>
            `;
    return rowt;
  }
}


class Controller {
  constructor() {
    this.runningProcesses = [];
    this.avgwaitingTime = 0;
    this.avgturnaroundTime = 0;
  }
  setCurrentRunningProcess(process) {
    this.currentRunningProcess = process;
  }

  addRunningProcess(process) {
    this.runningProcesses.push(process);
  }

  removeRunningProcess(process) {
    this.runningProcesses.shift(process);
  }

  calculateAvgwaitingTime(terminateList) {
    let totalWaitingTime = 0;

    terminateList.getTerminateList().forEach((terminatedProcess) => {
      totalWaitingTime += terminatedProcess.wTime;
    });

    if (terminateList.getTerminateList().length > 0) {
      this.avgwaitingTime =
        totalWaitingTime / terminateList.getTerminateList().length;
    } else {
      this.avgwaitingTime = 0;
    }
  }

  getAvgwaitingTime() {
    return this.avgwaitingTime.toFixed(2);
  }

  calculateAvgTurnaround(terminateList) {
    let totalTurnaround = 0;

    terminateList.getTerminateList().forEach((terminatedProcess) => {
      totalTurnaround += terminatedProcess.tTime;
    });

    if (terminateList.getTerminateList().length > 0) {
      this.avgturnaroundTime =
        totalTurnaround / terminateList.getTerminateList().length;
    } else {
      this.avgturnaroundTime = 0;
    }
  }

  getAvgturnaroundTime() {
    return this.avgturnaroundTime.toFixed(2);
  }
}
