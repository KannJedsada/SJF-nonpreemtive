class Controller {
  constructor() {
    this.processList = [];
    this.terminateList = [];
    this.readyQueue = [];
    this.ioQueue = [];
    this.clock = 0;
    this.useMemory = 0;
    this.avgTtime;
    this.avgWtime;
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
      this.processMemory();
    }, 1000);
  }

  updateClock() {
    const clockDisplay = document.getElementById("clockDisplay");
    if (clockDisplay) {
      clockDisplay.innerText = "Clock: " + this.clock;
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
            <td>${((process.pMemory / 150) * 100).toFixed(2)}%</td>
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
            <td>${process.pWtime}</td>
            <td class="${process.pStatus}">${process.pStatus}</td>
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
        <td>${process.runningTime}</td>
        <td>${process.respondTime}</td>
        <td class="${process.pStatus}">${process.pStatus}</td>
        `;
      tbody.appendChild(row);
    });
  }
  //Table IO Queue
  IoDeviceTable() {
    const tbody = document.getElementById("ioDeviceBody"); // Correct the typo here
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

  ioQueueTable() {
    const tbody = document.getElementById("ioQueueBody"); // Correct the typo here
    tbody.innerHTML = "";
    this.ioQueue.forEach((process) => {
      if (process.ioStatus === "waiting") {
        const row = document.createElement("tr"); // Correct the typo here
        row.innerHTML = `
              <td>${process.pName}</td>
              <td>${process.runningTime}</td>
              <td>${process.respondTime}</td>
              <td class="io${process.ioStatus}">${process.ioStatus}</td>
          `;
        tbody.appendChild(row); // Append the row to the table body
      }
    });
  }

  //Table Controller
  showAvgtime() {
    // Update AVG Waitting display
    const avgWaittingDisplay = document.getElementById("avgWaittingDisplay");
    if (this.avgWtime === undefined) {
      avgWaittingDisplay.innerText = "AVG Waitting: " + "0.00";
    } else {
      avgWaittingDisplay.innerText = "AVG Waitting: " + this.avgWtime;
    }

    // Update AVG Turnaround display
    const avgTurnaroundDisplay = document.getElementById(
      "avgTurnaroundDisplay"
    );
    if (this.avgTtime === undefined) {
      avgTurnaroundDisplay.innerText = "AVG Turnaround: " + "0.00";
    } else {
      avgTurnaroundDisplay.innerText = "AVG Turnaround: " + this.avgTtime;
    }

    const useMemoryDisplay = document.getElementById("memoryDisplay");
    useMemoryDisplay.innerText = "Memory: " + this.useMemory + " %";
    // }
  }

  processRunning() {
    // Update CPU Process display
    const cpuProcessDisplay = document.getElementById("cpuProcessDisplay");
    const runningProcess = this.processList.find(
      (process) => process.pStatus === "running"
    );
    cpuProcessDisplay.innerText =
      "CPU Process: " + (runningProcess ? runningProcess.pName : "None");

    // Update IO Process display
    const ioProcessDisplay = document.getElementById("ioProcessDisplay");
    const runningIO = this.ioQueue.find(
      (process) => process.ioStatus === "running"
    );
    ioProcessDisplay.innerText =
      "I/O Process: " + (runningIO ? runningIO.pName : "None");
  }

  addProcess() {
    console.log("test");
    let sumMemory = 0;
    // คำนวณผลรวมของหน่วยความจำทั้งหมดที่กำลังใช้งานอยู่โดยปัจจุบัน
    for (let i = 0; i < this.processList.length; i++) {
      sumMemory += this.processList[i].pMemory;
    }
    let pName =
      "Process" + (this.processList.length + this.terminateList.length + 1);
    let pAtime = this.clock;
    let pBtime = Math.floor(Math.random() * 10 + 4);
    // let pMemory = Math.floor(Math.random() * 10 + 20);
    let pMemory = 30;
    let newProcess = new Process(pName, pAtime, pBtime, pMemory);
    let prevProcess = this.processList[this.processList.length - 1];

    if (sumMemory + newProcess.pMemory > 150) {
      Swal.fire({
        icon: "error",
        title: "Memory Full",
        showConfirmButton: false,
        timer: 1000,
      });
      console.log("Memory full");
      return;
    }

    this.processList.push(newProcess);
    this.updatePcb();
    this.updateReadyqueue();
    this.processMemory();
    console.log(this.useMemory);
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
    this.processMemory();
    this.showAvgtime();
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
        this.useMemory -= runningProcess.pMemory; // ลดหน่วยความจำทันที
        this.terminateList.push(runningProcess);
        this.calculateTime();
        // ค้นหาดัชนีของกระบวนการที่กำลังทำงานในอาร์เรย์ processList
        let index = this.processList.indexOf(runningProcess);
        if (index !== -1) {
          setTimeout(() => {
            this.processList.splice(index, 1);
            this.processMemory();
            this.showAvgtime();
          }, 100);
        }
        // ถ้ามีกระบวนการพร้อมใช้งานในคิว
        if (this.readyQueue.length > 0) {
          let nextProcess = this.readyQueue.shift();
          setTimeout(() => {
            nextProcess.pStatus = Process.validIoStatus[2];
          }, 500);
        }
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "No Process",
        showConfirmButton: false,
        timer: 1000,
      });
    }
    this.updatePcb();
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
          this.IoDeviceTable();
        }, 100);
        setTimeout(() => {
          runningProcess.ioStatus = Process.validIoStatus[2];
          this.IoDeviceTable();
        }, 100);
      } else {
        setTimeout(() => {
          runningProcess.ioStatus = Process.validIoStatus[1];
          this.IoDeviceTable();
          this.ioQueueTable();
        }, 100);
      }
      if (this.readyQueue.length > 0) {
        let nextProcess = this.readyQueue.shift();
        setTimeout(() => {
          nextProcess.pStatus = Process.validIoStatus[2];
        }, 100);
      }
      this.updatePcb();
      this.IoDeviceTable();
      this.ioQueueTable();
    } else {
      Swal.fire({
        icon: "error",
        title: "No process runnig",
        showConfirmButton: false,
        timer: 1000,
      });
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
      this.IoDeviceTable();
      this.ioQueueTable();
      setTimeout(() => {
        let nextIoDevice = this.ioQueue[0];
        nextIoDevice.ioStatus = Process.validIoStatus[2];
      }, 100);
      if (!runningProcessFound) {
        setTimeout(() => {
          process.pStatus = Process.validStatus[2];
          this.IoDeviceTable();
          this.ioQueueTable();
        }, 100);
      } else {
        setTimeout(() => {
          process.pStatus = Process.validStatus[1];
          this.readyQueue.push(process);
          this.updateReadyqueue();
          this.ioQueueTable();
          this.updatePcb();
        }, 100);
      }
    } else if (this.ioQueue.length === 1) {
      let process = this.ioQueue.shift(); // นำ process ที่อยู่ใน ioQueue ออก
      this.IoDeviceTable(); // อัพเดตสถานะ ioQueue
      // เปลี่ยนสถานะ process
      if (!runningProcessFound) {
        setTimeout(() => {
          process.pStatus = Process.validStatus[2];
          this.IoDeviceTable();
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
      Swal.fire({
        icon: "error",
        title: "No I/O device",
        showConfirmButton: false,
        timer: 1000,
      });
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

          setTimeout(() => {
            this.processList.splice(index, 1); // ลบกระบวนการที่จบลงหลังจากจบ
            this.processMemory();
            this.showAvgtime();
          }, 100);
          if (this.readyQueue.length > 0) {
            let nextProcess = this.readyQueue.shift();
            setTimeout(() => {
              nextProcess.pStatus = Process.validIoStatus[2];
            }, 500);
          }
        }
      } else if (process.pStatus === "ready") {
        process.pWtime++;
      }
    });
    this.updatePcb();
    this.processRunning();
    this.updateReadyqueue();
    this.updateTerminateList();
  }

  ioRuntime() {
    if (this.ioQueue.length > 0) {
      this.ioQueue.forEach((process) => {
        if (process.ioStatus === "running") {
          process.runningTime++;
        } else if (process.ioStatus === "waiting") {
          process.respondTime++;
        }
        this.IoDeviceTable();
      });
    }
  }

  calculateTime() {
    let sumWtime = this.terminateList.reduce(
      (sum, process) => sum + process.pWtime,
      0
    );
    let sumTtime = this.terminateList.reduce(
      (sum, process) => sum + process.pTtime,
      0
    );
    this.avgWtime = (sumWtime / this.terminateList.length).toFixed(2);
    this.avgTtime = (sumTtime / this.terminateList.length).toFixed(2);
  }

  processMemory() {
    let sumMemory = this.processList.reduce(
      (sum, process) => sum + process.pMemory,
      0
    );
    this.useMemory = ((100 / 150) * sumMemory).toFixed(2);
  }

  resetPage() {
    Swal.fire({
      title: "Are you Reset Page?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Reset!",
    }).then((result) => {
      if (result.isConfirmed) {
        // ยืนยันการรีเซ็ต และทำการรีโหลดหน้าเว็บ
        window.location.reload();
      }
    });
  }
}
