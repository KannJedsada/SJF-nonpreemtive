class Controller {
  constructor() {
    this.processList = [];
    this.terminateList = [];
    this.readyQueue = [];
    this.ioQueue = [];
    this.clock = 0;
  }

  isReadyQueueEmpty() {
    return this.readyQueue.length === 0;
  }

  //นับเวลา 1 วินาที
  clock_count() {
    setInterval(() => {
      this.clock++;
      this.updateClock();
      this.runtime();
      this.ioRuntime();
      this.calculateTime();
    }, 1000);
  }

  updateClock() {
    const clockDisplayList = document.getElementById("clockDisplayList");
    const clockDisplayText = document.getElementById("clockDisplayText");

    if (clockDisplayList && clockDisplayText) {
      clockDisplayList.innerText = "Clock: " + this.clock;
      clockDisplayText.innerText = "Clock: " + this.clock;
    }
  }

  //Table PCB
  updatePcb() {
    const tbody = document.getElementById("addjob");
    tbody.innerHTML = "";
    this.processList.forEach((process) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${process.pName}</td>
            <td>${process.pAtime}</td>
            <td>${process.pBtime}</td>
            <td>${process.pWtime}</td>
            <td class="${process.pStatus}">${process.pStatus}</td>
        `;
      tbody.appendChild(row);
    });
  }
  //Table Ready Queue
  updateReadyqueue() {
    const tbody = document.getElementById("readyQueueBody");
    tbody.innerHTML = "";
    this.readyQueue.forEach((process) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${process.pName}</td>
            <td>${process.pAtime}</td>
            <td>${process.pBtime}</td>
            <td >${process.pWtime}</td>
        `;
      tbody.appendChild(row);
    });
  }
  //Table Terminate
  updateTerminateList() {
    const tbody = document.getElementById("terminateBody");
    tbody.innerHTML = "";
    this.terminateList.forEach((process) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${process.pName}</td>
        <td>${process.pAtime}</td>
        <td>${process.pBtime}</td>
        <td>${process.pWtime}</td>
        <td>${process.pTtime}</td>
        <td class="${process.pStatus}">${process.pStatus}</td>
        `;
      tbody.appendChild(row);
    });
  }

  updateIOqueue() {
    const tbody = document.getElementById("ioQueueBody"); // Correct the typo here
    tbody.innerHTML = "";
    this.ioQueue.forEach((process) => {
      const row = document.createElement("tr"); // Correct the typo here
      row.innerHTML = `
            <td>${process.pName}</td>
            <td>${process.runningTime}</td>
            <td>${process.respondTime}</td>
            <td class="io${process.ioStatus}">${process.ioStatus}</td>
        `;
      tbody.appendChild(row); // Append the row to the table body
    });
  }

  //Table Controller
  updateControllerTable(avgWtime, avgTtime) {
    // อัปเดตค่าของ Clock
    const clockDisplay = document.getElementById("clockDisplay");
    clockDisplay.innerText = "Clock: " + controller.clock;

    // อัปเดต CPU Process
    const cpuProcessDisplay = document.getElementById("cpuProcessDisplay");
    const runningProcess = controller.processList.find(
      (process) => process.pStatus === "running"
    );
    cpuProcessDisplay.innerText =
      "CPU Process: " + (runningProcess ? runningProcess.pName : "None");

    // อัปเดต IO Process
    const ioProcessDisplay = document.getElementById("ioProcessDisplay");
    const runningIO = controller.ioQueue.find(
      (process) => process.ioStatus === "running"
    );
    ioProcessDisplay.innerText =
      "IO Process: " + (runningIO ? runningIO.pName : "None");

    // อัปเดต AVG Waitting
    const avgWaittingDisplay = document.getElementById("avgWaittingDisplay");
    avgWaittingDisplay.innerText = "AVG Waitting: " + avgWtime;

    // อัปเดต AVG Turnaround
    const avgTurnaroundDisplay = document.getElementById(
      "avgTurnaroundDisplay"
    );
    avgTurnaroundDisplay.innerText = "AVG Turnaround: " + avgTtime;
  }

  addProcess() {
    let pName =
      "Process" + (this.processList.length + this.terminateList.length + 1);
    let pAtime = this.clock;
    let pBtime = Math.floor(Math.random() * 10 + 4);
    let newProcess = new Process(pName, pAtime, pBtime);
    let prevProcess = this.processList[this.processList.length - 1];
    this.processList.push(newProcess);
    this.updatePcb();
    this.updateReadyqueue();

    // เช็คว่ามีโปรเซสในระบบหรือไม่
    if (
      this.processList.length === 1 ||
      (prevProcess && prevProcess.pStatus === "waiting")
    ) {
      // ถ้าไม่มีโปรเซสอื่นอยู่ในระบบ
      setTimeout(() => {
        newProcess.pStatus = Process.validStatus[1]; // กำหนดสถานะเป็น "ready"
        this.updatePcb();
      }, 100);
      setTimeout(() => {
        newProcess.pStatus = Process.validStatus[2]; // กำหนดสถานะเป็น "running"
        this.updatePcb();
      }, 100);
    } else {
      // ถ้ามีโปรเซสอื่นในระบบแล้ว
      setTimeout(() => {
        newProcess.pStatus = Process.validStatus[1];
        this.updatePcb();
        this.readyQueue.push(newProcess);
        this.readyQueue.sort((a, b) => a.pBtime - b.pBtime);
        this.updateReadyqueue();
      }, 100);
    }
  }

  closeProcess() {
    let runningProcess = this.processList.find(
      (process) => process.pStatus === "running"
    );
    if (runningProcess) {
      // ตรวจสอบสถานะของกระบวนการก่อนการสิ้นสุด
      if (runningProcess.pStatus === "running") {
        let newBtime = runningProcess.pInitialBtime - runningProcess.pBtime;
        runningProcess.pBtime = newBtime;
        runningProcess.pTtime = this.clock - runningProcess.pAtime;
        runningProcess.pStatus = Process.validStatus[4]; // กำหนดสถานะเป็น "terminate"
        this.terminateList.push(runningProcess);

        // ค้นหาดัชนีของกระบวนการที่กำลังทำงานในอาร์เรย์ processList
        let index = this.processList.indexOf(runningProcess);
        if (index !== -1) {
          setTimeout(() => {
            this.processList.splice(index, 1);
          }, 100);
        }
        // ถ้ามีกระบวนการพร้อมใช้งานในคิว
        if (this.readyQueue.length > 0) {
          let nextProcess = this.readyQueue.shift();
          setTimeout(() => {
            nextProcess.pStatus = Process.validIoStatus[2];
          }, 100);
          this.calculateTime();
        }
      } else {
        console.log("กระบวนการไม่ได้อยู่ในสถานะการทำงาน (running)");
      }
    } else {
      console.log("ไม่มีกระบวนการที่กำลังทำงานอยู่");
    }
    this.updatePcb();
    this.updateControllerTable();
    this.updateReadyqueue();
    this.updateTerminateList();
  }

  addIO() {
    let runningProcess = this.processList.find(
      (process) => process.pStatus === "running"
    );
    if (runningProcess) {
      runningProcess.pStatus = Process.validStatus[3];
      this.ioQueue.push(runningProcess);
      if (this.ioQueue.length == 1) {
        setTimeout(() => {
          runningProcess.ioStatus = Process.validIoStatus[1];
          this.updateIOqueue();
        }, 100);
        setTimeout(() => {
          runningProcess.ioStatus = Process.validIoStatus[2];
          this.updateIOqueue();
        }, 100);
      } else {
        setTimeout(() => {
          runningProcess.ioStatus = Process.validIoStatus[1];
          this.updateIOqueue();
        }, 100);
      }
      if (this.readyQueue.length > 0) {
        let nextProcess = this.readyQueue.shift();
        setTimeout(() => {
          nextProcess.pStatus = Process.validIoStatus[2];
        }, 100);
      }
      this.updatePcb();
      this.updateIOqueue();
    } else {
      console.log("no process running");
    }
  }

  closeIO() {
    // หา process ที่ทำงานอยู่
    let runningProcessFound = false;
    this.processList.forEach((process) => {
      if (process.pStatus === "running") {
        runningProcessFound = true;
        return;
      }
    });

    if (this.ioQueue.length > 1) {
      let process = this.ioQueue.shift();
      this.updateIOqueue();
      setTimeout(() => {
        let nextIoDevice = this.ioQueue[0];
        nextIoDevice.ioStatus = Process.validIoStatus[2];
      }, 100);
      if (!runningProcessFound) {
        setTimeout(() => {
          process.pStatus = Process.validStatus[2];
          this.updateIOqueue();
        }, 100);
      } else {
        setTimeout(() => {
          process.pStatus = Process.validStatus[1];
          this.readyQueue.push(process);
          this.updateReadyqueue();
          this.updatePcb();
        }, 100);
      }
    } else if (this.ioQueue.length === 1) {
      let process = this.ioQueue.shift(); // นำ process ที่อยู่ใน ioQueue ออก
      this.updateIOqueue(); // อัพเดตสถานะ ioQueue
      // เปลี่ยนสถานะ process
      if (!runningProcessFound) {
        setTimeout(() => {
          process.pStatus = Process.validStatus[2];
          this.updateIOqueue();
        }, 100);
      } else {
        setTimeout(() => {
          process.pStatus = Process.validStatus[1];
          this.readyQueue.push(process);
          this.updateReadyqueue();
          this.updatePcb();
        }, 100);
      }
    } else {
      console.log("No I/O device");
    }
  }

  runtime() {
    // เรียกใช้ forEach ในการปรับปรุงสถานะและเวลาทำงานของกระบวนการ
    this.processList.forEach((process, index) => {
      if (process.pStatus === "running") {
        process.pBtime--;
        if (process.pBtime === 0) {
          process.pStatus = Process.validStatus[4]; // กำหนดสถานะเป็น "terminate"
          process.pTtime = this.clock - process.pAtime;
          process.pBtime = process.pInitialBtime;
          this.terminateList.push(process);
          this.calculateTime();
          if (this.readyQueue.length > 0) {
            let nextProcess = this.readyQueue.shift();
            setTimeout(() => {
              nextProcess.pStatus = Process.validIoStatus[2];
            }, 100);
          }
          setTimeout(() => {
            this.processList.splice(index, 1); // ลบกระบวนการที่จบลงหลังจากจบ
          }, 100);
        }
      } else if (process.pStatus === "ready") {
        process.pWtime++;
      }
    });
    this.updatePcb();
    this.updateReadyqueue();
    this.updateTerminateList();
    this.updateControllerTable();
  }

  ioRuntime() {
    if (this.ioQueue.length > 0) {
      this.ioQueue.forEach((process) => {
        if (process.ioStatus === "running") {
          process.runningTime++;
        } else if (process.ioStatus === "waiting") {
          process.respondTime++;
        }
        this.updateIOqueue();
      });
    }
  }

  calculateTime() {
    let sumWtime = 0;
    let sumTtime = 0;
    this.terminateList.forEach((terminate) => {
      sumWtime += terminate.pWtime;
      sumTtime += terminate.pTtime;
    });
    if (this.terminateList.length == 0) {
      this.updateControllerTable(0, 0);
    } else {
      let avgWtime = sumWtime / this.terminateList.length;
      let avgTtime = sumTtime / this.terminateList.length;
      this.updateControllerTable(avgWtime.toFixed(2), avgTtime.toFixed(2));
    }

  }
}
