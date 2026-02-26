(() => {
  const version = "Coaches";
  const versionnum = "1.7.6";
  //NEW FORMAT UPDATE APPROVED BY RJ -- fixed one incident of missing " in ;>
  const jsonVersion = 1.5;
  window.appVersion = "Coaches";
  const showversion = document.getElementById("version");
  showversion.innerHTML = `${version} ${versionnum} - JSON ${jsonVersion}`;
})();

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

let topicsData = {};
// estado global para los temas
const topicsStatus = {};

// Referencias al DOM
const syllabusDropdown = document.getElementById("syllabusDropdown");
const levelsDropdown = document.getElementById("levelsDropdown");
const weeksDropdown = document.getElementById("weeksDropdown");
const topicsList = document.getElementById("topicsList");
const cursorToggle = document.getElementById("cursorToggle");

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

fetch(`topics.json?v=${Date.now()}`)
  .then((response) => response.json())
  .then((data) => {
    topicsData = data;
    syllabusDropdown.innerHTML =
      '<option value="">-- Choose a Syllabus --</option>';

    Object.keys(data).forEach((syllabus) => {
      const option = document.createElement("option");
      option.value = syllabus;
      option.textContent = syllabus;
      syllabusDropdown.appendChild(option);
    });
  })
  .catch((error) => {
    console.error("Error al cargar el JSON:", error);
  });

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Helper para resetear dropdowns
function resetDropdown(dropdown, placeholder) {
  dropdown.innerHTML = `<option value="">${placeholder}</option>`;
  dropdown.disabled = true;
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// 1) Al cargar página → poblar syllabus
(function initSyllabus() {
  resetDropdown(levelsDropdown, "Select a syllabus first");
  resetDropdown(weeksDropdown, "Select a level first");
  topicsList.innerHTML = "";
  const helperSpan = document.getElementById("feedback-helper");
  syllabusDropdown.innerHTML = `<option value="">-- Select syllabus --</option>`;
  helperSpan.textContent = "Choose a syllabus to start!";
  Object.keys(topicsData).forEach((syl) => {
    const opt = document.createElement("option");
    opt.value = syl;
    opt.textContent = syl;
    syllabusDropdown.appendChild(opt);
  });
})();

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// 2) Al cambiar syllabus → poblar levels
syllabusDropdown.addEventListener("change", () => {
  const s = syllabusDropdown.value;
  const feedbackBtn = document.getElementById("feedback");
  const helperSpan = document.getElementById("feedback-helper");

  // 1) Reset visual de niveles, semanas y topics
  levelsDropdown.innerHTML = "";
  topicsList.innerHTML = "";
  resetDropdown(weeksDropdown, "-- Select a level first --");

  // 2) Reset estado interno
  Object.keys(topicsStatus).forEach((key) => delete topicsStatus[key]);

  // 3) Feedback button vuelve a disabled + mensaje
  feedbackBtn.disabled = true;
  helperSpan.textContent = "Now choose a level to load the weeks.";
  cursorToggle.checked = !s.includes("Adults");
  cursorToggle.dispatchEvent(new Event("change"));

  // 4) Poblar levels o dejar placeholder
  if (s && topicsData[s]) {
    levelsDropdown.disabled = false;
    levelsDropdown.innerHTML = '<option value="">-- Choose a level --</option>';

    Object.keys(topicsData[s])
      .sort((a, b) => a - b)
      .forEach((level) => {
        const opt = document.createElement("option");
        opt.value = level;
        opt.textContent = `Level ${level}`;
        levelsDropdown.appendChild(opt);
      });

    // Mensaje de helper más orientado al siguiente paso
    helperSpan.textContent = "Now choose a level!";
  } else {
    levelsDropdown.disabled = true;
    levelsDropdown.innerHTML =
      '<option value="">-- Select a syllabus first --</option>';
  }
  //make sure timer and counter hidden
  const counterDiv = document.getElementById("count-container");
  counterDiv.classList.add("hidden");

  const timerDiv = document.getElementById("countdown-timer");
  timerDiv.classList.add("hidden");
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// 3) Al cambiar level → poblar weeks
levelsDropdown.addEventListener("change", () => {
  const s = syllabusDropdown.value;
  const l = levelsDropdown.value;
  const feedbackBtn = document.getElementById("feedback");
  const helperSpan = document.getElementById("feedback-helper");

  // Reset semanas y topics
  resetDropdown(weeksDropdown, "-- Select a level first --");
  topicsList.innerHTML = "";

  // Reset estado
  Object.keys(topicsStatus).forEach((key) => delete topicsStatus[key]);

  // Feedback reset
  feedbackBtn.disabled = true;
  helperSpan.textContent = "Now choose a level to load the weeks.";

  if (s && l && topicsData[s][l]) {
    weeksDropdown.disabled = false;
    weeksDropdown.innerHTML = '<option value="">-- Choose a week --</option>';

    Object.keys(topicsData[s][l])
      .sort((a, b) => a - b)
      .forEach((week) => {
        const opt = document.createElement("option");
        opt.value = week;
        opt.textContent = `Week ${week}`;
        weeksDropdown.appendChild(opt);
      });

    helperSpan.textContent = "Choose a week to load the topics!";
  } else {
    weeksDropdown.disabled = true;
    weeksDropdown.innerHTML =
      '<option value="">-- Select a level first --</option>';
  }
  window.selectedlevel = l;
  //make sure timer and counter hidden
  const counterDiv = document.getElementById("count-container");
  counterDiv.classList.add("hidden");

  const timerDiv = document.getElementById("countdown-timer");
  timerDiv.classList.add("hidden");
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// 4) Al cambiar week → poblar topics con formato HTML
weeksDropdown.addEventListener("change", () => {
  const s = syllabusDropdown.value;
  const l = levelsDropdown.value;
  const w = weeksDropdown.value;
  topicsList.innerHTML = "";

  const helperSpan = document.getElementById("feedback-helper");
  // 1) Reset de estado interno
  Object.keys(topicsStatus).forEach((key) => delete topicsStatus[key]);

  // 2) Deshabilitar botón de feedback
  const feedbackButton = document.getElementById("feedback");
  if (feedbackButton) feedbackButton.disabled = true;

  // 3) Poblar topics si syllabus + level + week existen
  if (s && l && w && topicsData[s][l][w]) {
    const topics = topicsData[s][l][w];
    topics.forEach((grammar, index) => {
      const container = document.createElement("section");

      container.innerHTML = `
        <div class="topic-container">
          <div class="topic-title">
            <h3>${grammar}</h3>
            <div class="approved-section">
              <h3>Approved?</h3>
              <button class="toggle-cell sutil" data-index="${index}" data-choice="yes" onclick="selectButton(this)">
                <span class="material-symbols-outlined">thumb_up</span>
              </button>
              <button class="toggle-cell sutil" data-index="${index}" data-choice="no" onclick="selectButton(this)">
                <span class="material-symbols-outlined">thumb_down</span>
              </button>
            </div>
          </div>

          <table class="topictable" style="margin-bottom: 20px;">
            <thead>
              <tr>
                <th colspan="3">Wrong Answer</th>
                <th colspan="3">Correction</th>
              </tr>
            </thead>
            <tbody id="grammar-body-${index}">
              <tr>
                <td id="answer${index}" colspan="3" contenteditable="true"></td>
                <td id="correction${index}" colspan="3" contenteditable="true"></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      topicsList.appendChild(container);
    });
  }
  feedbackBtn.disabled = true;
  helperSpan.textContent =
    "Evaluate all topics (or wait for the timer) to view feedback.";
  window.selectedweek = w;
  const el = document.getElementById("reminder-container");
  el.classList.add("fadeout");
  // Iniciar en 10 minutos
  startTimer(600);
  updateEvaluatedCount();
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

const popup = document.getElementById("popupMistakes");
const mainContent = document.getElementById("mainContent");
const closeBtn = document.getElementById("closePopup");
const feedbackBtn = document.getElementById("feedback");
const toggler = document.getElementById("toggle");

feedbackBtn.addEventListener("click", () => {
  mainContent.style.display = "none";
  popup.classList.remove("hidden");

  const syllabusValue = String(
    syllabusDropdown.value || syllabusDropdown.selectedOptions?.[0]?.text || "",
  )
    .trim()
    .toLowerCase();

  popup.classList.remove("pop4Adults", "pop4kids");

  if (syllabusValue.includes("adults")) {
    popup.classList.add("pop4Adults");
    toggler.classList.add("hidden");
  } else {
    popup.classList.add("pop4kids");
    toggler.classList.remove("hidden");
  }

  showKudosSection();
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function getTemasDominados() {
  const sections = document.querySelectorAll("#topicsList section");
  const resultados = [];

  sections.forEach((section) => {
    const title = section.querySelector("h3").innerText;
    const rows = section.querySelectorAll("tbody tr");

    let contenido = [];

    rows.forEach((row) => {
      // ignoramos botón "Add Row"
      if (row.id.includes("add-row-container")) return;

      const tds = row.querySelectorAll("td");
      const texts = [...tds]
        .filter((td) => td.contentEditable === "true")
        .map((td) => td.innerText.trim());

      if (texts.length === 3 && texts.some((txt) => txt !== "")) {
        const aprobado = tds[3]?.querySelector("input[type=checkbox]")?.checked
          ? "✅"
          : "❌";
        contenido.push(`• ${texts.join(" | ")} | ${aprobado}`);
      }
    });

    if (contenido.length > 0) {
      resultados.push(`${title}:<br>${contenido.join("<br>")}`);
    }
  });

  return resultados;
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function describeScore(num) {
  switch (num) {
    case 2.0:
      return "¡Excelente!";
    case 1.5:
      return "¡Muy buen trabajo!";
    case 1.0:
      return "Casi lo logras, pero necesitas mejorar.";
    case 0.5:
      return "Necesitas mejorar, creemos en tí.";
    case 0.0:
      return "Necesitas mejorar, creemos en tí.";
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function updateTotalScore() {
  const gr = parseFloat(document.getElementById("gr").value) || 0;
  const pr = parseFloat(document.getElementById("pr").value) || 0;
  const inn = parseFloat(document.getElementById("in").value) || 0;
  const fl = parseFloat(document.getElementById("fl").value) || 0;
  const co = parseFloat(document.getElementById("co").value) || 0;

  const total = gr + pr + inn + fl + co;
  document.getElementById("totalscore").textContent = total;

  window.areasDesempeno = {
    gramatica: describeScore(gr),
    pronunciacion: describeScore(pr),
    entonacion: describeScore(inn),
    fluidez: describeScore(fl),
    comprension: describeScore(co),
  };
  window.totalScore = total;
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

const textareas = document.querySelectorAll(".autoresize");

textareas.forEach((textarea) => {
  textarea.addEventListener("input", function () {
    this.style.height = "5px";
    this.style.height = this.scrollHeight + "px";
  });
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function selectButton(button) {
  const index = button.getAttribute("data-index"); // qué tema
  const choice = button.getAttribute("data-choice"); // yes o no

  // Seleccionamos todos los botones del tema actual
  const parentSection = button.closest(".approved-section");
  const allButtons = parentSection.querySelectorAll(".toggle-cell");

  // Reinicia todos a sutil
  allButtons.forEach((btn) => {
    btn.classList.remove("yes", "no");
    btn.classList.add("sutil");
  });

  // Activa el clicado
  button.classList.remove("sutil");
  button.classList.add(choice); // yes o no

  // Guarda el estado global
  topicsStatus[index] = choice;
  // obtén el topic-container
  const topicContainer = parentSection.closest(".topic-container");

  // remueve clases
  topicContainer.classList.remove("approved", "rejected");

  // agrega la clase según choice
  if (choice === "yes") {
    topicContainer.classList.add("approved");
  } else if (choice === "no") {
    topicContainer.classList.add("rejected");
  }
  console.log(topicsStatus);
  checkCompletion();
  updateEvaluatedCount();
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//
//cuenta la cantidad de topics evaluatos verify
function checkCompletion() {
  const sections = document.querySelectorAll("#topicsList section");
  const feedbackButton = document.getElementById("feedback");
  const container = document.getElementById("countdown-timer");

  let allAnswered = true;

  sections.forEach((_, index) => {
    if (!topicsStatus[index]) {
      allAnswered = false;
    }
  });

  // ✅ Detectar si el timer está en 0 (ya terminó)
  const timerIsOver = !container.classList.contains("normal");

  // ✅ Si el timer terminó, el feedback queda habilitado aunque falten topics
  if (timerIsOver) {
    feedbackButton.disabled = false;
  } else {
    feedbackButton.disabled = !allAnswered;
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

//for counter-visual aid only
function updateEvaluatedCount() {
  const total = document.querySelectorAll("#topicsList section").length;
  const evaluated = Object.values(topicsStatus).filter(Boolean).length;
  const countElement = document.getElementById("topic-count");
  const counterDiv = document.getElementById("count-container");
  counterDiv.classList.remove("hidden");

  countElement.textContent = `${evaluated}/${total} Evaluated`;
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

closeBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
  mainContent.style.display = "block";
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function showAbsentSection() {
  mainContent.style.display = "none";
  popup.classList.remove("hidden");

  let html = `
    <div class="absent-container">
      <h2>Absent Students Report-Card</h2>
      <h3>Write comments in each area based on the trainee’s performance:</h3>

      <table>
        <colgroup>
          <col style="width: 25%;">
          <col style="width: 75%;">
        </colgroup>
        <thead>
          <tr><th colspan="2">Comments per Areas</th></tr>
        </thead>
        <tr>
          <td>Gramática</td>
          <td id="td-gr"  contenteditable="true"></td>
        </tr>
        <tr>
          <td>Pronunciación</td>
          <td id="td-pr"  contenteditable="true"></td>
        </tr>
        <tr>
          <td>Entonación</td>
          <td id="td-en"  contenteditable="true"></td>
        </tr>
        <tr>
          <td>Fluidez</td>
          <td id="td-fl"  contenteditable="true"></td>
        </tr>
        <tr>
          <td>Comprensión</td>
          <td id="td-co"  contenteditable="true"></td>
        </tr>
      </table>
    </div>
  `;

  popup.querySelector("#popupContent").innerHTML = html;
  closeBtn.style.display = "inline-block";

  // Botón copy results
  const copyAbsentbutton = document.createElement("button");
  copyAbsentbutton.id = "copyAbsentResults";
  copyAbsentbutton.innerText = "Finish: Copy Absent's Report-Card and Close";
  copyAbsentbutton.addEventListener("click", () => copyAbsentResults());
  popup.querySelector("#popupContent").appendChild(copyAbsentbutton);
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function copyAbsentResults() {
  const gr = document.getElementById("td-gr").innerText.trim();
  const pr = document.getElementById("td-pr").innerText.trim();
  const en = document.getElementById("td-en").innerText.trim();
  const fl = document.getElementById("td-fl").innerText.trim();
  const co = document.getElementById("td-co").innerText.trim();
  const syllabus =
    typeof syllabusDropdown !== "undefined" &&
    syllabusDropdown &&
    syllabusDropdown.value
      ? syllabusDropdown.value
      : "";

  let report = "";

  if ((syllabus || "").toLowerCase().includes("adults")) {
    report = `<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Evals for Evals Team</title>

</head>

<body style="margin: 0;">
  <div class="Evaluation-Results"
    style="margin: 0; background: linear-gradient(to bottom, #f5ffff 10%, #AED6D6 50%, #1ca5ab 75%); background-color: #1ca5ab15;">
    <div class="header"
      style="width: 100%; overflow: hidden; border-radius: 7px; text-align: center; background: linear-gradient(to bottom, #f5f0e6 0%, transparent 50%); background-color: transparent;">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERADULTS.png" alt="Reporte de Evaluación Mensual" style="width: 100%; display: block; border: 0">
    </div>
    <div class="welcome" style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
      <p 
        style="padding: 0 1rem; font-size: 22px; font-weight: 600; color: #126064; font-family: Segoe UI; margin: 0;">
        Estimado estudiante,</p>
      <!-- &#x1F31F; -->
     
      <p         style="padding: 0 1rem; font-size: 16px; font-weight: 400; color: #126064; padding-bottom: 0.8rem; font-family: Segoe UI;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>
    <div style="border-radius: 20px; padding: 2rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">
      <div class="resultado-global" style="text-align: center; padding: 0 1rem;">
        <p class="h3" style="font-size: 22px; font-weight: 600; font-family: Segoe UI; color: #42757b;">En esta
          ocasión<br> No pudiste participar en tu evaluación mensual.</p>
        <p style=" font-family: Segoe UI; font-size: 15px;">Este reporte se ha elaborado con base en tu desempeño
          observado durante clases anteriores.</p>
      </div>
      <div class="desempeño" style="padding: 0 1rem; text-align: center;">
        <table style="width: 100%;" width="100%">
          <thead>
            <tr>
              <th colspan='2' style="font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center; padding: 1.7rem 0.5rem; border-bottom: 1px dotted #219fa6;"
                align="center">&#128313; Desempeño por área &#128313;</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Gramática</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${gr}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Fluidez</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${fl}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Pronunciación</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${pr}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Comprensión</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${co}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Entonación</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${en}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- referal -->

      <div style=" margin: 2.8rem 0; text-align: center; width: 100%">
        <h1
          style="font-size: 1.6rem; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
          align="center">¡Has recibido un cupón de ahorro!</h1>
        <a href="https://www.english4kidsonline.com/amigo" target="_blank"
          style="display:inline-block;  text-decoration:none;">
          <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/referalAdults.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
        </a>
      </div>
    </div>
    <!-- FOOTER -->
    <div style="
          text-align: center;
          margin: 0;
          padding: 2rem 0 0 0;
          width: 100%;
          font-family: Segoe UI;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        ">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerAdults.png" alt="Atentamente, equipo de English4Adults" style="width: 100%; display: block; border: 0">


    </div>
  </div>
</body>

</html>`;
  } else {
    // default (kids)
    report = `<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Evals for Evals Team</title>

</head>

<body style="margin: 0;">
  <div class="Evaluation-Results"
    style="margin: 0; background: linear-gradient(to bottom, #f5ffff 10%, #AED6D6 50%, #1ca5ab 75%); background-color: #1ca5ab15;">
    <div class="header"
      style="width: 100%; overflow: hidden; border-radius: 7px; text-align: center; background: linear-gradient(to bottom, #f5f0e6 0%, transparent 50%); background-color: transparent;">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERKIDS.png" alt="Reporte de Evaluación Mensual" style="width: 100%; display: block; border: 0">
    </div>
    <div class="welcome" style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
      <p class="h2"
        style="padding: 0 1rem; font-size: 22px; font-weight: 600; color: #126064; font-family: Segoe UI; margin: 0;">
        Estimado padre/madre de familia,</p>
      <!-- &#x1F31F; -->
      <p         style="padding: 0 1rem; font-size: 16px; font-weight: 400; color: #126064; padding-bottom: 0.8rem; font-family: Segoe UI;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>
    <div
      style="border-radius: 20px; padding: 2rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">
      <div style="padding: 0 1rem; text-align: center;">
        <p
          style="padding: 0.5rem; font-size: 22px; text-decoration: none; font-family: Segoe UI; color: #297b7f; font-weight: 600; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0.2rem;">
          Te informamos que:
        </p>
        <p class="h3" style="font-size: 16px; font-weight: 400; font-family: Segoe UI; color: #42757b; margin:0;">Tu
          hijo/a no
          asististió a su evaluación mensual.
        <p style=" font-family: Segoe UI; font-size: 15px; color: #126064; padding: 1.5rem 3rem 0.2rem;">Este reporte
          se
          ha
          elaborado con base en
          su
          desempeño
          observado durante clases anteriores.</p>
      </div>
      <div class="desempeño" style="padding: 0 1rem; text-align: center;">
        <table style="width: 100%;" width="100%">
          <thead>
            <tr>
              <th colspan='2'                 style="  font-size: 22px;  font-family: Segoe UI;  font-weight: 700;  color: #126064;  text-align: center;  padding: 1.7rem 0.5rem 0.5rem;  border-bottom: 1px dotted #219fa6;">
                  &#128313; Desempeño por área &#128313;</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Gramática</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${gr}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Fluidez</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${fl}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Pronunciación</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${pr}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Comprensión</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${co}</td>
            </tr>
            <tr>
              <td
                style="font-family: Segoe UI; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); font-weight: 400; color: #126064; text-align: center; font-size: 1.1rem; width: 40%; padding: 0.7rem;"
                width="40%" align="center">Entonación</td>
              <td
                style="font-size: 15px; font-family: Segoe UI; font-weight: 400; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: left;"
                align="left">${en}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- referal -->
      <div>
        <h1
          style="font-size: 1.6rem; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
          align="center">¡Has recibido un cupón de ahorro!</h1>
        <a href="https://www.english4kidsonline.com/amigo" target="_blank"
          style="display:inline-block;  text-decoration:none;">
          <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/referalAdults.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
        </a>
      </div>
    </div>
    <!-- FOOTER -->
    <div style="
          text-align: center;
          margin: 0;
          padding: 2rem 0 0 0;
          width: 100%;
          font-family: Segoe UI;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        ">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerKids.png" alt="Atentamente, equipo de English4Adults" style="width: 100%; display: block; border: 0">


    </div>
  </div>
</body>

</html>`;
  }

  navigator.clipboard
    .writeText(report)
    .then(() => {
      showPopup(
        "<h3>🎉 All done!</h3><p>✅ Absent-Report-Card has been copied to your clipboard! 📝</p>",
      );
      ["td-gr", "td-pr", "td-en", "td-fl", "td-co"].forEach(
        (id) => (document.getElementById(id).innerText = ""),
      );
    })
    .catch(() => {
      showPopup(
        "<h3>😓 Oops...</h3><p>❌ We couldn't copy the report, please try again or contact Michelle Hernández via Teams</p>",
      );
    });

  mainContent.style.display = "block";
  popup.classList.add("hidden");
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Función que arma y muestra Kudos y el botón Next
function showKudosSection() {
  const approvedTopics = [];

  // Recorre los topics
  Object.entries(topicsStatus).forEach(([index, choice]) => {
    const section = document.querySelector(
      `#topicsList section:nth-child(${parseInt(index) + 1})`,
    );
    const title =
      section?.querySelector(".topic-title h3")?.innerText || "Unknown Topic";
    if (choice === "yes") {
      approvedTopics.push(title); // solo titles de gramática aprobada
    }
  });

  const pronunciationMistakes = document
    .getElementById("pronunciationMistakes")
    .value.trim();

  // Construimos kudos por áreas
  let areaKudosList = "";
  if (document.getElementById("in").value === "2.0") {
    areaKudosList += "<li>🎶 Intonation</li>";
  }
  if (document.getElementById("fl").value === "2.0") {
    areaKudosList += "<li>🚀 Fluency</li>";
  }
  if (document.getElementById("co").value === "2.0") {
    areaKudosList += "<li>🧠 Comprehension</li>";
  }
  if (!pronunciationMistakes) {
    areaKudosList += "<li>🗣️ Pronunciation</li>";
  }

  // separation logic
  const syllabusValue = String(
    syllabusDropdown.value || syllabusDropdown.selectedOptions?.[0]?.text || "",
  )
    .trim()
    .toLowerCase();
  let headerText = "";
  if (syllabusValue.includes("adults")) {
    headerText += "Kudos";
  } else {
    headerText += "🌟 Kudos 🎉";
  }
  closeBtn.style.display = "inline-block";
  // ===============================

  let html = `
  <div class="kudos-container">
    <h2>${headerText}</h2>
    <div class="kudos-content">
    <div class="kudos-info">
        ${
          areaKudosList
            ? `<h3>Excellent Areas:</h3><ul>${areaKudosList}</ul>`
            : ""
        }
      </div>
        ${
          approvedTopics.length > 0
            ? `
    <div class="kudos-info">
          <h3>Approved Grammar Topics:</h3>
          <ul>${approvedTopics.map((t) => `<li>${t}</li>`).join("")}</ul>

  </div>
         </div>`
            : ""
        }
    ${
      !approvedTopics.length && !areaKudosList
        ? `<div><h3>¡Buen intento! ¡Ya casi lo tienes! 💪</h3>
<h4><strong>RECORDATORIO:</strong> Entre más practiques, más fácil se vuelve.</h4>`
        : ""
    }
       </div>
       </div>
`;

  popup.querySelector("#popupContent").innerHTML = html;

  const nextButton = document.createElement("button");
  nextButton.id = "nextBtn";
  nextButton.innerText = "Next: See Feedback";
  nextButton.style.width = "100%";
  nextButton.addEventListener("click", () => showErrorsSection());
  popup.querySelector("#popupContent").appendChild(nextButton);
  // }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// showErrorsSection recibe perfectAreasList para excluir esas áreas de errores
function showErrorsSection(perfectAreasList = []) {
  const rejectedTopics = [];
  const pronunciationMistakes = document
    .getElementById("pronunciationMistakes")
    .value.trim();

  // 1. Iterar todas las secciones de topicsList
  const sections = document.querySelectorAll("#topicsList section");
  sections.forEach((section, index) => {
    const title =
      section.querySelector(".topic-title h3")?.innerText.trim() ||
      "Tema desconocido";
    const choice = topicsStatus[index]; // "yes" o "no"

    // Excluir si está en perfectAreasList
    if (perfectAreasList.includes(title)) return;

    // Extraer contenido de answer y correction
    const answerText =
      section.querySelector(`#answer${index}`)?.innerText.trim() || "";
    const correctionText =
      section.querySelector(`#correction${index}`)?.innerText.trim() || "";

    // Incluir si está reprobado (choice === "no") o si hay texto en alguna de las celdas
    if (choice !== "no" && !answerText && !correctionText) return;

    // Clonar tabla y desactivar edición
    const table = section.querySelector("table.topictable");
    let clonedTable = null;
    if (table) {
      clonedTable = table.cloneNode(true);
      clonedTable.querySelectorAll("[contenteditable]").forEach((td) => {
        td.removeAttribute("contenteditable");
        td.contentEditable = false;
        td.style.outline = "none";
      });
    }

    rejectedTopics.push({
      title,
      tableHTML: clonedTable ? clonedTable.outerHTML : "<p>Unknown table</p>",
    });
  });
  // separation logic
  const syllabusValue = String(
    syllabusDropdown.value || syllabusDropdown.selectedOptions?.[0]?.text || "",
  )
    .trim()
    .toLowerCase();
  let headerText = "";
  if (syllabusValue.includes("adults")) {
    headerText += "Improvement Areas";
  } else {
    headerText += "📝 Let's practice!";
  }
  closeBtn.style.display = "inline-block";
  // =============================== <h2>${headerText}</h2>
  // 2. Construir el HTML de la sección de errores
  let html = `<div class="feedback-container">
      `;

  // Agregar header solo si hay mistakes
  if (pronunciationMistakes || rejectedTopics.length) {
    html += `<h2>${headerText}</h2>`;
  }

  if (pronunciationMistakes) {
    html += `
      <div class="mistake-section pronunciation">
        <h3>Pronunciation:</h3>
        <p>${pronunciationMistakes.replace(/\n/g, "<br>")}</p>
      </div>
    `;
  }

  if (rejectedTopics.length) {
    html += `
      <div class="mistake-section grammar">
        <h3>Grammar:</h3>
        ${rejectedTopics
          .map(
            (topic) => `
          <div class="mistake-topic">
            <h4>${topic.title}</h4>
            ${topic.tableHTML}
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  if (!pronunciationMistakes && !rejectedTopics.length) {
    if (syllabusValue.includes("adults")) {
      html += `
        <div>
        <h4>No mistakes detected in this evaluation. Great job! 🌟</h4>
        </div>
      `;
    } else {
      html += `
        <div class="celebrate">
          <h2 style="text-align: center;">OMG! No Mistakes!</h2>
          <h4>No mistakes detected in this evaluation. Great job! 🌟</h4>
        </div>
      `;
    }
  }

  html += `</div>`; // cierre feedback-container

  // 3. Inyectar y mostrar botones
  const popupContent = document.querySelector("#popupContent");
  popupContent.innerHTML = html;
  closeBtn.style.display = "inline-block";

  // Botón Back: ver Kudos
  const backButton = document.createElement("button");
  backButton.id = "backBtn";
  backButton.innerText = "Back: See Kudos";
  backButton.addEventListener("click", () => showKudosSection());
  popupContent.appendChild(backButton);

  // Botón Next: terminar feedback
  const finalButton = document.createElement("button");
  finalButton.id = "finalBtn";
  finalButton.innerText = "Next: Finish Feedback";
  finalButton.addEventListener("click", () => showFinalSection());
  popupContent.appendChild(finalButton);
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function showFinalSection() {
  const VIDEOS = {
    fail: "VIDEO4EVALS/THX FOR DOING BEST.mp4",
    exit: {
      kids: {
        success: "VIDEO4EVALS/SUCCESFULLY EXIT E4KIDS.mp4",
        pass: "VIDEO4EVALS/EXIT E4KIDS.mp4",
      },
      teens: {
        success: "VIDEO4EVALS/SUCCESFUL EXIT E4TEENS.mp4",
        pass: "VIDEO4EVALS/EXIT E4TEENS.mp4",
      },
      kidsMasters: "VIDEO4EVALS/EXIT KIDS MASTERS.mp4",
      teensMasters: "VIDEO4EVALS/EXIT TEENS MASTERS.mp4",
      mastersGeneric: "VIDEO4EVALS/EXIT MASTERS.mp4",
    },
    midterm: {
      fail: "VIDEO4EVALS/THX FOR DOING BEST.mp4",
      good: "VIDEO4EVALS/AMAZING JOB EVAL.mp4",
      better: "VIDEO4EVALS/EVAL SUCCESFULLY COMPLETED.mp4",
      excellent: "VIDEO4EVALS/EVAL EXCELENT PERFORMANCE.mp4",
    },
    nextLevel: {
      pass: "VIDEO4EVALS/NEXT LEVEL.mp4",
      fail: "VIDEO4EVALS/THX FOR DOING BEST.mp4",
    },
    juniors: "VIDEO4EVALS/THX FOR DOING BEST.mp4",
  };

  // --- HTML container start ---
  let html = `<div class="final-container">`;

  // Resultado global (aseguramos que selectedweek y level sean números)
  const totalScore = Number(window.totalScore || 0);
  const selectedweek = Number(window.selectedweek || 0);
  const level = Number(window.selectedlevel || 0);

  // Obtener syllabus (texto del dropdown)
  const syllabusDropdown = document.getElementById("syllabusDropdown");
  const syllabus = syllabusDropdown ? syllabusDropdown.value || "" : "";

  // Helpers para matching de syllabus
  const isJuniors = syllabus.toLowerCase().startsWith("juniors");
  const isKids = syllabus.toLowerCase().includes("kids");
  const isTeens = syllabus.toLowerCase().includes("teens");
  const isMasters = syllabus.toLowerCase().includes("masters");
  const isAdults = syllabus.toLowerCase().includes("adults");
  const finalScoreEl = document.getElementById("finalScore");
  const finalScore = finalScoreEl
    ? Number(finalScoreEl.textContent || finalScoreEl.value || 0)
    : 0;

  // --- DEFINICIÓN DE BANDERAS ---
  const isExit =
    !isJuniors &&
    ((level === 10 && (selectedweek === 7 || selectedweek === 13)) ||
      (level === 12 && selectedweek === 3) ||
      (isMasters && level === 10 && selectedweek === 3));

  const isMidterm =
    !isExit &&
    // Use includes / startsWith para tolerar ligeras variaciones en labels
    ((syllabus.toLowerCase().includes("juniors 5-7") && selectedweek === 4) ||
      (syllabus.toLowerCase().includes("kids (intensivo)") &&
        selectedweek === 7) ||
      (syllabus.toLowerCase().includes("kids (super intensivo)") &&
        selectedweek === 4) ||
      (syllabus.toLowerCase().includes("teens 13-17") &&
        syllabus.toLowerCase().includes("3") &&
        selectedweek === 7) ||
      (syllabus.toLowerCase().includes("teens 13-17") &&
        syllabus.toLowerCase().includes("5") &&
        selectedweek === 4));

  const isNextLevel =
    !isExit &&
    !isMidterm &&
    ((level === 0 && (selectedweek === 4 || selectedweek === 6)) ||
      ((syllabus.toLowerCase().includes("kids (intensivo)") ||
        (syllabus.toLowerCase().includes("teens 13-17") &&
          syllabus.toLowerCase().includes("3"))) &&
        selectedweek === 14) ||
      ((syllabus.toLowerCase().includes("kids (super intensivo)") ||
        (syllabus.toLowerCase().includes("teens 13-17") &&
          syllabus.toLowerCase().includes("5"))) &&
        selectedweek === 8));

  // --- DETERMINAR VIDEO usando el mapa VIDEOS ---
  let canvavideo = "";

  // Si es Juniors, no se les muestra si pasan o no
  if (isJuniors) {
    canvavideo = VIDEOS.juniors;
  } else if (isAdults) {
    if (isMasters) {
      // Adults Masters
      if (totalScore >= 7) {
        html += `<img style="height: 90%; width: auto; object-fit: contain;"  src="VIDEO4EVALS/adultspass.png">`;
      } else {
        html += `<img style="height: 90%; width: auto; object-fit: contain;"  src="VIDEO4EVALS/adultsfail.png">`;
      }
    } else {
      // Adults normales
      if (totalScore >= 7) {
        html += `<img style="height: 90%; width: auto; object-fit: contain;" src="VIDEO4EVALS/adultspass.png">`;
      } else {
        html += `<img style="height: 90%; width: auto; object-fit: contain;" src="VIDEO4EVALS/adultsfail.png">`;
      }
    }
  } else if (isExit) {
    // Exit Evaluation
    if (isMasters) {
      // Masters tienen videos propios
      if (syllabus.toLowerCase().includes("kids")) {
        canvavideo = finalScore >= 7 ? VIDEOS.exit.kidsMasters : VIDEOS.fail;
        console.log(finalScore);
      } else if (syllabus.toLowerCase().includes("teens")) {
        canvavideo = finalScore >= 7 ? VIDEOS.exit.teensMasters : VIDEOS.fail;
      } else {
        canvavideo = finalScore >= 7 ? VIDEOS.exit.mastersGeneric : VIDEOS.fail;
      }
    } else {
      // Kids / Teens no Masters → tres outcomes
      if (totalScore >= 9) {
        if (isKids) canvavideo = VIDEOS.exit.kids.success;
        else if (isTeens) canvavideo = VIDEOS.exit.teens.success;
        else canvavideo = VIDEOS.exit.mastersGeneric;
      } else if (totalScore >= 7) {
        if (isKids) canvavideo = VIDEOS.exit.kids.pass;
        else if (isTeens) canvavideo = VIDEOS.exit.teens.pass;
        else canvavideo = VIDEOS.exit.mastersGeneric;
      } else {
        canvavideo = VIDEOS.fail;
      }
    }
  } else if (isMidterm) {
    // Midterm → 4 posibles outcomes
    if (totalScore < 7) canvavideo = VIDEOS.midterm.fail;
    else if (totalScore < 8) canvavideo = VIDEOS.midterm.good;
    else if (totalScore < 9) canvavideo = VIDEOS.midterm.better;
    else canvavideo = VIDEOS.midterm.excellent;
  } else if (isNextLevel) {
    canvavideo =
      totalScore >= 7 ? VIDEOS.nextLevel.pass : VIDEOS.nextLevel.fail;
  } else {
    // Fallback general
    canvavideo = totalScore >= 7 ? VIDEOS.midterm.good : VIDEOS.nextLevel.fail;
  }

  // --- INSERTAR HTML DEL VIDEO ---
  if (canvavideo) {
    html += `
      <video width="100%" autoplay>
        <source src="${canvavideo}" type="video/mp4" />
        Your browser doesn't support the video tag.
      </video>`;
  }

  html += `</div>`;

  // Render
  const popupContent =
    popup && popup.querySelector ? popup.querySelector("#popupContent") : null;
  if (popupContent) popupContent.innerHTML = html;
  if (typeof closeBtn !== "undefined" && closeBtn)
    closeBtn.style.display = "inline-block";

  // Botón back
  const backButton = document.createElement("button");
  backButton.id = "nextBtn";
  backButton.innerText = "Back: See feedback";
  backButton.addEventListener("click", () => showErrorsSection());
  if (popupContent) popupContent.appendChild(backButton);

  // Definir currentVersion a partir del global
  const currentVersion = window.appVersion || "Coaches";

  // Botón copy results
  const copybutton = document.createElement("button");
  copybutton.id = "copyResults";
  copybutton.classList.add("copybutton");

  // Texto dinámico según versión
  if (currentVersion === "Coaches") {
    copybutton.innerText = "Next: Copy Results (COACH ONLY)";
    copybutton.addEventListener("click", () => copyResults());
  } else if (currentVersion === "Evaluators") {
    copybutton.innerText = "Next: EVALUATORS ONLY";
    copybutton.addEventListener("click", () => {
      showCoachingOpportunity();
    });
  }

  // Insertar el botón en el DOM
  if (popupContent) popupContent.appendChild(copybutton);
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function copyResults() {
  // 1. Sacar temas aprobados (Dominados)
  const approvedTopics = [];
  Object.entries(topicsStatus).forEach(([index, choice]) => {
    const section = document.querySelector(
      `#topicsList section:nth-child(${parseInt(index) + 1})`,
    );
    const title =
      section?.querySelector(".topic-title h3")?.innerText ||
      "Tema desconocido";
    if (choice === "yes") approvedTopics.push(title);
  });

  // 1.1 Desempeño por área
  const describeScore = (val) => {
    switch (val) {
      case "2.0":
        return "¡Excelente!";
      case "1.5":
        return "¡Muy buen trabajo!";
      case "1.0":
        return "Casi lo logras, pero necesitas mejorar.";
      case "0.5":
      case "0":
        return "Necesitas mejorar, creemos en tí.";
      default:
        return "";
    }
  };
  const areas = [
    { id: "gr", label: "Gramática" },
    { id: "fl", label: "Fluidez" },
    { id: "pr", label: "Pronunciación" },
    { id: "co", label: "Comprensión" },
    { id: "in", label: "Entonación" },
  ];
  const desempeñoHTML = areas
    .map(
      (a) =>
        `<tr><td 
                  style="font-family:  Segoe UI, Roboto; padding:  0.5rem 0.5rem 0.9rem 10%; border-bottom: 1px dotted #DCF8FA; font-weight: 600; color: #126064; text-align: center; font-size: 16px;">${a.label}</td>               
        <td style="font-size: 16px; font-family:  Segoe UI, Roboto; color: #305254; padding: 0.9rem 0.5rem 0.9rem 10%; text-align: left; font-weight: 400; border-bottom: 1px dotted #DCF8FA;"> ${describeScore(document.getElementById(a.id).value)}</td></tr>`,
    )
    .join("");

  // 2. Reforzar: temas con choice "no"
  const reinforceTopics = [];
  // 3. Áreas de oportunidad: todo tema con contenido en las celdas (aunque esté aprobado)
  const opportunityTopics = [];

  Object.entries(topicsStatus).forEach(([index, choice]) => {
    const section = document.querySelector(
      `#topicsList section:nth-child(${parseInt(index) + 1})`,
    );
    const title =
      section?.querySelector(".topic-title h3")?.innerText ||
      "Tema desconocido";
    // Extraer texto de answer y correction
    const answerText =
      section.querySelector(`#answer${index}`)?.innerText.trim() || "";
    const correctionText =
      section.querySelector(`#correction${index}`)?.innerText.trim() || "";

    // Reinforce
    if (choice === "no") {
      reinforceTopics.push(title);
    }

    // Opportunity: si tiene contenido en answer o correction
    if (answerText !== "" || correctionText !== "") {
      opportunityTopics.push({
        title,
        answer: answerText,
        correction: correctionText,
      });
    }
  });

  const pronunciationMistakes = document
    .getElementById("pronunciationMistakes")
    .value.trim();
  const comentariosCoach = document
    .getElementById("extraComments")
    .value.trim();

  // Resultado global
  const totalScore = window.totalScore || 0;
  const resultadoGlobal =
    totalScore > 6.5
      ? {
          mensajeResultado: "Evaluación Aprobada",
          descripcionResultado:
            "&#127881;¡Felicidades!&#127881; <br> Se está avanzando a un excelente ritmo.",
        }
      : {
          mensajeResultado: "Evaluación No Satisfactoria",
          descripcionResultado:
            "Aunque aún no se ha alcanzado el objetivo, el esfuerzo cuenta y seguiremos avanzando juntos.",
        };

  //approach for parents/adults
  const syllabus =
    typeof syllabusDropdown !== "undefined" &&
    syllabusDropdown &&
    syllabusDropdown.value
      ? syllabusDropdown.value
      : "";
  let Welcome = "";
  let Referal = "";

  if (syllabus.startsWith("Adults")) {
    // ______
    Welcome = `          <div class="Evaluation-Results"
  style="margin: 0; background: linear-gradient(to bottom, #f5ffff 10%, #AED6D6 60%, #1ca5ab 90%); background-color: #f5ffff;">
  <div class="header" style="text-align: center;"> <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERADULTS.png" alt="Evaluación Mensual" n="" style="width: 100%; display: block; border: 0;">
  </div>
  <div class="welcome" style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
    <p class="h2" style="font-size: 26px; font-weight: 700; color: #126064; font-family: Segoe UI; margin:1rem auto 0;">
      ¡Te saludamos de English4Adults!</p>
    <p class="h3" style="font-size: 15px; font-weight: 400; color: #126064; font-family: Segoe UI;"> Esperamos que estés
      teniendo una excelente semana</p>
    <p style="font-family: Segoe UI; font-size: 15px; font-weight: 400; color: #273030; padding: 1rem;">Queremos
      informarte sobre tu desempeño en tu última evaluación mensual.</p>
  </div>`;
    // ______
    Referal = ` <!-- referal -->
<div>
  <h1
    style="font-size: 26px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
    align="center">¡Has recibido un cupón de ahorro!</h1> <a href="https://www.english4kidsonline.com/amigo"
    target="_blank" style="display:inline-block;  text-decoration:none;"> <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/referalAdults.gif" alt="Refiere Aquí" style="width: 100%; display:block; margin:0 auto; border:0;">
  </a>
</div>`;
    // ______
    footer = `     <!-- footer -->
<div style="text-align: center; margin: 0; padding: 2rem 0 0; width: 100%"> <img src=" https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerKids.png"        alt="Atentamente, Equipo de English4Adults" style="width: 100%; display: block; border: 0;">
</div>`;
  }
  // ______
  //for kids, teens and juniors
  else {
    // ______
    Welcome = `     <div class="Evaluation-Results"
  style="margin: 0; background: linear-gradient(to bottom, #f5ffff 10%, #AED6D6 60%, #1ca5ab 90%); background-color: #f5ffff;">
  <div class="header" style="text-align: center;"> <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERKIDS.png" alt="Evaluación Mensual" n="" style="width: 100%; display: block; border: 0;">
  </div>
  <div class="welcome" style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
    <p class="h2" style="font-size: 26px; font-weight: 700; color: #126064; font-family: Segoe UI; margin:1rem auto 0;">
      ¡Te saludamos de English4Kids!</p>
    <p class="h3" style="font-size: 15px; font-weight: 400; color: #126064; font-family: Segoe UI;"> Esperamos que
      estés teniendo una excelente semana</p>
    <p style="font-family: Segoe UI; font-size: 15px; font-weight: 400; color: #273030; margin: 2rem auto;">Queremos
      informarte sobre el desempeño de tu hijo/a en su última evaluación mensual.</p>
  </div>`;
    // ______
    Referal = ` <!-- referal -->
<div>
  <h1
    style="font-size: 26px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
    align="center">¡Has recibido un cupón de ahorro!</h1> <a href="https://www.english4kidsonline.com/amigo"
    target="_blank" style="display:inline-block;  text-decoration:none;"> <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/refKids.gif" alt="Refiere Aquí" style="width: 100%; display:block; margin:0 auto; border:0;">
  </a>
</div>`;
    // ______
    footer = `     <!-- footer -->
<div style="text-align: center; margin: 0; padding: 2rem 0 0 0; width: 100%;">
  <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerKids.png" alt="Atentamente, Equipo de English4Kids" style="width: 100%; display: block; border: 0;">
</div>`;
  }

  const temasDominadosSection = approvedTopics.length
    ? `<div style="margin: 2.8rem 0;  justify-items: center;">
          <table style="width:80%">
            <thead>
              <tr><th  style="  font-size: 22px;  font-family: Segoe UI;  font-weight: 600;  color: #126064;  text-align: center;  padding: 1.7rem 0.5rem 0.5rem;  border-bottom: 1px dotted #219fa6;">&#128313;Temas Dominados&#128313;</th></tr>
            </thead>
            <tbody>
              ${approvedTopics
                .map(
                  (t) =>
                    `<tr>               <td style="  font-size: 15px;  font-family: Segoe UI;  font-weight: 400;  color: #305254;  padding: 0.9rem 0.5rem 0.9rem 10%;  border-bottom: 1px dotted rgba(28, 165, 171, 0.15);">&#9989; ${t}</td></tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>`
    : "";

  const temasReforzarSection = reinforceTopics.length
    ? `
      <div style="  margin: 2.8rem 0;  justify-items: center;">
          <table style="width:80%">
            <thead>
              <tr>
              <th style="  font-size: 22px;  font-family: Segoe UI;  font-weight: 600;  color: #126064;  text-align: center;  padding: 1.7rem 0.5rem 0.5rem;  border-bottom: 1px dotted #219fa6;">
                &#128313; Temas a Reforzar &#128313;
                </th>
                </tr>
            </thead>
            <tbody>
              ${reinforceTopics
                .map(
                  (t) => `
                <tr>               
                <td style="  font-size: 15px;  font-family: Segoe UI;  font-weight: 400;  color: #305254;  padding: 0.9rem 0.5rem 0.9rem 6.5vw;  border-bottom: 1px dotted rgba(28, 165, 171, 0.15);">
                &#10004; ${t}
                </td>
                </tr>
                `,
                )
                .join("")}
            </tbody>
          </table>
        </div>`
    : "";

  const areasOportunidadSection = opportunityTopics.length
    ? `
      <div style=" margin: 2.8rem 0; justify-items: center;">
          <table style="width:80%">
            <thead>
              <tr>
              <th  style="  font-size: 22px;  font-family: Segoe UI;  font-weight: 600;  color: #126064;  text-align: center;  padding: 1.7rem 0.5rem 0.5rem;  border-bottom: 1px dotted #219fa6;">
              &#128313;Áreas de Oportunidad&#128313;
              </th>
              </tr>
            </thead>
            <tbody>
              ${opportunityTopics
                .map(
                  (o) => `<tr>   
                  <td style="  font-size: 15px;  font-family: Segoe UI;  font-weight: 400;  color: #305254;  padding: 0.9rem 0.5rem 0.9rem 10%;">
                  &#10004; ${o.title}
                  </td>
                  </tr>
                        ${
                          o.answer
                            ? `<tr>
              <td
                style="  text-align: left;  color: #126064;  padding: 0.5rem 0.5rem 0.5rem 15%; font-family: Segoe UI;">
                            &#10060; Respuesta: ${o.answer}
                            </td>
                            </tr>`
                            : ""
                        }
                        ${
                          o.correction
                            ? `<tr>
              <td
                style="  text-align: left;  color: #126064;  padding: 0.5rem 0.5rem 0.5rem 15%;  border-bottom: 1px dotted rgb(18, 96, 100, 0.2);  font-family: Segoe UI;">
                            &#9989; Corrección: ${o.correction}
                            </td>
                            </tr>`
                            : ""
                        }`,
                )
                .join("")}
            </tbody>
          </table>
        </div>`
    : "";

  const pronunciacionSection =
    pronunciationMistakes && pronunciationMistakes.trim()
      ? `
      <div style=" margin: 2.8rem 0; justify-items: center;">
          <table style="width:80%">
            <thead>
              <tr><th  style="  font-size: 22px;  font-family: Segoe UI;  font-weight: 600;  color: #126064;  text-align: center;  padding: 1.7rem 0.5rem 0.5rem;  border-bottom: 1px dotted #219fa6;">&#128313;Pronunciación a Reforzar&#128313;</th></tr>
            </thead>
            <tbody>
              ${pronunciationMistakes
                .split(/\r?\n/)
                .map(
                  (ln) =>
                    `<tr>               
              
    <td style="  font-size: 15px;  font-family: Segoe UI;  font-weight: 400;  color: #305254;  padding: 0.7rem 0;  border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: center;">   
                ${ln}</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>`
      : "";



  const ResultadoGlobalRC = `  
  <div style='padding: 0 1rem;  text-align: center;'> 
  <p style="padding: 0 1rem 0; font-family: Segoe UI; font-size: 26px; font-weight: 700; color: #297b7f; text-shadow: 0 0 10px rgb(163, 225, 230, 0.15);">${
    resultadoGlobal.mensajeResultado
  }</p>  
   <p style="font-size: 16px; font-weight: 700; font-family: Segoe UI; color: #42757b; padding: 0;">${resultadoGlobal.descripcionResultado}</p>   
   <p style="font-size: 15px; font-weight: 400; font-family: Segoe UI; color: #273030; padding: 0 1rem 0;">A continuación un informe detallado de la evaluación:</p>  
  </div>`;

  const DesempeñoRC = `  
      <div style='  padding: 0 1rem;  justify-items: center;'>
  <table style="width:80%">      
  <thead>    
  <tr>        
  <th colspan='2'  style="  font-size: 22px;  font-family: Segoe UI;  font-weight: 600;  color: #126064;  text-align: center;  padding: 1.7rem 0.5rem 0.5rem;  border-bottom: 1px dotted #219fa6;">&#128313; Desempeño por área&#128313;</th>  
  </tr>    
  </thead>     
  <tbody>       
  ${desempeñoHTML}
  </tbody>      
  </table>   
  </div>`;

  const CoachCommentRC = ` 
      <div style=" margin: 2.8rem 0; justify-items: center;">
    <table style="width:80%">    
    <thead>     
      <tr>     
        <th  style="  font-size: 22px;  font-family: Segoe UI;  font-weight: 600;  color: #126064;  text-align: center;  padding: 1.7rem 0.5rem 0.5rem;  border-bottom: 1px dotted #219fa6;">&#128221; 
          Comentarios del Coach&#128221;</th>  
      </tr>   
    </thead>   
    <tbody>     
    <tr>              
    <td style="  font-size: 15px;  font-family: Segoe UI;  font-weight: 400;  color: #305254;  padding: 0.7rem 0;  border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: center;">   
      ${comentariosCoach ? comentariosCoach : "¡Muy buen trabajo!"}       
    </td></tr>      
    </tbody>      
    </table>  
    </div>`;

  // ------------------------------------------
  // NEW FORMAT MAPS
  const includesAny = (text, arr) =>
    arr.some((item) => text.includes(item.toLowerCase()));

  // Mapping 4maps
  const classGroups = [
    {
      match: ["kids (super intensivo) 8-12", "teens 13-17 (3hrs/week)"],
      B: "SI_0-10",
      S: "0-10",
    },
    {
      match: ["kids (intensivo) 8-12", "teens 13-17 (3hrs/week)"],
      B: "I_0-10",
      S: "0-10",
    },
    {
      match: ["juniors 5-7"],
      B: "J_1-10",
      S: "1-10",
    },
    {
      match: [
        "kids masters",
        "kids masters 20",
        "teens masters",
        "teens masters 2",
      ],
      B: "M_1-10",
      S: "1-10",
    },
    {
      match: ["adults (5hrs/week)", "adults masters (5hrs/week)"],
      B: "A5_1-10",
      S: "1-10",
    },
    {
      match: ["adults (3hrs/week)", "adults masters (3hrs/week)"],
      B: "A3_1-12",
      S: "1-12",
    },
  ];

  let SclassPathLvl = null;
  let BclassPathLvl = null;

  const syllabusLower = syllabus?.toLowerCase() || "";

  for (const group of classGroups) {
    if (
      includesAny(
        syllabusLower,
        group.match.map((m) => m.toLowerCase()),
      )
    ) {
      BclassPathLvl = group.B;
      SclassPathLvl = group.S;
      break;
    }
  }

  const levelsDropdown = document.getElementById("levelsDropdown");
  const levelVal = levelsDropdown?.value || 0;

  // Final URLs
  const S_ClassPath = `<!--MAPA PEQUEÑA-->
  <div style="text-align: center;">
  <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Class%20Paths/S-CP_${SclassPathLvl}_A${levelVal}.png" style="width:80%; margin-bottom: 1rem;"> <p
      style="font-weight: 600; font-family: Segoe UI; font-size: 14px; color: #506d6d; margin: 0 0 0.5rem 0; padding: 0 1rem;">
      ${syllabus} | Nivel ${levelVal}
    </p>
    </div>`;

  const B_ClassPath = `  <!--MAPA GRANDE-->
      <div style=" margin: 5rem 0 0.5rem; justify-items: center; background-color: #F9FAFB; text-align:center;">
        <table width="90%" align="center" cellspacing="0" cellpadding="0" style="width: 90%; border-collapse: collapse; ">
          <tr>
            <th
              style="border-bottom: none; border-top: 1px dotted #219fa6; font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center; padding: 0.5rem;"
              align="center">
              Progreso Actual
            </th>
          </tr>
          <tr>
            <td
              style="font-family: Segoe UI; border-bottom: 1px dotted #DCF8FA; text-align: left; padding: 1rem 5rem 1rem; font-size: 16px; font-weight: 400; color: #126064;"
              align="left">
              <li>El estudiante se encuentra en el <b>nivel ${levelVal}</b>.</li>
            </td>
          </tr>
        </table> <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Class%20Paths/B-CP_${BclassPathLvl}_A${levelVal}.png" style="width:90%; margin-bottom: 1rem; border-bottom: 1px dotted #219fa6; ">
      </div>`;

  // ------------------------------------------

  // Construcción del HTML final
  const reportHTML = `
  <html lang='en'>
    <head>
      <meta charset='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <title>Reporte de Evaluación</title>
    </head>
     <body style="margin: 0 auto;">
          ${Welcome}
              <div style="border-radius: 20px; padding: 2rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;"> 
          ${S_ClassPath}
          ${ResultadoGlobalRC}
          ${DesempeñoRC}
          ${temasDominadosSection}
          ${temasReforzarSection}
          ${areasOportunidadSection}
          ${pronunciacionSection}
          ${CoachCommentRC}
          ${B_ClassPath}
          ${Referal}
        </div>
        ${footer}
      </div>
    </body>
  </html>`;

  // ------------------------------------------
  const fp = document.getElementById("fl").value;
  const gp = document.getElementById("gr").value;
  const pp = document.getElementById("pr").value;
  const cp = document.getElementById("co").value;
  const ip = document.getElementById("in").value;
  const previewHTML = `
   <div class="results-preview"><div class="floating-results">
        <table>
        <tr>
        <th colspan="2">Final Scores</th>
        </tr>
        <tr>
        <td class="ar">Grammar</td>
        <td class="num">${gp}</td>
        </tr>
        <tr>
        <td class="ar">Pronunciation</td>
        <td class="num">${pp}</td>
        </tr>
        <tr>
        <td class="ar">Intonation</td>
        <td class="num">${ip} </td>
        </tr>
        <tr>
        <td class="ar">Comprehension</td>
        <td class="num">${cp}</td>
        </tr>
        <tr>
        <td class="ar">Fluency</td>
        <td class="num">${fp}</td>
        </tr>
        <tr>
        <td class="ar">Total Score</td>
        <td class="num">${totalScore}</td>
        </tr>
        </table>
      </div>
    <h2 class="previewh2"> Evaluation Results Copied!</h2>
    <h4 class="previewh4">Please review your evaluation result here:</h4>
      <div class="preview-wrapper">
        ${reportHTML}
      </div>
      </div>
    `;

  // ------------------------------------------
  // 3. Inyecta el wrapper en un popup
  document.querySelector("#popupContent").innerHTML = previewHTML;

  // boton de retroceder
  const finalButton = document.createElement("button");
  finalButton.id = "finalBtn";
  finalButton.innerText = "Back: Finish Feedback";
  finalButton.classList.add("action-btn");
  finalButton.addEventListener("click", showFinalSection);
  popup.querySelector("#popupContent").appendChild(finalButton);
  // boton de reinicio
  const restart = document.createElement("button");
  restart.id = "restart";
  restart.innerText = "End: Restart";
  restart.classList.add("action-btn");
  restart.addEventListener("click", reloadPage);
  popup.querySelector("#popupContent").appendChild(restart);

  // Copiar sin romper el método que ya funciona
  navigator.clipboard
    .writeText(reportHTML)
    .then(() =>
      showPopup("✅ The Results have been copied to you clipboard! ✅"),
    )
    .catch(() =>
      showPopup("Data couldn't be copied, please try again or reload the page"),
    );
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Botón para cerrar el popup y volver a mostrar el contenido original
document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("popupMistakes").classList.add("hidden");
  document.getElementById("mainContent").style.display = "block";
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

let timerInterval; // global

function startTimer(durationSeconds) {
  const display = document.getElementById("time-display");
  const container = document.getElementById("countdown-timer");
  let timer = durationSeconds;
  container.classList.add("normal");
  container.classList.remove("hidden");

  // Limpiar cualquier timer previo
  clearInterval(timerInterval);

  // Reset visual
  container.classList.remove("warning", "danger", "over");
  display.classList.remove("time-over");
  display.textContent = "10:00";
  feedbackBtn.disabled = true;

  // Guardar el nuevo interval
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    display.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // Cambiar estilos
    if (timer <= 300) {
      container.classList.remove("normal");
      container.classList.add("warning");
      feedbackBtn.disabled = false;
    }
    if (timer <= 60) {
      container.classList.remove("warning");
      container.classList.add("danger");
    }

    if (--timer < 0) {
      clearInterval(timerInterval);
      container.classList.remove("warning", "danger");
      container.classList.add("over");
      display.classList.add("time-over");
    }
  }, 1000);
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Nuevo showPopup: compatible con la llamada existente showPopup(message)
function showPopup(message) {
  // Si ya hay un popup, elimínalo (evita choques)
  const existing = document.querySelector(".popup-overlay");
  if (existing) {
    existing.parentNode.removeChild(existing);
  }

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";

    const box = document.createElement("div");
    box.className = "popup-box";
    box.innerHTML = `
      ${message}
      <button id="popupOkBtn">Okay</button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const okBtn = document.getElementById("popupOkBtn");

    const cleanup = () => {
      if (overlay.parentNode) document.body.removeChild(overlay);
      // Emitir evento global para que otras funciones puedan reaccionar
      document.dispatchEvent(
        new CustomEvent("popupClosed", { detail: { message } }),
      );
      resolve();
    };

    okBtn.addEventListener(
      "click",
      () => {
        cleanup();
      },
      { once: true },
    );

    // Cerrar si hacen click fuera del box (UX-friendly)
    overlay.addEventListener(
      "click",
      (ev) => {
        if (ev.target === overlay) cleanup();
      },
      { once: true },
    );

    // bloquear scroll detrás del popup
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Restaurar overflow cuando se cierre
    const restore = () => (document.body.style.overflow = prevOverflow || "");
    // Hook para restaurar overflow al resolver la promesa
    const originalResolve = resolve;
    const proxiedResolve = () => {
      restore();
      originalResolve();
    };
    // Note: proxiedResolve no es estrictamente necesario aquí porque cleanup() llama resolve()
    // pero dejamos la restauración clara en caso de futuras modificaciones
  });
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// popup con confirmación
function confirmPopup(message) {
  // Si ya hay un popup, elimínalo (evita choques)
  const existing = document.querySelector(".popup-overlay");
  if (existing) {
    existing.parentNode.removeChild(existing);
  }

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";

    const box = document.createElement("div");
    box.className = "popup-box";
    box.innerHTML = `
      ${message}
      <div class="popup-actions">
        <button id="popupYesBtn">Yes</button>
        <button id="popupNoBtn">No</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const yesBtn = document.getElementById("popupYesBtn");
    const noBtn = document.getElementById("popupNoBtn");

    const cleanup = () => {
      if (overlay.parentNode) document.body.removeChild(overlay);
      document.body.style.overflow = ""; // restore scroll
    };

    yesBtn.addEventListener(
      "click",
      () => {
        cleanup();
        resolve(true); // ✅ confirmar
      },
      { once: true },
    );

    noBtn.addEventListener(
      "click",
      () => {
        cleanup();
        resolve(false); // ❌ cancelar
      },
      { once: true },
    );

    // cerrar si hacen click fuera del box
    overlay.addEventListener(
      "click",
      (ev) => {
        if (ev.target === overlay) {
          cleanup();
          resolve(false);
        }
      },
      { once: true },
    );

    // bloquear scroll detrás
    document.body.style.overflow = "hidden";
  });
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

async function reloadPage() {
  const proceed = await confirmPopup(
    "<h3>Start again? 🤔</h3><p>We’ll reset everything so you can begin a fresh evaluation.</p><p><b>Are you sure you want to restart? 👀</b></p>",
  );

  if (proceed) {
    if (weeksDropdown) {
      weeksDropdown.dispatchEvent(new Event("change"));
    }

    document.querySelectorAll("#gr, #pr, #in, #fl, #co").forEach((select) => {
      select.value = "2.0";
    });

    document.querySelectorAll("textarea").forEach((textarea) => {
      textarea.value = "";
    });

    if (typeof updateTotalScore === "function") {
      updateTotalScore();
    }

    // Volver al contenido principal
    popup.classList.add("hidden");
    mainContent.style.display = "block";

    const topicsSection = document.getElementById("topicsList");
    if (topicsSection) {
      topicsSection.scrollIntoView({ behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

cursorToggle.addEventListener("change", () => {
  const useCustom = cursorToggle.checked;

  if (popup) {
    // Aplica cursor solo al popup
    popup.style.cursor = useCustom
      ? 'url("cursors/superstarcursor.cur"), default'
      : "default";

    // Si hay tablas dentro del popup, también cambias su cursor
    popup.querySelectorAll("table").forEach((t) => {
      t.style.cursor = useCustom
        ? 'url("cursors/superstarcursor.cur"), pointer'
        : "pointer";
    });
  }
});
