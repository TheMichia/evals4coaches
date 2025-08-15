let topicsData = {};
// estado global para los temas
const topicsStatus = {};

// Referencias al DOM
const syllabusDropdown = document.getElementById("syllabusDropdown");
const levelsDropdown = document.getElementById("levelsDropdown");
const weeksDropdown = document.getElementById("weeksDropdown");
const topicsList = document.getElementById("topicsList");

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Cargar JSON y poblar syllabus
const jsonVersion = 3; // CAMBIAR NÚMERO AL ACLUALIZAR EL JSON

fetch(`topics.json?v=${jsonVersion}`)
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
                <th colspan="3">Answer</th>
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
  let allAnswered = true;

  sections.forEach((_, index) => {
    if (!topicsStatus[index]) {
      allAnswered = false;
    }
  });

  feedbackButton.disabled = !allAnswered;
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

const popup = document.getElementById("popupMistakes");
const mainContent = document.getElementById("mainContent");
const closeBtn = document.getElementById("closePopup");
const feedbackBtn = document.getElementById("feedback");

feedbackBtn.addEventListener("click", () => {
  mainContent.style.display = "none";
  popup.classList.remove("hidden");

  showKudosSection();
});

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

  const report = `
    <style>
      .evaltable {
        border-radius: 20px;
        box-shadow: 1px 1px 10px rgba(23, 134, 140, 0.1);
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
      }

      .evalarea {
        font-weight: bold;
        color: #15777A;
        font-size: 1.2rem;
        padding: 1.3rem;
        font-family: Verdana, sans-serif;
        text-align: center;
      }

      .evalcomment {
        color: #0F5557;
        word-break: break-word;
        font-weight: 400;
        padding: 0 2.5rem 1.5rem 2.5rem;
        font-family: serif;
        text-align: left;
        font-size: 1rem;

      }
    </style>
    <section>
      <!HEADER>
        <div
          style="background: linear-gradient(90deg, #1EAEAE 0%, #21C0C0 50%, #1EAEAE 100%); background-color: #1EAEAE; text-align: center; height: auto; padding: 0.7rem; font-family: Verdana; border-radius: 20px 5px; overflow:hidden; ">
          <!LOGOS>
            <div
              style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin:0; padding-top: 1.5rem;">
              <img   src="https://imgur.com/Qk6oytx.png" style="height: 2.5rem;">
              <img   src="https://imgur.com/tVvbCqV.png" style="height: 2.5rem;">
              <img   src="https://imgur.com/Duh9RGt.png" style="height: 2.5rem;">
              <img   src="https://imgur.com/68ZykjC.png" style="height: 2.5rem;">
            </DIV>
            <p style="font-size: 1.5rem; font-weight: 800; color: white; padding-bottom: 0.8rem;">
              RESULTADOS DE EVALUACIÓN MENSUAL</p>
        </div>
        <!CUERPO DE EMAIL>
          <DIV style="font-family: Verdana; padding: 0 1.8rem;  color: #3D5855;">
            <!SALUDO>
              <div style="color: #126768; margin: 3.5rem 0; text-align: center; font-size: 1.1rem; font-weight: 600;">
                <p>¡Hola!</p>
                <p> Esperamos que estés teniendo una excelente semana. &#x1F31F;</p>
              </div>

              <!INFOR>
                <div
                  style="margin: 0 0.5rem; padding: 0.5rem; font-family: arial; font-weight: 600; text-align: center; background-color: #F2F8F7; border-radius: 20px; overflow:hidden; color: #215652; font-size: 1rem;">
                  <p>En esta ocasión no pudiste participar en tu evaluación mensual.
                    Este reporte se ha elaborado con base en tu desempeño observado durante clases anteriores.
                  </p>

                </div>

                <div style="margin: 2rem 0.5rem; font-family: arial; font-weight: 600; align-items: center;">
                  <!RESULTS>
                    <P class="evalarea" style="font-size:1.5rem; text-decoration: underline; ">Áreas de desempeño:</P>
                    <table class="evaltable" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" class="evalarea">&#x1F4DA; Gramática</td>
                      </tr>
                      <tr>
                        <td valign="top" class="evalcomment">${gr}

                        </td>
                      </tr>
                    </table>

                    <table class="evaltable" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" class="evalarea">&#x1F5E3;&#xFE0F; Pronunciación</td>
                      </tr>
                      <tr>
                        <td valign="top" class="evalcomment">${pr}
                        </td>
                      </tr>
                    </table>

                    <table class="evaltable" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" class="evalarea">&#x1F3A7; Entonación</td>
                      </tr>
                      <tr>
                        <td valign="top" class="evalcomment">${en}

                        </td>
                      </tr>
                    </table>

                    <table class="evaltable" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" class="evalarea">&#x1F3B5; Fluidez</td>
                      </tr>
                      <tr>
                        <td valign="top" class="evalcomment">${fl}

                        </td>
                      </tr>
                    </table>

                    <table class="evaltable" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" class="evalarea">&#x1F4AC; Comprensión</td>
                      </tr>
                      <tr>
                        <td valign="top" class="evalcomment">${co}

                        </td>
                      </tr>
                    </table>



                    <!reminder>
                      <DIV style="margin: 2rem; text-align: center; font-size:0.9rem;">
                        <p>La asistencia a las evaluaciones es esencial para medir tu progreso, identificar áreas de
                          mejora y reforzar lo aprendido.
                          Te invitamos a participar en tu próxima evaluación mensual para aprovechar al máximo tu proceso
                          de aprendizaje. </p>
                      </DIV>
                </DIV>
                <!FOOTER>
                  <div style="font-family: verdana; margin: 4rem 2rem;">
                    <p style="font-weight:bold;">Atentamente,
                      <br><strong style="color: #1CA5AB; font-size: 1.1rem;">Equipo de English4Kids</strong>
                    </p>
                  </div>
                  <!REFERIDOS>
                    <div
                      style="background-color: #1EAEAE; text-align: center; height: auto; padding: 0.7rem; font-family: Verdana; border-radius: 5px 20px; overflow:hidden; color:white; margin-top: -2rem; margin-bottom: 4rem;">
                      <p style="font-weight: bold; font-size: 1.3rem;">Refiere a otros padres y obtén un 50% de descuento
                        por cada referido que se inscriba. </p>
                      <p style="font-size: 0.9rem;">&#129490;
                        &#10024;
                        Si disfrutas nuestras clases,
                        puedes ayudar a que más niños aprendan inglés y tengan mejores oportunidades en la vida. Tu referido
                        también recibe un 50% de descuento en su primer pago.</p>
                      <p style="font-size: 1.3rem; font-weight: bold;">Entre más refieras,
                        más ayudas y más ganas. </p>
                      <p style="font-size: 0.9rem;"> &#128073;
                        Para que tu referido obtenga el descuento,
                        debe agendar una llamada con uno de nuestros asesores
                      </p>
                      <a href="https://www.english4kidsonline.com/amigo" target="_blank"
                        style="display:inline-block; padding:12px 24px; background-color:white; color:#1EAEAE; text-decoration:none; border-radius:8px; font-weight:bold; font-family:Verdana">
                        &#128153; REFIERE AQUÍ &#128153;
                      </a>

                    </div>
          </div>
    </section>
  `;

  navigator.clipboard
    .writeText(report)
    .then(() => {
      alert("✅ Absent-Report-Card copiado con éxito");
      ["td-gr", "td-pr", "td-en", "td-fl", "td-co"].forEach(
        (id) => (document.getElementById(id).innerText = ""),
      );
    })
    .catch(() => alert("❌ Falló al copiar; recarga y vuelve a intentar"));

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
    areaKudosList += "<li>🎶 Intonation!</li>";
  }
  if (document.getElementById("fl").value === "2.0") {
    areaKudosList += "<li>🚀 Fluency!</li>";
  }
  if (document.getElementById("co").value === "2.0") {
    areaKudosList += "<li>🧠 Comprehension!</li>";
  }
  if (!pronunciationMistakes) {
    areaKudosList += "<li>🗣️ Pronunciation!</li>";
  }

  closeBtn.style.display = "inline-block";

  let html = `
  <div class="kudos-container">
    <h2>🌟 Kudos 🎉</h2>
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
        ? `<div><h3>¡Buen intento! ¡Ya casi lo tienes! 💪</h3><h3>Excellent Areas:</h3>
    <ul class="motivational-list">
</ul>
<h4><strong>RECORDATORIO:</strong> Entre más practiques, más fácil se vuelve.</h4>`
        : ""
    }
       </div>
       </div>
`;

  popup.querySelector("#popupContent").innerHTML = html;

  // // Mostrar botón next solo si hay algo que corregir
  // const rejectedTopics = Object.values(topicsStatus).some(
  //   (status) => status === "no",
  // );
  // if (rejectedTopics || pronunciationMistakes) {
  // Mostrar btn next
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
      tableHTML: clonedTable
        ? clonedTable.outerHTML
        : "<p>Unknown table</p>",
    });
  });

  // 2. Construir el HTML de la sección de errores
  let html = `<div class="feedback-container">
      <h2>📝 Let's practice!</h2>`;

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
        `
          )
          .join("")}
      </div>
    `;
  }

  if (!pronunciationMistakes && !rejectedTopics.length) {
    html += `
      <div class="celebrate">
        <h2 style="text-align: center;">OMG! No Mistakes!</h2>
        <h4>No mistakes detected in this evaluation. Great job! 🌟</h4>
      </div>
    `;
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
  let html = `
    <div class="final-container">
        `;

  // Resultado global
  const totalScore = window.totalScore || 0;
  const pass = totalScore > 7 ? "yes" : "no";
  const selectedweek = window.selectedweek || 0;
  const level = window.selectedlevel || 0;

  // Determinar video y URL de Canva según syllabus
  const syllabusDropdown = document.getElementById("syllabusDropdown");
  const syllabus = syllabusDropdown.value;
  let canvavideo = "";

  // WEEK 4 LOGIC
  if (selectedweek === "4" || selectedweek === "7") {
    if (totalScore < 7) {
      canvavideo = "VIDEO4EVALS/THX FOR DOING BEST.mp4";
    } else if (totalScore >= 7 && totalScore < 8) {
      canvavideo = "VIDEO4EVALS/AMAZING JOB EVAL.mp4";
    } else if (totalScore >= 8 && totalScore < 9) {
      canvavideo = "VIDEO4EVALS/EVAL SUCCESFULLY COMPLETED.mp4";
    } else if (totalScore >= 9) {
      canvavideo = "VIDEO4EVALS/EVAL EXCELENT PERFORMANCE.mp4";
    }
  }

  // WEEK 8 LOGIC
  else if (selectedweek === "8" || selectedweek === "14" || selectedweek === "6") {
    // EXIT level LOGIC by syllabus + level
    if (level === 10) {
      if (
        syllabus === "Kids (Intensivo) 8-12" ||
        syllabus === "Kids (Super Intensivo) 8-12"
      ) {
        canvavideo =
          totalScore >= 9
            ? "VIDEO4EVALS/SUCCESFULLY EXIT E4KIDS.mp4"
            : "VIDEO4EVALS/EXIT E4KIDS.mp4";
      } else if (
        syllabus === "Kids Master's" ||
        syllabus === "Kids Master's 2"
      ) {
        canvavideo = "VIDEO4EVALS/EXIT KIDS MASTERS.mp4";
      } else if (
        syllabus === "Teens 13-17 (3 horas/semana)" ||
        syllabus === "Teens 13-17 (5 horas/semana)"
      ) {
        canvavideo =
          totalScore >= 9
            ? "VIDEO4EVALS/SUCCESFUL EXIT E4TEENS.mp4"
            : "VIDEO4EVALS/EXIT E4TEENS.mp4";
      } else if (
        syllabus === "Teens Master's" ||
        syllabus === "Teens Master's 2"
      ) {
        canvavideo = "VIDEO4EVALS/EXIT TEENS MASTERS.mp4";
      } else {
        // Otros syllabus con week 8
        canvavideo =
          totalScore >= 7
            ? "VIDEO4EVALS/NEXT LEVEL.mp4"
            : "VIDEO4EVALS/THX FOR DOING BEST.mp4";
      }
    } else {
      // Not level 10
      canvavideo =
        totalScore >= 7
          ? "VIDEO4EVALS/NEXT LEVEL.mp4"
          : "VIDEO4EVALS/THX FOR DOING BEST.mp4";
    }
  }

  html += `
     <video width="100%" autoplay>
            <source src="${canvavideo}" type="video/mp4" />
    `;

  html += `</div>            `; // close feedback-container
  popup.querySelector("#popupContent").innerHTML = html;
  closeBtn.style.display = "inline-block";

  // Botón back
  const backButton = document.createElement("button");
  backButton.id = "nextBtn";
  backButton.innerText = "Back: See feedback";
  backButton.addEventListener("click", () => showErrorsSection());
  popup.querySelector("#popupContent").appendChild(backButton);

  // Botón copy results
  const copybutton = document.createElement("button");
  copybutton.id = "copyResults";
  copybutton.innerText = "Next: Copy Results (COACH ONLY)";
  copybutton.classList.add("copybutton");
  copybutton.addEventListener("click", () => copyResults());
  popup.querySelector("#popupContent").appendChild(copybutton);
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
        `<b>- ${a.label}:</b> ${describeScore(
          document.getElementById(a.id).value,
        )}<br>`,
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
          icono: "&#9989;",
          mensajeResultado: "LOGRADO",
          descripcionResultado:
            "¡Felicidades! Estás avanzando a un excelente ritmo. &#128170; &#127881;",
        }
      : {
          icono: "&#10060;",
          mensajeResultado: "NO LOGRADO",
          descripcionResultado:
            "Aunque aún no se ha alcanzado el objetivo, el esfuerzo cuenta y seguiremos avanzando juntos.",
        };

  // Construcción del HTML final
  const reportHTML = `
&#9989;<b><u>Resultado Global:</u> ${resultadoGlobal.mensajeResultado}</b><br><br>
${resultadoGlobal.descripcionResultado}<br>
<hr>

&#128313; <b>Desempeño por área:</b><br><br>
${desempeñoHTML}<br>
<hr>

&#x1f4d8; <b>Temas Dominados:</b><br><br>
${
  approvedTopics.length
    ? approvedTopics.map((t) => `&#9989; ${t}<br>`).join("") + "<br>"
    : "Aún no hay temas dominados.<br><br>"
}
<hr>

&#x1f7e1; <b>Temas que aún necesita reforzar:</b><br><br>
${
  reinforceTopics.length
    ? reinforceTopics.map((t) => `&#10004; ${t}<br>`).join("") + "<br>"
    : "¡Ningún tema para reforzar!<br><br>"
}
<hr>

&#128204; <b>Áreas de Oportunidad:</b><br><br>
<b><u>Errores de gramática:</u></b><br><br>
${
  opportunityTopics.length
    ? opportunityTopics
        .map(
          (o) => `
&#128073; <b>Tema:</b> ${o.title}<br>
${o.answer ? `&#10060; Respuesta: ${o.answer}<br>` : ""}
${o.correction ? `&#9989; Corrección: ${o.correction}<br>` : ""}
<br>`,
        )
        .join("")
    : "¡Ningún error detectado!<br><br>"
}

<b><u>Pronunciación a reforzar:</b></u></b><br><br>Debemos trabajar en perfeccionar la pronunciación de algunas palabras, por ejemplo: 
${
  pronunciationMistakes
    ? pronunciationMistakes.replace(/\n/g, "<br>") + "<br><br>"
    : "¡Sin errores de pronunciación!<br><br>"
}

<hr>

<b><u>Comentarios del coach:</u></b><br><br>
${comentariosCoach ? comentariosCoach.replace(/\n/g, "<br>") + "<br><br>" : "Muy buen trabajo!<br><br>"}
<hr>
&#129490; &#10024; Si te gustan nuestras clases, puedes ayudar a que más niños aprendan inglés y tengan mejores oportunidades en la vida. Refiere a otros padres y obtén 50% de descuento por cada referido que se inscriba. Tu referido también obtiene un 50% de descuento en su primer pago. Entre más refieras, más ayudas y más ganas.<br><br>

&#128073; Tu referido debe agendar una llamada con uno de nuestros asesores en el siguiente enlace: 
<a href="https://www.english4kidsonline.com/amigo" target="_blank">www.english4kidsonline.com/amigo</a> &#128153;
`;

  // contenedor scrollable
  const previewHTML = `
<div class="results-preview">
  <h2> Evaluation Results Copied!</h2>
  <h4>Please review your evaluation result here:</h4>
    <div class="preview-wrapper">
      ${reportHTML}
    </div>
     </div>
  `;

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
    .then(() => alert("✅ The Results have been copied to you clipboard! ✅"))
    .catch(() =>
      alert("Data couldn't be copied, please try again or reload the page"),
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

function reloadPage() {
  const proceed = confirm(
    "The data will be reset. Are you sure you want to restart?",
  );

  if (proceed) {
    // Refrescar topics como si el usuario hubiera cambiado la semana
    if (weeksDropdown) {
      weeksDropdown.dispatchEvent(new Event("change"));
    }

    // Resetear todos los selects a 2.0
    const selects = document.querySelectorAll("#gr, #pr, #in, #fl, #co");
    selects.forEach((select) => {
      select.value = "2.0";
    });

    // Vaciar todos los textareas
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      textarea.value = "";
    });

    // Resetear el total
    if (typeof updateTotalScore === "function") {
      updateTotalScore();
    }
    //back to main content
    popup.classList.add("hidden");
    mainContent.style.display = "block";

    // Scroll to first topic

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
      feedbackBtn.disabled = false;
    }
  }, 1000);
}
