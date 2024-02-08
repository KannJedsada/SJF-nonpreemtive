let process = [];
let processAll = [];
let readyQueue = new ReadyQueue();
let terminate = new Terminate();
let controller = new Controller();
let terminated = false;
ioDevice = new ioDevice();

let clockcount = 0;
function clock() {
  clockcount++;
  document.getElementById("clockDisplay1").innerText = `Clock: ${clockcount}`;
  document.getElementById("clockDisplay2").innerHTML = `Clock: ${clockcount}`;
}
setInterval(clock, 1000);

function addJob() {
  let pName = "Process" + (processAll.length + 1);
  let aTime = clockcount;
  let bTime = Math.floor(Math.random() * 10 + 4);
  // let bTime = 5;
  let wTime = 0;
  let newProcess = new Job(pName, aTime, bTime, wTime);
  process.push(newProcess);
  processAll.push(newProcess);
  updateTable();
  updateController();
  updateTerminateTable();
  updateReadyQueueTable();

  if (process.length === 1) {
    setTimeout(() => {
      newProcess.setStatus("ready");
      runningTime(newProcess);
      updateTable();
    }, 100);
    setTimeout(() => {
      newProcess.setStatus("running");
      updateTable();
      controller.addRunningProcess(newProcess);
      updateController();
    }, 500);
  } else {
    setTimeout(() => {
      newProcess.setStatus("ready");
      readyQueue.enqueue(newProcess);
      updateTable(newProcess);
      setInterval(() => {
        updateReadyQueueTable();
      }, 500);
      runningTime(newProcess);
      readyQueue.sortQueueByBurstTime();
    }, 500);
    updateTable(newProcess);
  }
}

function closeJob() {
  let runningProcess = null;

  for (let i = 0; i < process.length; i++) {
    if (process[i].status.getStatus() === "running") {
      runningProcess = process[i];
      break;
    }
  }

  if (runningProcess) {
    let turnaroundTime = clockcount - runningProcess.aTime;
    let newBurstTime =
      runningProcess.getInitialBurstTime() - runningProcess.bTime;

    runningProcess.setStatus("terminate");
    if (!terminate.hasProcess(runningProcess)) {
      terminate.addProcess(runningProcess, newBurstTime, turnaroundTime);
    }
    const index = process.indexOf(runningProcess);
    if (index !== -1) {
      process.splice(index, 1); 
    }
    controller.removeRunningProcess(runningProcess);
    controller.calculateAvgwaitingTime(terminate);
    controller.calculateAvgTurnaround(terminate);
    updateTable();
    updateController();
    updateTerminateTable();
    updateReadyQueueTable();
    terminated = true;

    // หาตำแหน่งของ runningProcess และลบออกจากอาร์เรย์ process
 
    console.log(process.length);
    setTimeout(() => {
      if (!readyQueue.isEmpty()) {
        let nextProcess = readyQueue.dequeue();
        nextProcess.setStatus("running");
        controller.addRunningProcess(nextProcess);
        updateController();
        updateTable(nextProcess);
        updateReadyQueueTable();
        runningTime(nextProcess);
      }
      setTimeout(() => {
        // process.shift();
        updateTable();
        updateReadyQueueTable();
        updateTerminateTable();
        updateController();
      }, 200);
    }, 100);
  }
}

function reset() {
  location.reload();
}

function updateTable() {
  let tableBody = document.getElementById("addjob");
  tableBody.innerHTML = "";

  processAll.forEach((job) => {
    if (job.status.getStatus() !== "terminate") {
      tableBody.appendChild(job.createRow());
    }
  });
}

function updateReadyQueueTable() {
  let tableBody = document.getElementById("readyQueueBody");
  tableBody.innerHTML = "";

  readyQueue.getQueue().forEach((job) => {
    tableBody.appendChild(readyQueue.createRowRq(job));
  });
}

function updateTerminateTable() {
  let terminateBody = document.getElementById("terminateBody");
  terminateBody.innerHTML = "";
  let terminateArray = terminate.getTerminateList();

  terminateArray.forEach((process) => {
    terminateBody.appendChild(terminate.createRowT(process));
  });
}

function updateController() {
  const runningProcessNames = controller.runningProcesses.map(
    (process) => process.pName
  );
  document.getElementById(
    "cpuProcessInfo"
  ).innerText = `CPU Process : ${runningProcessNames.join(", ")}`;
  const avgWaitingTime = controller.getAvgwaitingTime();
  document.getElementById("avgWaitingInfo").innerText = `AVG Waiting : ${
    avgWaitingTime !== 0 ? avgWaitingTime : "0"
  }`;
  const avgTurnaroundTime = controller.getAvgturnaroundTime();
  document.getElementById("avgTurnaroundInfo").innerText = `AVG Turnaround : ${
    avgTurnaroundTime !== 0 ? avgTurnaroundTime : "0"
  }`;
}

function updateIOqueue() {
  let iobody = document.getElementById("iobody");
  iobody.innerHTML = "";
  let ioarray = ioDevice.getIOQueue();
  ioarray.forEach((job) => {
    let row = document.createElement("tr");
    row.innerHTML = `
            <td>${job.pName}</td>
            <td>${job.runningTime}</td>
            <td>${job.respondTime}</td>
            <td>${job.status.getStatusIO()}</td>
            `;
    iobody.appendChild(row);
  });
}

let interval;

function runningTime(job) {
  interval = setInterval(() => {
    if (
      job.status.getStatus() === "waiting" ||
      job.status.getStatus() === "ready"
    ) {
      job.wTime++;
      updateTable(job);
    } else {
      if (job.status.getStatus() === "running") {
        job.bTime--;
        checkBtime(job);
        updateTable(job);
      }
    }
  }, 1000);
}

function checkBtime(job) {
  if (job.bTime <= 0) {
    let oldBurstTime = job.getInitialBurstTime();
    let turnaroundTime = clockcount - job.aTime;
    job.setStatus("terminate");
    terminate.addProcess(job, oldBurstTime, turnaroundTime);
    updateTable(job);
    updateTerminateTable(job);
    controller.removeRunningProcess(job);
    controller.calculateAvgwaitingTime(terminate);
    controller.calculateAvgTurnaround(terminate);
    const index = process.indexOf(job);
    if (index !== -1) {
      process.splice(index, 1); 
    }
    updateController();
    updateReadyQueueTable();
    terminated = false;
    setTimeout(() => {
      if (!readyQueue.isEmpty()) {
        nextProcess = readyQueue.dequeue();
        nextProcess.setStatus("running");
        controller.addRunningProcess(nextProcess);
        updateController();
        updateTable(nextProcess);
        updateReadyQueueTable();
      }
    }, 300);
  }
}

function addIo() {
  for (let i = 0; i < process.length; i++) {
    const currentProcess = process[i];
    if (currentProcess.getStatus() === "running") {
      currentProcess.setStatus("waiting");
      controller.removeRunningProcess(currentProcess);
      ioDevice.enqueueProcess(currentProcess.pName);

      if (ioDevice.ioQueue.length === 1) {
        setTimeout(() => {
          const ioQueueProcesses = ioDevice.ioQueue;
          ioQueueProcesses[0].status.setStatusIO("running");
          updateIOqueue();
        }, 100);
      }
      process.splice(i, 1);
      i--;
      updateController();
      updateReadyQueueTable();
      updateIOqueue();
      updateTable();

      if (!readyQueue.isEmpty()) {
        const nextProcess = readyQueue.dequeue();
        nextProcess.setStatus("running");
        controller.addRunningProcess(nextProcess);
        updateController();
        updateTable(nextProcess);
        updateReadyQueueTable();
      }
      
      break;
    }
  }
}

function closeIo() {
  if (process.length === 0) {
    const ioQueueItem = ioDevice.getIOQueue()[0];
    const job = processAll.find((job) => job.pName === ioQueueItem.pName);

    if (job && ioQueueItem.status.getStatusIO() === "running") {
      job.setStatus("running");
      process.push(job);
      console.log(process);
      updateTable();
      ioDevice.dequeueProcess();
      updateIOqueue();
      if (!ioDevice.isEmpty()) {
        setTimeout(() => {
          ioDevice.getIOQueue()[0].status.setStatusIO("running");
          updateIOqueue();
        }, 200);
      }
    }
  } else {
    const ioQueueItem = ioDevice.getIOQueue()[0];
    const job = processAll.find((job) => job.pName === ioQueueItem.pName);
    if (job && ioQueueItem.status.getStatusIO() === "running") {
      job.setStatus("ready");
      process.push(job);
      console.log(process);
      readyQueue.enqueue(job);
      readyQueue.sortQueueByBurstTime(job);
      updateTable();
      ioDevice.dequeueProcess();
      updateIOqueue();
      if (!ioDevice.isEmpty()) {
        setTimeout(() => {
          ioDevice.getIOQueue()[0].status.setStatusIO("running");
          updateIOqueue();
        }, 200);
      }
    }
  }
}
