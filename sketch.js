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

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, () => {
    videoReady = true;
  });
  video.size(width, height);
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
  background(220);

  // 改善 video 檢查
  if (videoReady && video.loadedmetadata) {
    image(video, 0, 0, width, height);
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

  fill(0, 100, 255, 180);
  rect(0, height / 2, width / 2, 80);
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(q.left, width / 4, height / 2 + 40);

  fill(0, 255, 100, 180);
  rect(width / 2, height / 2, width / 2, 80);
  fill(255);
  textAlign(CENTER, CENTER);
  text(q.right, width * 3 / 4, height / 2 + 40);

  if (poses.length > 0 && !showResult) {
    let pose = poses[0].pose;
    let leftWrist = pose.leftWrist;
    let rightWrist = pose.rightWrist;

    if (leftWrist.confidence > 0.5 && leftWrist.x < width / 4 && leftWrist.y > height / 2 && leftWrist.y < height / 2 + 80) {
      checkAnswer("left");
    }
    if (rightWrist.confidence > 0.5 && rightWrist.x > width * 3 / 4 && rightWrist.y > height / 2 && rightWrist.y < height / 2 + 80) {
      checkAnswer("right");
    }
  }

  if (showResult) {
    fill(resultText === "正確！" ? color(0, 200, 0) : color(200, 0, 0));
    textSize(48);
    textAlign(CENTER, CENTER);
    text(resultText, width / 2, height / 2 + 120);
  }
}

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
