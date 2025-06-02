let video;
let poseNet;
let poses = [];
let score = 0;
let questionIndex = 0;
let showResult = false;
let resultText = "";
let videoReady = false;
let questions = [
  { q: "淡江大學教育科技學系的英文簡稱是？", left: "ET", right: "TKU EdTech", answer: "right" },
  { q: "教育科技系最常使用來製作簡報動畫的軟體是？", left: "PowerPoint", right: "Canva", answer: "left" },
  { q: "教育科技系常用哪個平台協作筆記與專案？", left: "hackMD", right: "YouTube", answer: "left" },
  { q: "下列哪一個程式語言是教育科技系常用來寫互動網頁的？", left: "p5.js", right: "Python", answer: "left" },
  { q: "教育科技系位於淡江哪一個校區？", left: "台北校園", right: "淡水校園", answer: "right" },
  { q: "教育科技系的課程中，哪一門課主要學習教學媒體製作？", left: "教學媒體與運用", right: "教學設計", answer: "left" },
  { q: "「教育科技」的核心價值是？", left: "教得快", right: "教得懂、學得會", answer: "right" },
  { q: "教育科技系有哪些雙主修或輔系最熱門？", left: "資訊工程系", right: "中文系", answer: "left" },
  { q: "教育科技系學生畢業專題常用哪種互動展示技術？", left: "Excel 製圖", right: "VR/AR", answer: "right" },
  { q: "教育科技系有開設哪一門與 AI 有關的課程？", left: "AI 遊戲設計", right: "機器學習與教育應用", answer: "left" }
];

// 選項區域座標
const optionY = 240; // height / 2
const optionHeight = 80;
const optionLeft = { x: 0, y: optionY, w: 320, h: optionHeight }; // 左半邊
const optionRight = { x: 320, y: optionY, w: 320, h: optionHeight }; // 右半邊

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, () => {
    videoReady = true;
  });
  video.size(640, 480); // 攝影機畫面建議固定大小
  video.hide();

  if (typeof ml5 !== "undefined") {
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', function(results) {
      poses = results;
    });
  } else {
    console.error("ml5 尚未載入！");
  }
}

function modelReady() {
  console.log('PoseNet Model Loaded!');
}

function draw() {
  // 讓背景單色填滿整個視窗
  background(220);

  // 攝影機畫面顯示在畫面正中央（不鋪滿）
  if (videoReady && video.loadedmetadata) {
    push();
    // 計算攝影機畫面置中座標
    let camW = 640, camH = 480;
    let camX = (width - camW) / 2;
    let camY = (height - camH) / 2;
    translate(camX + camW, camY); // 先移動到正確位置再鏡像
    scale(-1, 1);
    image(video, 0, 0, camW, camH);
    pop();
  } else {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("攝影機尚未啟動\n請確認權限與伺服器", width / 2, height / 2);
    return;
  }

  fill(255, 0, 0);
  textSize(24);
  textAlign(RIGHT, TOP);
  text("分數: " + score, width - 10, 10);

  // ====== 新增：開頭偵測手腕的雙手模型圖示 ======
  if (poses.length === 0) {
    // 提示文字
    fill(255, 255, 0, 200);
    noStroke();
    textSize(28);
    textAlign(CENTER, CENTER);
    text("請將雙手手腕放在畫面內\n對準下方圖示", width / 2, 100);

    // 畫出雙手模型圖示（簡單圓形代表手腕）
    let leftWristGuideX = width / 4;
    let rightWristGuideX = width * 3 / 4;
    let wristGuideY = height / 2 + 60;

    // 身體
    stroke(100);
    strokeWeight(4);
    line(width / 2, wristGuideY - 60, width / 2, wristGuideY + 40); // 身體
    line(width / 2, wristGuideY - 30, leftWristGuideX, wristGuideY); // 左手
    line(width / 2, wristGuideY - 30, rightWristGuideX, wristGuideY); // 右手

    // 手腕圓點
    noStroke();
    fill(255, 128, 0, 200);
    ellipse(leftWristGuideX, wristGuideY, 36, 36);
    fill(0, 200, 255, 200);
    ellipse(rightWristGuideX, wristGuideY, 36, 36);

    // 標示
    fill(0);
    textSize(18);
    text("左手腕", leftWristGuideX, wristGuideY + 30);
    text("右手腕", rightWristGuideX, wristGuideY + 30);

    return; // 不進行後續題目顯示
  }

  if (questionIndex >= questions.length) {
    fill(0, 200, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("遊戲結束！\n總分: " + score, width / 2, height / 2);
    return;
  }

  let q = questions[questionIndex];
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(q.q, width / 2, height / 2 - 60);

  // ===== 提示手擺放在可被偵測到的位置 =====
  fill(255, 255, 0, 180);
  noStroke();
  textSize(20);
  textAlign(CENTER, CENTER);
  text("請將雙手手腕放在畫面內，靠近身體兩側，\n手腕圓點出現即可作答", width / 2, 40);

  // 畫出選項區域
  fill(0, 100, 255, 180);
  rect(optionLeft.x, optionLeft.y, optionLeft.w, optionLeft.h);
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(q.left, width / 4, optionLeft.y + optionLeft.h / 2);

  fill(0, 255, 100, 180);
  rect(optionRight.x, optionRight.y, optionRight.w, optionRight.h);
  fill(255);
  textAlign(CENTER, CENTER);
  text(q.right, width * 3 / 4, optionRight.y + optionRight.h / 2);

  // 只在 showResult 為 false 時偵測作答
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let keypoints = pose.keypoints;

    // 畫出所有關鍵點
    for (let i = 0; i < keypoints.length; i++) {
      let kp = keypoints[i];
      let x = width - kp.position.x; // 鏡像
      let y = kp.position.y;
      if (kp.score > 0.2) {
        fill(255, 0, 0);
        ellipse(x, y, 10, 10);
        fill(0);
        text(i, x + 10, y); // 標上編號
      }
    }

    // 取得左右手掌（leftPalm: keypoints[9], rightPalm: keypoints[10]）
    let leftPalm = keypoints[9];
    let rightPalm = keypoints[10];

    // 鏡像翻轉 x 座標
    let leftPalmX = width - leftPalm.position.x;
    let rightPalmX = width - rightPalm.position.x;
    let leftPalmY = leftPalm.position.y;
    let rightPalmY = rightPalm.position.y;

    // 畫出手掌座標點
    fill(255, 128, 0);
    ellipse(leftPalmX, leftPalmY, 30, 30);
    fill(0, 200, 255);
    ellipse(rightPalmX, rightPalmY, 30, 30);

    // 檢查左手掌是否碰到左選項
    if (
      leftPalm.score > 0.5 &&
      leftPalmX > optionLeft.x &&
      leftPalmX < optionLeft.x + optionLeft.w &&
      leftPalmY > optionLeft.y &&
      leftPalmY < optionLeft.y + optionLeft.h
    ) {
      checkAnswer("left");
    }
    // 檢查右手掌是否碰到右選項
    else if (
      rightPalm.score > 0.5 &&
      rightPalmX > optionRight.x &&
      rightPalmX < optionRight.x + optionRight.w &&
      rightPalmY > optionRight.y &&
      rightPalmY < optionRight.y + optionRight.h
    ) {
      checkAnswer("right");
    }
  }

  // 顯示答題結果
  if (showResult) {
    fill(resultText === "正確！" ? color(0, 200, 0) : color(200, 0, 0));
    textSize(48);
    textAlign(CENTER, CENTER);
    text(resultText, width / 2, height / 2 + 120);
  }
}

// 每題只判定一次，顯示結果後自動跳下一題
function checkAnswer(ans) {
  showResult = true;
  if (questions[questionIndex].answer === ans) {
    resultText = "正確！";
    score += 10;
  } else {
    resultText = "錯誤！";
  }
  setTimeout(() => {
    showResult = false;
    questionIndex++;
  }, 1000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
