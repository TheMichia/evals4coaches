( () => {
    const version = "Evaluators";
    const versionnum = "2.8.1";
    // video tutorials only for kids intensivo and super intensivo
    const E4EjsonVersion = 3;
    window.appVersion = "Evaluators";
    const showversion = document.getElementById("version");
    showversion.innerHTML = `${version} ${versionnum} - JSON ${E4EjsonVersion}`;
}
)();

// ---------- Elementos del DOM ----------
const syllabusE4E = document.getElementById("syllabusDropdown");
const levelE4E = document.getElementById("levelsDropdown");
const weekE4E = document.getElementById("weeksDropdown");
const feedbackBtnE4E = document.getElementById("feedback");
const evaluatorsDropdown = document.getElementById("evaluatorsDropdown");
const evaluatorIDSpan = document.getElementById("evaluatorID");
const fluency = document.getElementById("fl");
const flCommentRowEl = document.getElementById("flcomment");
const flCommentRow = flCommentRowEl ? flCommentRowEl.parentElement.parentElement : null;
const intonation = document.getElementById("in");
const inCommentRowEl = document.getElementById("incomment");
const inCommentRow = inCommentRowEl ? inCommentRowEl.parentElement.parentElement : null;
const absentBtn = document.getElementById("absentBtn");
const extraInfo = document.getElementById("extra-info");
const totalScoreEl = document.getElementById("totalscore");
const skillTest = document.getElementById("skilltest");
const exitevaltable = document.getElementById("exitEvalTable");
const totalscorerow = document.getElementById("totalScoreRow");
const prepCommentRowEl = document.getElementById("prepcomment");
const prepCommentRow = prepCommentRowEl ? prepCommentRowEl.parentElement.parentElement : null;
const diagnosticEvals = document.getElementById("diagnosticEvals");
const ReSchedulebTN = document.getElementById("ReScheduleEmail");

// ---------- Estado global ----------
let evaluatorsData = {};



// ---------- evaluatorsDropdown + evaluatorsData ----------
fetch("evaluators.json?v=${E4EjsonVersion}").then( (response) => response.json()).then( (data) => {
    evaluatorsData = data;
    const evaluators = data.evaluators || {};
    evaluatorsDropdown.innerHTML = '<option value="">-- Select your credentials --</option>';
    Object.keys(evaluators).forEach( (name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        evaluatorsDropdown.appendChild(option);
    }
    );

    evaluatorsDropdown.addEventListener("change", () => {
        const selectedName = evaluatorsDropdown.value;
        evaluatorIDSpan.textContent = selectedName && evaluators[selectedName] ? evaluators[selectedName][0] : "- - - -";
        if (selectedName) {
            localStorage.setItem("selectedEvaluator", selectedName);
        } else {
            localStorage.removeItem("selectedEvaluator");
        }
    }
    );

    const savedEvaluator = localStorage.getItem("selectedEvaluator");

    if (savedEvaluator && evaluators[savedEvaluator]) {
        evaluatorsDropdown.value = savedEvaluator;
        evaluatorsDropdown.dispatchEvent(new Event("change",{
            bubbles: true
        }));

        // welcome message
        const welcome = document.createElement("div");
        welcome.className = "evaluator-welcome";
        welcome.textContent = `Welcome back, ${savedEvaluator}! 👋`;
        document.body.appendChild(welcome);
        console.log(`Welcome back, ${savedEvaluator}`)

        setTimeout( () => {
            welcome.remove();
        }
        , 5000);

    }
}
).catch( (error) => {
    console.error("Error al cargar el JSON:", error);
}
);


let topicBreakdown = {};
let topicBreakdownLoaded = false;

async function loadTopicBreakdown() {
    try {
        const response = await fetch(`topicsBreakdown.json?v=${Date.now()}`);
        const data = await response.json();
        console.log("JSON cargado");
        topicBreakdown = data["Topic Breakdown"] || {};
        topicBreakdownLoaded = true;
        console.log("📦topicBreakdown procesado");
    } catch (err) {
        console.error(" Error loading topic breakdown:", err);
    }
}


loadTopicBreakdown();



// Habilitar absent al cambiar syllabus
if (syllabusE4E) {
    syllabusE4E.addEventListener("change", () => {
        if (absentBtn)
            absentBtn.disabled = false;
    }
    );
}


// ---------- HELPERS ----------


function isDiagnosticEval(syllabusVal, levelVal) {
    return ((syllabusVal === "Kids (Super Intensivo) 8-12" && levelVal === 2) || (syllabusVal === "Teens 13-17 (5 horas/semana)" && levelVal === 2) || (syllabusVal === "Kids Masters" && levelVal === 2) || (syllabusVal === "Teens Masters" && levelVal === 2));
}


function isFilterEval(syllabusVal, levelVal, weekVal) {
    return ((syllabusVal === "Juniors 5-7" && [7, 9].includes(levelVal) && weekVal === 7) || (syllabusVal === "Kids (Intensivo) 8-12" && [2, 4, 7, 9].includes(levelVal) && weekVal === 13) || (syllabusVal === "Kids (Super Intensivo) 8-12" && [4, 7, 9].includes(levelVal) && weekVal === 7) || (syllabusVal === "Kids Masters" && [4, 8].includes(levelVal) && weekVal === 3) || (syllabusVal === "Kids Masters 2" && [4, 8].includes(levelVal) && weekVal === 3) || (syllabusVal === "Teens 13-17 (3hrs/week)" && [2, 4, 7, 9].includes(levelVal) && weekVal === 13) || (syllabusVal === "Teens 13-17 (5hrs/week)" && [4, 7, 9].includes(levelVal) && weekVal === 7) || (syllabusVal === "Teens Masters" && [4, 8].includes(levelVal) && weekVal === 3) || (syllabusVal === "Teens Masters 2" && [4, 8].includes(levelVal) && weekVal === 3) || (syllabusVal === "Adults (3hrs/week)" && [5, 8].includes(levelVal) && weekVal === 3) || (syllabusVal === "Adults (5hrs/week)" && [5, 8].includes(levelVal) && weekVal === 3) || (syllabusVal === "Adults Masters (3hrs/week)" && [5, 8].includes(levelVal) && weekVal === 3) || (syllabusVal === "Adults Masters (5hrs/week)" && [5, 8].includes(levelVal) && weekVal === 3));
}


function isExitEval(syllabusVal, levelVal, weekVal) {
    const syllabusLower = syllabusVal.toLowerCase();

    return (!syllabusVal.startsWith("Juniors") && ((levelVal === 10 && (weekVal === 7 || weekVal === 13)) || (levelVal === 12 && weekVal === 3) || (syllabusVal.includes("Masters") && levelVal === 10 && weekVal === 3) || (syllabusLower.includes("adults (5hrs/week)") && levelVal === 10 && weekVal === 3)) && !((syllabusLower.includes("kids intensivo") && levelVal === 10 && weekVal === 7) || (syllabusLower.includes("teens 13-17 (3hrs/week)") && levelVal === 10 && weekVal === 7)));
}
function setCEFRInfo(syllabusVal) {
  var failedCEFR = "";
  var finalCEFR = "";
  var descripcionCEFR = "";

  switch (syllabusVal) {
// juniors dont have cefr but left empty for future updates or changes
    case "Juniors 5-7":
      failedCEFR = "";
      finalCEFR = "A2";
      descripcionCEFR = "";
      break;

          // all kids and teens share the same
    case "Kids (Intensivo) 8-12":
    case "Kids (Super Intensivo) 8-12":
    case "Teens 13-17 (3 horas/semana)":
    case "Teens 13-17 (5 horas/semana)":
      failedCEFR = "Básico Avanzado (A2)";
      finalCEFR = "Intermedio (B1)";
      descripcionCEFR = `<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comunicarse con confianza en situaciones cotidianas, describiendo personas, lugares y experiencias.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Hablar sobre rutinas, acciones presentes, eventos pasados y planes futuros con claridad.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Participar en conversaciones sobre temas familiares, expresar opiniones, comparar ideas, hacer predicciones y hablar sobre situaciones hipotéticas.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comprender las ideas principales de conversaciones y textos sobre temas conocidos y responder con claridad, organización y un buen nivel de precisión gramatical.
  </td>
</tr>`;
      break;

          // kids and teens masters share
    case "Kids Masters":
    case "Teens Masters":
      failedCEFR = "Intermedio (B1)";
      finalCEFR = "Intermedio Alto (B1+)";
      descripcionCEFR = `<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comunicarse con confianza en situaciones cotidianas, describiendo personas, lugares y experiencias.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Hablar sobre rutinas, acciones presentes, eventos pasados y planes futuros utilizando una variedad de tiempos verbales.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Participar en conversaciones sobre temas familiares, expresar opiniones, comparar ideas, hacer predicciones y hablar sobre situaciones hipotéticas.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comprender las ideas principales de conversaciones y textos sobre temas conocidos y responder con claridad, organización y buena precisión gramatical.
  </td>
</tr>`;
     break;
// `
          // kids and teens masters 2 share
    case "Kids Masters 2":
    case "Teens Masters 2":
      failedCEFR = " B1+ (Intermedio Alto)";
      finalCEFR = "B2 Inicial (Intermedio Avanzado)";
      descripcionCEFR = `<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comunicarse con confianza y espontaneidad en una amplia variedad de situaciones cotidianas y académicas.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Expresar y defender sus opiniones, narrar experiencias, describir acciones presentes y planes futuros, y formular hipótesis utilizando una amplia variedad de estructuras gramaticales.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Mantener conversaciones fluidas con hablantes de inglés sobre temas familiares y de interés con seguridad y naturalidad.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comprender las ideas principales de conversaciones y textos de complejidad media, y producir respuestas claras, coherentes y bien organizadas con un buen nivel de precisión gramatical.
  </td>
</tr>`;
          break;

          // adults share
    case "Adults (3hrs/week)":
    case "Adults (5hrs/week)":
      failedCEFR = "";
      finalCEFR = "Básico Avanzado (A2+)";
      descripcionCEFR = `<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comunicarte con confianza en situaciones cotidianas y de viaje, realizando y respondiendo preguntas sobre información personal, rutinas, experiencias pasadas y planes futuros.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Describir personas, lugares y actividades, comparar opciones, expresar habilidades y dar consejos sencillos utilizando estructuras gramaticales básicas e intermedias.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comprender las ideas principales de conversaciones relacionadas con temas familiares y situaciones de la vida diaria.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Mantener intercambios claros y efectivos en contextos sociales, laborales y académicos de complejidad moderada.
  </td>
</tr>`
          break;

          // adults masters share
    case "Adults Masters (3hrs/week)":
    case "Adults Masters (5hrs/week)":
      failedCEFR = "Básico Avanzado (A2+)";
      finalCEFR = "Intermedio (B1)";
      descripcionCEFR = `<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comunicarte con seguridad y autonomía en una amplia variedad de situaciones personales, académicas y laborales.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Describir experiencias, rutinas y hábitos pasados, hablar sobre acciones en progreso, expresar planes, predicciones y formular hipótesis utilizando una amplia variedad de estructuras gramaticales.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Mantener conversaciones claras y relativamente espontáneas, expresar y justificar opiniones, y ofrecer consejos con confianza.
  </td>
</tr>
<tr>
  <td style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px; text-align: left; font-weight: 400;">
    &#10004; Comprender las ideas principales de conversaciones y textos de complejidad media y desenvolverse eficazmente en la mayoría de situaciones en un entorno de habla inglesa.
  </td>
</tr>`;
  break;
  }

  return {
    failedCEFR,
    finalCEFR,
    descripcionCEFR
  };
}




function hideTopicTables(diagnostic) {
    const tables = document.querySelectorAll(".topictable");
    tables.forEach( (table) => {
        table.style.display = diagnostic ? "none" : "";
    }
    );
}


weekE4E.addEventListener("change", () => {
    const syllabusVal = syllabusE4E.value;
    const levelVal = parseInt(levelE4E.value, 10);
      const diagnostic = isDiagnosticEval(syllabusVal, levelVal);

    hideTopicTables(diagnostic);

        if (diagnosticEvals) {
        diagnosticEvals.style.display = diagnostic ? "" : "none";
    }
}
);



function nearlyEqual(a, b, eps=1e-6) {
    if (!Number.isFinite(a) || !Number.isFinite(b))
        return false;
    return Math.abs(a - b) <= eps;
}



function updateExtraInfo() {
    const syllabusVal = syllabusE4E?.value || "";
    const levelVal = parseInt(levelE4E?.value, 10) || 0;
    const weekVal = parseInt(weekE4E?.value, 10) || 0;
    handleL10KidsSI();
       const isprep = !!(syllabusVal && syllabusVal.toLowerCase().includes("masters 2"));

    if (prepCommentRow) {
        if (isprep) {
            prepCommentRow.classList.remove("hidden");
            if (prepCommentRowEl && prepCommentRowEl.options.length === 0) {
                populatePreparation(prepCommentRowEl);
            }
        } else {
            prepCommentRow.classList.add("hidden");
        }
    }


    const isExit = isExitEval(syllabusVal, levelVal, weekVal);


    const isDiag = isDiagnosticEval(syllabusVal, levelVal);
    if (diagnosticEvals) {
        diagnosticEvals.classList.toggle("hidden", !isDiag);
    }

    if (!isDiag) {
        if (exitevaltable) {
            exitevaltable.classList.toggle("hidden", !isExit);
            if (!isExit && skillTest) {
                skillTest.value = "";
                if (typeof calculateFinalScore === "function")
                    calculateFinalScore();
            }
        }


        if (totalscorerow) {
            totalscorerow.classList.toggle("hidden", isExit);
        }


        if (extraInfo) {
            let htmlContent = "";


            let scoreVal = isExit ? parseFloat(finalScore?.textContent.trim()) : parseFloat(totalScoreEl?.textContent.trim());

            const fixedScore = Number(scoreVal?.toFixed(2));


            if (fixedScore === 7) {
                htmlContent += `
          <label class="extraInfoAddOns">
            ${isExit ? "Exit Condicionado" : "Condicionado"}
            <input type="checkbox" id="condicionado" checked>
          </label>`;
            }


            const isFilter = isFilterEval(syllabusVal, levelVal, weekVal);

            const shouldShowReschedule = (isExit && fixedScore < 7) || (isFilter && fixedScore < 7);

            if (shouldShowReschedule) {
                htmlContent += `
          <label class="extraInfoAddOns">
            Include reschedule link
            <input type="checkbox" id="reScheduleCheck" >
          </label>`;
            }


            extraInfo.innerHTML = htmlContent;
        }
    }
}



function calculateFinalScore() {
    const totalValue = parseFloat(totalScoreEl?.textContent) || 0;


    let skillTestScore = 0;
    if (skillTest) {
        if ("value"in skillTest) {
            skillTestScore = parseFloat(skillTest.value) || 0;
        } else {
            skillTestScore = parseFloat(skillTest.textContent) || 0;
        }
    }

    const finalScoreValue = totalValue * 0.6 + skillTestScore * 0.4;
    if (finalScore) {
        finalScore.textContent = Number.isFinite(finalScoreValue) ? Math.round(finalScoreValue * 10) / 10 : "";
    }
}



["gr", "pr", "in", "fl", "co"].forEach( (id) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", () => {
            updateExtraInfo();

            if (exitevaltable && !exitevaltable.classList.contains("hidden")) {
                calculateFinalScore();
            }
        }
        );
    }
}
);

if (weekE4E)
    weekE4E.addEventListener("change", updateExtraInfo);
if (levelE4E)
    levelE4E.addEventListener("change", updateExtraInfo);
if (syllabusE4E)
    syllabusE4E.addEventListener("change", updateExtraInfo);

// skillTest es un <input type="number">: recalcula final y luego extraInfo al cambiar
if (skillTest) {
    skillTest.addEventListener("input", () => {
        if (typeof calculateFinalScore === "function")
            calculateFinalScore();
        updateExtraInfo();
    }
    );
}


function getSyllabusBucket(syllabus) {
    if (!syllabus)
        return null;
    if (syllabus.startsWith("Juniors"))
        return "Juniors";
    if (syllabus.startsWith("Kids") && !syllabus.includes("Masters"))
        return "Kids";
    if (syllabus.startsWith("Teens") && !syllabus.includes("Master"))
        return "Teens";
    if (syllabus.startsWith("Adults") && !syllabus.includes("Masters"))
        return "Adults";
    if (syllabus.includes("Masters"))
        return "Masters";
    return null;
}



function normalizeCommentsData(data) {
    if (!data)
        return [];
    if (Array.isArray(data))
        return data;
    if (typeof data === "object") {
        return Object.keys(data).map( (key) => {
            const val = data[key];
            const html = Array.isArray(val) ? val[0] : typeof val === "string" ? val : "";
            return {
                label: key,
                html
            };
        }
        );
    }
    return [];
}




function getCommentsArray(bucket, category) {
    if (!evaluatorsData)
        return [];


    if (bucket && evaluatorsData[bucket] && evaluatorsData[bucket][category]) {
        return normalizeCommentsData(evaluatorsData[bucket][category]);
    }


    if (evaluatorsData.comments && evaluatorsData.comments[bucket] && evaluatorsData.comments[bucket][category]) {
        return normalizeCommentsData(evaluatorsData.comments[bucket][category]);
    }


    if (evaluatorsData[category] && evaluatorsData[category][bucket]) {
        return normalizeCommentsData(evaluatorsData[category][bucket]);
    }


    if (evaluatorsData.commentsPerArea && evaluatorsData.commentsPerArea[category] && evaluatorsData.commentsPerArea[category][bucket]) {
        return normalizeCommentsData(evaluatorsData.commentsPerArea[category][bucket], );
    }


    if (Array.isArray(evaluatorsData[category])) {
        return normalizeCommentsData(evaluatorsData[category]);
    }

    return [];
}




function populateComments(selectElement, category, syllabus) {
    selectElement.innerHTML = "";

    const bucket = getSyllabusBucket(syllabus);
    const items = getCommentsArray(bucket, category);

    if (items && items.length) {
        items.forEach( (item) => {
            const opt = document.createElement("option");
            if (typeof item === "string") {
                opt.value = item;
                opt.textContent = item;
            } else if (item && typeof item === "object" && item.label) {
                opt.value = item.html || "";
                opt.textContent = item.label;
            } else {
                opt.value = "";
                opt.textContent = String(item);
            }
            selectElement.appendChild(opt);
        }
        );
    } else {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Choose a Syllabus first";
        selectElement.appendChild(opt);
    }

    // DEBUG
    // console.log({ syllabus, bucket, category, items });
}


function populatePreparation(selectEl) {
    if (!selectEl)
        return;


    const prepObj = evaluatorsData?.commentsPerArea?.["Preparación"];
    if (!prepObj) {

        selectEl.innerHTML = "";
        return;
    }


    const prevValue = selectEl.value;


    selectEl.innerHTML = "";
    Object.keys(prepObj).forEach( (label) => {
        const opt = document.createElement("option");
        opt.value = label;
        opt.textContent = label;
        selectEl.appendChild(opt);
    }
    );


    if (prevValue && Array.from(selectEl.options).some( (o) => o.value === prevValue)) {
        selectEl.value = prevValue;
    } else {

        if (selectEl.options.length > 0)
            selectEl.selectedIndex = 0;
    }
}



// Special case for L10 Kids SI - Opinion y Justificación, Describir Imágenes, Hacer Preguntas
// 10-aug-26 > request urgent change: add Kids Intensivo to the target
function handleL10KidsSI() {
    const syllabus = syllabusE4E?.value || "";
    const level = parseInt(levelE4E?.value, 10);

    const anchorRow = document.getElementById("l10KidsSI");
    if (!anchorRow)
        return;
    // BEFORE
    // const isTarget = syllabus === "Kids (Super Intensivo) 8-12" && level === 10;
     const isTarget =  (syllabus === "Kids (Super Intensivo) 8-12" || syllabus === "Kids (Intensivo) 8-12")  && level === 10;

    document.querySelectorAll(".l10-generated").forEach( (row) => row.remove());

    if (!isTarget) {
        anchorRow.classList.add("hidden");
        return;
    }

    anchorRow.classList.remove("hidden");


    const areaLabelsEN = {
        "Expresión de opinión y justificación": "Opinion & Justification",
        "Descripción de imágenes": "Describing a Picture",
        "Formulación de preguntas": "Asking Questions",
    };


    const areas = Object.keys(areaLabelsEN);

    areas.forEach( (area) => {
        const data = evaluatorsData?.commentsPerArea?.[area];
        if (!data)
            return;

        const tr = document.createElement("tr");
        tr.classList.add("additionalComment", "l10-generated");

        const tdLabel = document.createElement("td");
        tdLabel.classList.add("areasevaluation");


        tdLabel.textContent = areaLabelsEN[area] || area;

        const tdSelect = document.createElement("td");
        tdSelect.classList.add("extraarea");

        const select = document.createElement("select");

        Object.keys(data).forEach( (label) => {
            const opt = document.createElement("option");
            opt.value = data[label][0];
            opt.textContent = label;
            select.appendChild(opt);
        }
        );

        tdSelect.appendChild(select);

        tr.appendChild(tdLabel);
        tr.appendChild(tdSelect);

        anchorRow.insertAdjacentElement("afterend", tr);
    }
    );
}


// ---------- Eventos: FLUENCY / INTONATION ----------
fluency.addEventListener("change", () => {
    const syllabusVal = syllabusE4E.value;
    const levelVal = parseInt(levelE4E.value, 10);
    if (isDiagnosticEval(syllabusVal, levelVal))
        return;

    const value = parseFloat(fluency.value);
    const select = document.getElementById("flcomment");
    const syllabus = syllabusE4E.value;

    if (value <= 1.0) {
        flCommentRow.classList.remove("hidden");
        populateComments(select, "Fluidez", syllabus);
    } else {
        flCommentRow.classList.add("hidden");
        select.innerHTML = "";
    }
}
);



intonation.addEventListener("change", () => {
    const syllabusVal = syllabusE4E.value;
    const levelVal = parseInt(levelE4E.value, 10);
    if (isDiagnosticEval(syllabusVal, levelVal))
        return;

    const value = parseFloat(intonation.value);
    const select = document.getElementById("incomment");
    const syllabus = syllabusE4E.value;

    if (value <= 1.0) {
        inCommentRow.classList.remove("hidden");
        populateComments(select, "Entonación", syllabus);
    } else {
        inCommentRow.classList.add("hidden");
        select.innerHTML = "";
    }
}
);



// ------------------ helpers pequeños ------------------
function refreshVisibleComments() {
    const syllabus = syllabusE4E.value;


    const flSelect = document.getElementById("flcomment");
    if (!flCommentRow.classList.contains("hidden")) {
        const prevLabel = flSelect.options[flSelect.selectedIndex]?.textContent || null;
        populateComments(flSelect, "Fluidez", syllabus);
        if (prevLabel) {
            const idx = Array.from(flSelect.options).findIndex( (o) => o.textContent === prevLabel, );
            if (idx >= 0)
                flSelect.selectedIndex = idx;
        }
    }


    const inSelect = document.getElementById("incomment");
    if (!inCommentRow.classList.contains("hidden")) {
        const prevLabel = inSelect.options[inSelect.selectedIndex]?.textContent || null;
        populateComments(inSelect, "Entonación", syllabus);
        if (prevLabel) {
            const idx = Array.from(inSelect.options).findIndex( (o) => o.textContent === prevLabel, );
            if (idx >= 0)
                inSelect.selectedIndex = idx;
        }
    }
}




syllabusE4E.addEventListener("change", () => {

    const syllabus = syllabusE4E.value;
    if (!syllabus) {
        if (!flCommentRow.classList.contains("hidden"))
            document.getElementById("flcomment").innerHTML = "";
        if (!inCommentRow.classList.contains("hidden"))
            document.getElementById("incomment").innerHTML = "";
        return;
    }


    refreshVisibleComments();
}
);



(function() {
    function waitForEvaluatorReady(timeout=4000) {
        return new Promise( (resolve) => {
            const start = Date.now();
            (function check() {
                const domReady = document.readyState !== "loading";
                const hasOptions = document.getElementById("evaluatorsDropdown") && document.getElementById("evaluatorsDropdown").options.length > 1;
                const dataReady = typeof evaluatorsData !== "undefined" && (evaluatorsData.evaluators || Object.keys(evaluatorsData).length > 0);
                if (domReady && (hasOptions || dataReady))
                    return resolve(true);
                if (Date.now() - start > timeout)
                    return resolve(false);
                setTimeout(check, 50);
            }
            )();
        }
        );
    }

    async function showEvaluatorModal() {
        await waitForEvaluatorReady();
        const savedEvaluator = localStorage.getItem("selectedEvaluator");

        if (savedEvaluator && document.getElementById("evaluatorsDropdown")) {
            const realEval = document.getElementById("evaluatorsDropdown");

            if (Array.from(realEval.options).some( (o) => o.value === savedEvaluator)) {
                realEval.value = savedEvaluator;
                realEval.dispatchEvent(new Event("change",{
                    bubbles: true
                }));
                return;
            }
        }
        // overlay + box
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        const box = document.createElement("div");
        box.className = "modal-box";
        box.innerHTML = `
      <h3 class="modal-title">Knock Knock! Who's there?</h3>
      <p class="modal-desc">Select your name to continue.</p>
      <div class="modal-grid">
        <div id="modalEvalContainer"></div>
        <div class="modal-btns">
          <button id="modalConfirm" class="btn btn-confirm" type="button">Continue</button>
        </div>
      </div>
    `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        document.documentElement.style.overflow = "hidden";

        const container = box.querySelector("#modalEvalContainer");
        const btnConfirm = box.querySelector("#modalConfirm");


        const realEval = document.getElementById("evaluatorsDropdown");
        let modalSelect;
        if (realEval && realEval.options.length > 1) {
            modalSelect = realEval.cloneNode(true);
            modalSelect.id = "modal_evaluatorsDropdown";
            modalSelect.disabled = false;
        } else {
            modalSelect = document.createElement("select");
            modalSelect.id = "modal_evaluatorsDropdown";
            if (evaluatorsData && evaluatorsData.evaluators) {
                modalSelect.innerHTML = '<option value="">-- Select evaluator --</option>';
                Object.keys(evaluatorsData.evaluators).forEach( (name) => {
                    const o = document.createElement("option");
                    o.value = name;
                    o.textContent = name;
                    modalSelect.appendChild(o);
                }
                );
            } else {
                modalSelect.innerHTML = '<option value="">(no evaluators)</option>';
            }
        }

        modalSelect.className = "modal-select";
        container.appendChild(modalSelect);
        modalSelect.focus();


        function shakeAndFocus() {
            box.animate([{
                transform: "translateX(0)"
            }, {
                transform: "translateX(-8px)"
            }, {
                transform: "translateX(8px)"
            }, {
                transform: "translateX(0)"
            }, ], {
                duration: 220,
                easing: "ease-out"
            }, );

            modalSelect.style.boxShadow = "0 0 0 3px rgba(255,0,0,0.12)";
            setTimeout( () => (modalSelect.style.boxShadow = ""), 420);
            modalSelect.focus();
        }


        btnConfirm.addEventListener("click", () => {
            const chosen = modalSelect.value;
            if (!chosen) {
                shakeAndFocus();
                return;
            }

            localStorage.setItem("selectedEvaluator", chosen);
            console.log("Saved:", localStorage.getItem("selectedEvaluator"));

            if (realEval) {
                if (!Array.from(realEval.options).some( (o) => o.value === chosen)) {
                    const opt = document.createElement("option");
                    opt.value = chosen;
                    opt.textContent = modalSelect.options[modalSelect.selectedIndex]?.textContent || chosen;
                    realEval.appendChild(opt);
                }
                realEval.value = chosen;
                realEval.dispatchEvent(new Event("change",{
                    bubbles: true
                }));
            } else {
                console.warn("evaluatorsDropdown no encontrado en DOM.");
            }

            if (overlay && overlay.parentElement)
                document.body.removeChild(overlay);
            document.documentElement.style.overflow = "";
        }
        );


        function onKey(e) {
            if (e.key === "Escape") {
                shakeAndFocus();
            }
            if (e.key === "Enter" && document.activeElement === modalSelect) {

                btnConfirm.click();
            }
        }
        document.addEventListener("keydown", onKey);


        const observer = new MutationObserver( () => {
            if (!document.body.contains(box)) {
                document.removeEventListener("keydown", onKey);
                observer.disconnect();
            }
        }
        );
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(showEvaluatorModal, 60), );
    } else {
        setTimeout(showEvaluatorModal, 60);
    }
}
)();



function absentsE4E() {
    const syllabus = syllabusE4E.value || "";
    if (!syllabus) {
        showPopup("<h3>😓 Oops...</h3><p>Please select a valid syllabus first.</p>", );
        absentBtn.disabled = true;
        return;
    }

    let message = "";

    if (syllabus.startsWith("Adults")) {
        // ---- mensaje para estudiante ----
        message = `
    <html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reporte de evaluación</title>
  <!-- STYLE -->

</head>

<body style="margin: 0 auto; background: linear-gradient(
          to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%
        ); background-color: #1ca5ab15;">
  <div class="Evaluation-Results" style="margin: 0 auto; background: linear-gradient(
          to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%
        ); background-color: #1ca5ab15;">
    <!-- <!HEADER> -->
    <div style="
          text-align: center;
          background: linear-gradient(to bottom, #f5f0e6 0%, transparent 50%);
          background-color: transparent;
        ">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERKIDS.png" alt="" style="width: 100%; display: block; border: 0">
    </div>
    <div style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
      <p style="padding: 0 1rem; font-size: 18px; font-weight: 700; color: #126064; font-family: Segoe UI; margin: 0;">
        Estimado estudiante,</p>
      <!-- &#x1F31F; -->
      <p
        style="padding: 0 1rem; font-size: 14px; font-weight: 400; color: #126064; padding-bottom: 0.8rem; font-family: Segoe UI;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>

    <div class="email-body"
      style="border-radius: 20px; padding: 1rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">
      <div class="resultado-global" style="padding: 0 1rem; text-align: center;">
        <p
          style="padding: 1rem 1rem 0; font-size: 15px; text-decoration: none; font-family: Segoe UI; color: #297b7f; font-weight: 600; margin: 0 auto 5px;">
          Te informamos que:
        </p>
        <p
          style="padding: 0 1rem 0; font-family: Segoe UI; font-weight: 700; color: #297b7f; font-size: 20px; margin: 0;">
          No asististe a tu evaluación filtro.
        </p>
        <p
          style="font-size: 14px; font-weight: 400; padding: 0 1rem 0; color: #126064; font-family: Segoe UI; margin: 5px 0 0;">
          correspondiente a tu
          nivel en
          <b>${syllabus}</b>.
        </p>
      </div>
      <!-- next steps -->
      <div style="margin: 4rem 0">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="border-collapse: collapse; border: none; background-color: #f9fafb; border-radius: 20px;">
          <tr>
            <th width="20%" align="right" cellspacing="0" cellpadding="0">
              <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 50px;"">
            </th>
            <th width="80%"
              style="font-weight: 500; text-align: left; font-size: 16px; color: #126064; font-family: Segoe UI; padding: 30px 20px; line-height: 1; "
              align="left">
              Para evitar retrocesos en su progreso, te solicitamos
              <b>reagendar la evaluación lo antes posible.</b>
            </th>
          </tr>
          <tr>
            <td colspan="2"
              style="font-size: 14px; font-family: Segoe UI; padding: 0 20px 30px; font-weight: 400; color: #044043; text-align: center;"
              align="center">
              <p style="font-family: Segoe UI; margin: 1rem 15%">
                Esta evaluación es <b>obligatoria para avanzar al siguiente nivel</b> del programa.<br><br>&#9888;&#65039; Dado que te encuentras en un
                <b>nivel filtro</b>, si no presentas esta evaluación, serás
                <b>reprogramado automáticamente para repetir el nivel</b>.
              </p>
              <a href="https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones" target="_blank"
                style="text-decoration: none; font-family: Segoe UI; background-color: #147b7b; padding: 1rem 10%; border-radius: 15px; font-weight: 700; color: white; font-size: 15px; margin: 1rem auto 0.5rem; display: inline-block;">
                Reagenda la
                Evaluación Aquí</a>
              <p style="font-family: Segoe UI; font-size: 12px; margin: 0 10%;">
                Ahí podrás seleccionar el
                <b>horario que mejor se acomode</b> y agendarla por tu cuenta de forma rápida y sencilla.
              </p>
            </td>
          </tr>
        </table>
      </div>
      <!-- TU ESFUERXO CUENTA -->
      <div style="margin: 3rem 0">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; background-color: #f9fafb;">
          <tr>
            <th
              style="font-size: 14px; font-family: Segoe UI; padding: 2rem 20%; font-weight: 500; color: #044043; text-align: center;"
              align="center">En <b>ENGLIKSH4ADULTS</b>, creemos firmemente en el potencial de cada estudiante. Con tu
              esfuerzo, podemos asegurar que <b>seguirás avanzando con éxito</b>.
            </th>
          </tr>
        </table>
      </div>
      <!-- referal -->
      <h1
        style="font-size: 26px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:3rem auto 0.5rem;"
        align="center">¡Has recibido un cupón de ahorro!</h1>
      <a href="https://www.english4kidsonline.com/amigo" target="_blank"
        style="display:inline-block; margin:0; text-decoration:none;">
        <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/referalAdults.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
      </a>
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

</html>
    `;
    } else {
        // ---- mensaje para padres ----
        message = `
   <html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reporte de evaluación</title>
  <!-- STYLE -->

</head>

<body style="margin: 0 auto; background: linear-gradient(
          to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%
        ); background-color: #1ca5ab15;">
  <div class="Evaluation-Results" style="margin: 0 auto; background: linear-gradient(
          to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%
        ); background-color: #1ca5ab15;">
    <!-- <!HEADER> -->
    <div style="
          text-align: center;
          background: linear-gradient(to bottom, #f5f0e6 0%, transparent 50%);
          background-color: transparent;
        ">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERADULTS.png" alt="" style="width: 100%; display: block; border: 0">
    </div>
    <div style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
      <p style="padding: 0 1rem; font-size: 18px; font-weight: 700; color: #126064; font-family: Segoe UI; margin: 0;">
        Estimado padre/madre de familia,</p>
      <!-- &#x1F31F; -->
      <p
        style="padding: 0 1rem; font-size: 14px; font-weight: 400; color: #126064; padding-bottom: 0.8rem; font-family: Segoe UI;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>

    <div class="email-body"
      style="border-radius: 20px; padding: 1rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">
      <div class="resultado-global" style="padding: 0 1rem; text-align: center;">
        <p
          style="padding: 1rem 1rem 0; font-size: 15px; text-decoration: none; font-family: Segoe UI; color: #297b7f; font-weight: 600; margin: 0 auto 5px;">
          Te informamos que:
        </p>
        <p
          style="padding: 0 1rem 0; font-family: Segoe UI; font-weight: 700; color: #297b7f; font-size: 20px; margin: 0;">
          Tu hijo/a no asististió a su evaluación filtro.
        </p>
        <p
          style="font-size: 14px; font-weight: 400; padding: 0 1rem 0; color: #126064; font-family: Segoe UI; margin: 5px 0 0;">
          correspondiente a su
          nivel en
          <b>${syllabus}</b>.
        </p>
      </div>
      <!-- next steps -->
      <div style="margin: 4rem 0">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="border-collapse: collapse; border: none; background-color: #f9fafb; border-radius: 20px;">
          <tr>
            <th width="20%" align="right" cellspacing="0" cellpadding="0">
              <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 50px;"">
            </th>
            <th width="80%"
              style="font-weight: 500; text-align: left; font-size: 15px; color: #126064; font-family: Segoe UI; padding: 30px 20px; line-height: 1; "
              align="left">
              Para evitar retrocesos en su progreso, te solicitamos
              <b>reagendar la evaluación lo antes posible.</b>
            </th>
          </tr>
          <tr>
            <td colspan="2"
              style="font-size: 14px; font-family: Segoe UI; padding: 0 20px 30px; font-weight: 400; color: #044043; text-align: center;"
              align="center">
              <p style="font-family: Segoe UI; margin: 1rem 15%">
                Esta evaluación es <b>obligatoria para avanzar al siguiente nivel</b> del programa.<br><br>&#9888;&#65039; Dado que tu hijo/a se encuentra en un
                <b>nivel filtro</b>, si no presenta esta evaluación, será
                <b>reprogramado automáticamente para repetir el nivel</b>.
              </p>
              <a href="https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones" target="_blank"
                style="text-decoration: none; font-family: Segoe UI; background-color: #147b7b; padding: 1rem 10%; border-radius: 25px; font-weight: 700; color: white; font-size: 14px; margin: 1rem auto 0.5rem; display: inline-block;">
                Reagenda la
                Evaluación Aquí</a>
              <p style="font-family: Segoe UI; font-size: 12px; margin: 0 10%;">
                Ahí podrás seleccionar el
                <b>horario que mejor se acomode</b> y agendarla por tu cuenta de forma rápida y sencilla.
              </p>
            </td>
          </tr>
        </table>
      </div>
      <!-- TU ESFUERXO CUENTA -->
      <div style="margin: 3rem 0; width: 100%;">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; background-color: #f9fafb;">
          <tr>
            <th
              style="font-size: 14px; font-family: Segoe UI; padding: 2rem 20%; font-weight: 500; color: #044043; text-align: center;"
              align="center">En <b>ENGLIKSH4KIDS</b>, creemos firmemente en el potencial de cada estudiante. Con tu
              apoyo, podemos asegurar que tu hijo/a <b>siga avanzando con éxito</b>.
            </th>
          </tr>
        </table>
      </div>
      <!-- referal -->
      <h1
        style="font-size: 26px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:3rem auto 0.5rem;"
        align="center">¡Has recibido un cupón de ahorro!</h1>
      <a href="https://www.english4kidsonline.com/amigo" target="_blank"
        style="display:inline-block; margin:0; text-decoration:none;">
        <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/referalAdults.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
      </a>
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

</html>

    `;
    }

    // Copiar al portapapeles
    const tempEl = document.createElement("textarea");
    tempEl.style.position = "fixed";
    tempEl.style.opacity = "0";
    tempEl.value = message;
    document.body.appendChild(tempEl);
    tempEl.select();
    document.execCommand("copy");
    document.body.removeChild(tempEl);

    showPopup(`<h3>✅Success!</h3><p>Absent-Report for <b>${syllabus}</b> successfully copied.</p><h4 class="previewTitle">Preview:</h4>
        <div class="smallPreview"> ${message} </div>`, );
}

async function evaluatorsCopyResults() {

    while (!topicBreakdownLoaded) {
        console.log("⏳ Esperando que topicBreakdown cargue...");
        await new Promise( (res) => setTimeout(res, 100));
    }

    console.log("✅ topicBreakdown cargado, generando RC");
    // ---------- helpers ----------
    const safe = (s) => s === null || s === undefined ? "" : String(s).replace(/\n/g, "<br>");
    const toNum = (v) => {
        const n = Number(String(v ?? "").trim());
        return Number.isNaN(n) ? NaN : n;
    }
    ;
    const describeScore = (val) => {
        switch (String(val)) {
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
    }
    ;


    const getGrammarScore = () => (document.getElementById("skilltest")?.value || document.getElementById("grammarScore")?.value || document.getElementById("grammarTest")?.value || "").toString();

    const getOralScore = () => (document.getElementById("totalscore")?.textContent || document.getElementById("totalscore")?.value || document.getElementById("oralScore")?.value || document.getElementById("oralTotal")?.textContent || "").toString();

    const getFinalScore = () => (document.getElementById("finalScore")?.textContent || document.getElementById("finalscore")?.textContent || "").toString();


    const syllabus = document.getElementById("syllabusDropdown")?.value || "";
    const syllabusLower = syllabus.toLowerCase();
    const levelVal = Number(window.selectedlevel || 0);
    const weekVal = Number(window.selectedweek || 0);
    const totalScore = Number(window.totalScore ?? NaN);
    const finalScoreText = getFinalScore();
    const evaluatorName = (document.getElementById("evaluatorsDropdown")?.value || document.getElementById("evaluatorsDropdown")?.selectedOptions?.[0]?.text || "").trim();
    let evaluatorID = document.getElementById("evaluatorID")?.textContent?.trim() || "";
    if (!evaluatorID && window.evaluatorsData && evaluatorName) {
        const ev = (window.evaluatorsData && window.evaluatorsData.evaluators && window.evaluatorsData.evaluators[evaluatorName]) || null;
        evaluatorID = ev ? String(ev[0]) : evaluatorID;
    }


    const syllabusVal = syllabus || "";
    const isExit = isExitEval(syllabusVal, levelVal, weekVal);


    const approvedTopics = [];
    const reinforceTopics = [];
    const opportunityTopics = [];

    const sections = Array.from(document.querySelectorAll("#topicsList section"));

    sections.forEach( (section, idx) => {
        const container = section.querySelector(".topic-container") || section;
        const title = container.querySelector(".topic-title h3")?.innerText?.trim() || "Tema desconocido";


        const yesBtn = container.querySelector(".toggle-cell.yes");
        const noBtn = container.querySelector(".toggle-cell.no");
        let choice;
        if (yesBtn)
            choice = "yes";
        else if (noBtn)
            choice = "no";
        else
            choice = (window.topicsStatus && window.topicsStatus[String(idx)]) || undefined;

        if (choice === "yes")
            approvedTopics.push(title);
        if (choice === "no")
            reinforceTopics.push(title);

        const answerEl = container.querySelector(`#answer${idx}`) || document.getElementById(`answer${idx}`);
        const corrEl = container.querySelector(`#correction${idx}`) || document.getElementById(`correction${idx}`);
        const answerText = answerEl ? (answerEl.innerText || answerEl.textContent || "").trim() : "";
        const correctionText = corrEl ? (corrEl.innerText || corrEl.textContent || "").trim() : "";

        if (answerText !== "" || correctionText !== "") {
            opportunityTopics.push({
                title,
                answer: answerText,
                correction: correctionText,
            });
        }
    }
    );

    // ---------- performance areas ----------
    const areas = [{
        id: "gr",
        label: "Gramática"
    }, {
        id: "fl",
        label: "Fluidez"
    }, {
        id: "pr",
        label: "Pronunciación"
    }, {
        id: "co",
        label: "Comprensión"
    }, {
        id: "in",
        label: "Entonación"
    }, ];
    const desempeñoHTML = `
  <div class="desempeño"
    style="margin: 3rem 1rem; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
    <table width="80%" align="center" cellspacing="0" style="width: 80%; overflow: hidden;" width="80%; table-layout: fixed;">
      <thead>
        <tr>
          <th colspan="2"
            style="font-size: 22px; font-family:  Segoe UI, Roboto; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
            align="center"> Desempeño por área </th>
        </tr>
      </thead>
      <tbody>
          ${areas.map( (a) => {
        const val = document.getElementById(a.id)?.value ?? "";
        return ` 
        <tr>
          <td width="40%" align="right"
            style="font-family: Segoe UI; padding: 10px 10px 10px; font-weight: 400; color: #1C5457; text-align: right; font-size: 15px;">
            ${a.label}:</td>
          <td width="60%"
            style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px;text-align: left; font-weight: 400; ">
            ${describeScore(val)}</td>
        </tr>`;
    }
    ).join("")}
        </tbody>
      </table>
    </div>`;


    const pronunciationMistakes = document.getElementById("pronunciationMistakes")?.value?.trim() || "";
    const extraCommentsFallback = document.getElementById("extraComments")?.value?.trim() || "";

    const areaDetails = [];
    const inVal = toNum(document.getElementById("in")?.value ?? NaN);
    const flVal = toNum(document.getElementById("fl")?.value ?? NaN);

    if (!Number.isNaN(inVal) && inVal <= 1.0) {
        const txt = document.getElementById("incomment")?.value?.trim() || "";
        if (txt)
            areaDetails.push(` <tr>
          <td
            style="  color: #126064;  text-align: left;  padding: 0.9rem 0.5rem 0.9rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            &#x24D8; Detalle de Entonación:</td>
        </tr>
        <tr>
          <td
            style="  color: #497275;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
            ${safe(txt)}</td>
        </tr>`, );
    }
    if (!Number.isNaN(flVal) && flVal <= 1.0) {
        const txt = document.getElementById("flcomment")?.value?.trim() || "";
        if (txt)
            areaDetails.push(` 

        <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0.9rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            &#x24D8; Detalle de fluidez:</td>
        </tr>
        <tr>
          <td
            style="  color: #497275;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
            ${safe(txt)}</td>
        </tr>
                `);
    }

    const PREPARACION_MAP = {
        "No se preparó": `

        <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0.9rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            &#x24D8; Preparación para la exposición: No se preparó
          </td>
        </tr>
        <tr>
          <td
            style="  color: #497275;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
            Recuerda que la práctica es clave para mejorar tu inglés.
            Para la próxima,
            intenta revisar cada tema con anticipación y practicar hablando en voz
            alta. Puedes hacer resúmenes o responder preguntas sobre cada tema para
            sentirte más seguro. <br/><br/>
        ¡Anímate a prepararte mejor la próxima vez!
          </td>
        </tr>`,
        "Se preparó, pero pudo hacerlo mejor": `

        <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0.9rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            &#x24D8; Preparación para la exposición: Se preparó, pero pudo hacerlo mejor
          </td>
        </tr>
        <tr>
          <td
            style="  color: #497275;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
            Hubo preparación de parte del estudiante, pero podría haber sido más claro
            y organizado en su exposición.
            Intenta practicar más con ejemplos y conectar mejor los temas.
            Puedes hacer una lista de frases clave para cada estructura gramatical y
            repasarlas en voz alta antes de hablar.<br/><br/>
      ¡Sigue practicando, estás mejorando!
          </td>
        </tr>`,
        "Se preparó bien y logró integrar la mitad o más de los temas": `

        <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0.9rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            &#x24D8; Preparación para la exposición: Se preparó bien y logró integrar la
            mitad o más de los temas
          </td>
        </tr>
        <tr>
          <td
            style="  color: #497275;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
            ¡Excelente trabajo! <br/><br/>
        Lograste integrar varios temas gramaticales en tu
          exposición de manera clara y organizada.
        Tu uso de los tiempos verbales
          fue acertado, y tu fluidez ha mejorado mucho.
         Sigue practicando para
          perfeccionar tu entonación y confianza al hablar. <br/><br/>
        ¡Sigue así, vas por muy
          buen camino!
          </td>
        </tr>`,
    };

    if (syllabusVal.includes("Masters 2")) {
        const txt = (document.getElementById("prepcomment")?.value || "").trim();
        if (txt) {
            const largo = PREPARACION_MAP[txt];            if (largo) {
                areaDetails.push(largo + "");
            } else {
                areaDetails.push(` ${safe(txt)}`);
            }
        }
    }

    // ---------- grammar/oral/final details for exit ----------
    const grammarScore = getGrammarScore();
    const oralScore = getOralScore();
    const finalDisplay = finalScoreText || (Number.isFinite(totalScore) ? String(totalScore) : "");

    console.log("DEBUG isExit:", isExit, "finalscore", finalDisplay, "totalScore:", totalScore, );

    // ---------- reschedule logic ----------
    let rescheduleBox = "";
    const addRescheduleLink = document.getElementById("reScheduleCheck")?.checked === true;
    if (addRescheduleLink) {
        rescheduleBox = `
                           <!-- REPROGRAMAR EVAL -->
        <table width="60%" align="center" cellspacing="0" cellpadding="0"
          style="border-collapse: collapse; border: none; background-color: rgba(218, 230, 230, 0.2); border-radius: 20px; margin: 4rem auto;">
          <tr>
            <th width="30%" align="right" cellspacing="0" cellpadding="0" style="padding-top: 20px;">
              <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 50px; "">
            </th>
            <th width="70%"
              style="font-weight: 700; text-align: left; font-size: 20px; color: #126064; font-family: Segoe UI; padding: 50px 20px 30px; line-height: 1; "
              align="left">
             Reprogramar Evaluación
            </th>
          </tr>
          <tr>
            <td colspan="2"
              style="font-size: 14px; font-family: Segoe UI; padding: 0 20px 30px; font-weight: 400; color: #044043; text-align: center;"
              align="center">
              Te compartimos el siguiente enlace, donde podrás reagendar la evaluación de forma rápida y
              sencilla.<br>
              <a href="https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones" target="_blank"
                style="text-decoration: none; font-family: Segoe UI; background-color: #14767B; padding: 1rem 10%; border-radius: 15px; font-weight: 700; color: white; font-size: 15px; margin: 1rem auto; display: inline-block;">
                Reprogramar Evaluación Aquí
              </a>
            </td>
          </tr>
        </table>

                       `;
    }

    // ---------- condicionado logic ----------
    const isCondicionado = document.getElementById("condicionado")?.checked === true;

    let condicionadoText = ``;
    if (syllabusVal.includes("Juniors")) {
        condicionadoText = `

        <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            <span style="color: #E87373; font-weight: bold; margin-right: 5px;">&#9888;</span>
            Condicionado/a:
          </td>
        </tr>
        <tr>
          <td
            style="  color: #126064;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
              El estudiante <b>avanza al siguiente nivel de manera condicionada</b>. Cuenta con las bases mínimas
              necesarias
              para avanzar, pero <b>requiere refuerzo para seguir el ritmo del grupo y consolidar su aprendizaje</b>.<br><br>
<b>Recomendaciones:</b>
            <ul>
              <li style=" padding: 0 0 0.5rem">
                Practicar vocabulario básico (colores, animales, acciones) de forma diaria mediante juegos, canciones o
                imágenes.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Reforzar las estructuras gramaticales trabajadas hasta el nivel promoviendo el uso de oraciones
                completas para expresarse.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Practicar expresión oral corta y guiada en la plataforma de tareas con Coach Isabela, simulando
                intercambios sencillos.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Realizar prácticas cortas y constantes (5–10 minutos diarios), con acompañamiento de un adulto.
              </li>
            </ul>
          </td>
        </tr>`;
    } else if (syllabusVal.includes("Kids")) {
        condicionadoText = ` <tr>
          <td
            style="  color: #126064;  text-align: left;  padding: 0.9rem 0.5rem 0rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">

            <span style="color: #E87373; font-weight: bold; margin-right: 5px;">&#9888;</span> Condicionado/a:
          </td>
        </tr>
        <tr>
          <td
            style="  color: #126064;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
              El estudiante <b>avanza al siguiente nivel de manera condicionada</b>. Demuestra conocimientos del nivel,
              pero
              <b> necesita reforzar algunas áreas para comunicarse con mayor claridad y seguridad</b>.<br><br>
<b>Recomendaciones:</b>
            <ul>
              <li style=" padding: 0 0 0.5rem">
                Practicar respuestas orales completas (sujeto + verbo + complemento), evitando respuestas muy cortas.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Reforzar el uso correcto de los tiempos verbales trabajados en el nivel.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Practicar conversaciones guiadas en la plataforma de tareas con Coach Isabela, enfocadas en rutinas,
                experiencias y opiniones.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Utilizar conectores básicos como and, because, but para ampliar sus respuestas.
              </li>
            </ul>
          </td>
        </tr>
`;
    } else if (syllabusVal.includes("Teens")) {
        condicionadoText = ` <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            <span style="color: #E87373; font-weight: bold; margin-right: 5px;">&#9888;</span>
            Condicionado/a:
          </td>
        </tr>
        <tr>
          <td
            style="  color: #126064;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
              El estudiante <b>avanza al siguiente nivel de manera condicionada</b>. Cuenta con el nivel esperado, pero
              <b>requiere fortalecer la fluidez, la precisión gramatical y la organización de ideas al comunicarse</b>.<br><br>
              <b>Recomendaciones:</b>
            <ul>
              <li style=" padding: 0 0 0.5rem">
                Practicar expresión oral utilizando ideas completas y organizadas, no frases aisladas.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Reforzar estructuras gramaticales clave del nivel (tiempos verbales, opiniones y situaciones
                hipotéticas).
              </li>
              <li style=" padding: 0 0 0.5rem">
                Simular conversaciones tipo evaluación en la plataforma de tareas con Coach Isabela para ganar fluidez y
                confianza.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Justificar opiniones usando expresiones como I think… because… o In my opinion….
              </li>
            </ul>
          </td>
        </tr>
      `;
    } else if (syllabusVal.includes("Adults")) {
        if (syllabusVal.includes("Masters")) {
            condicionadoText = `

        <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            <span style="color: #E87373; font-weight: bold; margin-right: 5px;">&#9888;</span>
            Condicionado/a:
          </td>
        </tr>
        <tr>
          <td
            style="  color: #126064;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
              Avanzas al siguiente nivel de <b>manera condicionada</b>. Cuentas con una base funcional del idioma; sin
              embargo,
              <b>es necesario reforzar algunas áreas clave para desempeñarte de forma más consistente y alineada</b> con
              los
              descriptores esperados de un nivel B1–B2.<br><br>
              <b>Recomendaciones:</b>
            <ul>
              <li style=" padding: 0 0 0.5rem">Reforzar el uso preciso de tiempos verbales intermedios (Past Simple vs.
                Present Perfect, Future forms), aplicándolos en contextos reales.
              </li>
              <li style=" padding: 0 0 0.5rem">Desarrollar respuestas orales más completas y estructuradas, incorporando
                justificación de ideas y ejemplos.
              </li>
              <li style=" padding: 0 0 0.5rem">Practicar conversaciones tipo evaluación en la plataforma de tareas con
                la inteligencia artificial Coach Isabela, enfocadas en opiniones, experiencias y situaciones
                hipotéticas.
              </li>
              <li style=" padding: 0 0 0.5rem">Mantener una práctica constante y autónoma (15–20 minutos diarios) para
                fortalecer fluidez, coherencia y seguridad al comunicarse.
              </li>
            </ul><br><br>
              Con este refuerzo, podrás fortalecer tu base comunicativa y avanzar con mayor seguridad en el siguiente
              nivel.
          </td>
        </tr>`;
        } else {
            condicionadoText = `    <tr>
          <td
            style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
            <span style="color: #E87373; font-weight: bold; margin-right: 5px;">&#9888;</span>
            Condicionado/a:
          </td>
        </tr>
        <tr>
          <td
            style="  color: #126064;  text-align: left;  padding: 0rem 0.5rem 0.9rem 10%; font-family: Segoe UI; font-size:14px; font-weight: 400; border-bottom: 1px dotted rgb(18, 96, 100, 0.2); ">
              Avanzas al siguiente nivel de <b>manera condicionada</b>. Cuentas con las bases mínimas necesarias para
              avanzar,
              sin embargo, <b>requieres reforzar </b>algunas áreas para comunicarte con mayor claridad, fluidez y
              precisión en
              situaciones cotidianas.<br><br>

            <b>Recomendaciones:</b>
            <ul>
              <li style=" padding: 0 0 0.5rem">
                Reforzar el uso de estructuras gramaticales, aplicándolos en oraciones completas y funcionales.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Ampliar respuestas orales, evitando frases muy cortas y desarrollando ideas con mayor claridad.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Practicar conversaciones guiadas en la plataforma de tareas con la inteligencia artificial Coach
                Isabela, enfocadas en rutinas, experiencias y planes cercanos.
              </li>
              <li style=" padding: 0 0 0.5rem">
                Realizar prácticas constantes (10–15 minutos diarios) para consolidar vocabulario y estructuras del
                nivel.
              </li>
            </ul><br><br>
              Con este refuerzo, podrás fortalecer tu base comunicativa y avanzar con mayor seguridad en el siguiente
              nivel.
          </td>
        </tr>

      `;
        }
    }
    
    // ====================================================
    // ================== EXIT: headers  ==================
    // ====================================================
// -- juniors--
    const header_pass_juniors = `
     <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">

    &#127881; ¡Felicidades, papás y mamás!
  </p>
  <!-- &#x1F31F; -->
  <p
    style="padding: 1rem 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">

    Hoy celebramos junto a ustedes un <b>logro muy especial</b><br><br>

Su hijo/a ha completado con éxito su curso de inglés, superando cada reto con
    <b>compromiso, entusiasmo y constancia.</b><br><br>

Durante este tiempo, ha demostrado un <b>crecimiento notable</b> en sus <b>habilidades lingüísticas</b>, ganando
    <b>seguridad y confianza</b> para comunicarse en inglés.<br><br>

&#x1F393; ¡Estamos <b>muy orgullosos de su esfuerzo y dedicación</b>!<br><br>
    &#x1F4E2; <b>Gran noticia:</b><br>

Su hijo/a ha alcanzado un <b>nivel básico alto de inglés (A2)</b>, lo que significa que puede
    <b>comprender conversaciones simples</b>, <b>participar en intercambios cortos</b> y
    <b>expresar ideas sobre su vida diaria e intereses</b> de forma clara y sencilla.<br><br>

&#x1F3AF; Este es un <b>paso firme hacia el dominio del idioma</b>, y sienta una <b>base sólida</b> para seguir avanzando
    hacia niveles más altos.

  </p>
</div>
    `;
    // u
    const header_fail_juniors = `

    <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">

    Queridos papás y mamás
  </p>
  <!-- &#x1F31F; -->
  <p
    style="padding: 1rem 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">


    Tu hijo/a ha mostrado compromiso y participación en cada etapa del
    aprendizaje del inglés. ¡Cada paso cuenta! &#10024;<br><br>
    En esta ocasión, su hijo/a
    <b>no logró aprobar la evaluación final del curso</b>, pero queremos
    reconocer el esfuerzo, la constancia y el compromiso que ha demostrado
    durante todo el programa. Cada intento es una oportunidad para
    aprender y avanzar.<br><br>
    &#x1F4D8; Con práctica constante y refuerzo en las áreas clave,
    estamos seguros de que podrá superar este reto y alcanzar su meta. <br><br>
    &#x1F504;<b> Siguientes pasos:</b>
    Su hijo/a será asignado/a nuevamente al mismo nivel para reforzar los
    contenidos y habilidades que necesitan fortalecerse. Durante este
    periodo, trabajará en las áreas clave y en <b>8 semanas</b>, será
    evaluado/a nuevamente para medir su progreso y confirmar que está
    listo/a para avanzar.<br><br>
    &#x1F499;<b> Mensaje final:</b>
    Con apoyo en casa y dedicación en el estudio, estamos seguros de que
    muy pronto celebraremos juntos el logro de aprobar este curso.

  </p>
</div>
    `;
    
    // ---Kids and teens---
    
    const header_pass_kids_teens = `
    <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">
    &#127881; ¡Felicidades, papás y mamás!</p>
  <!-- &#x1F31F; -->
  <p
    style="padding: 1rem 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">
    Hoy celebramos juntos un <b>logro extraordinario</b><br /><br />
    Su hijo/a ha completado con éxito su curso de inglés,
    superando cada reto con
    <b>dedicación, alegría y una constancia admirable.</b>
    Durante este tiempo, no solo adquirió nuevas habilidades lingüísticas,
    sino que también desarrolló
    <b>confianza, disciplina y una mentalidad de superación</b> que le
    acompañará toda la vida.<br /><br />
    Este avance es fruto de su esfuerzo, del acompañamiento de ustedes y
    del compromiso de todo nuestro equipo English4kids.<br /><br />
     ¡Gracias por ser
    parte activa de este viaje y por inspirar a su pequeño/a a alcanzar la
    meta!
    <b><br><br />
    &#127775; Hoy, más que un curso terminado, celebramos el inicio de
    un futuro lleno de oportunidades.</b>
  </p>
</div>
      `;
      const header_fail_kids_teens = `
 <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">

    &#127919; Queremos reconocer la dedicación y el esfuerzo
  </p>
  <!-- &#x1F31F; -->
  <p
    style="padding: 1rem 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">
    Tu hijo/a ha mostrado compromiso y participación en cada etapa del
    aprendizaje del inglés. ¡Cada paso cuenta! &#10024;<br><br>
    En esta evaluación final,
    <b
    >aún no se ha alcanzado el nivel de dominio necesario para cerrar el
    curso satisfactoriamente</b>. Esto significa que algunas habilidades clave todavía están en proceso
    de fortalecimiento.
  </p>
</div>
    `;
    // ---ADULTS---
     const header_pass_adults = `
      <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">

    &#127881; ¡Felicidades!
  </p>
  <!-- &#x1F31F; -->
  <p
    style="padding: 1rem 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">
    Hoy celebramos contigo un <b>logro extraordinario</b>.<br><br>

Has completado con éxito tu curso de inglés, superando cada reto con
    <b>dedicación, constancia y una admirable voluntad de aprendizaje</b>.
    &#127942;&#10024;<br><br>

Durante este tiempo, no solo has fortalecido tus <b>habilidades lingüísticas</b> para desenvolverte en situaciones
    cotidianas con mayor <b>seguridad y fluidez</b>, sino que también has desarrollado
    <b>confianza, disciplina y una mentalidad de superación</b> que te acompañará en cada meta que te propongas.<br><br>

&#127775; Este avance es fruto de tu <b>esfuerzo</b>, de tu <b>compromiso</b> y de la
    <b>determinación de seguir creciendo</b>.
    Hoy no solo celebramos un curso terminado, sino el inicio de un <b>futuro lleno de nuevas oportunidades</b> para
    comunicarte, conectar y alcanzar tus sueños.

  </p>
</div>
`;
    const header_fail_adults = `
   <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">

    Reconocemos tu esfuerzo y tu participación
  </p>
  <!-- &#x1F31F; -->
  <p
    style="padding: 1rem 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">
    Cada paso que das en tu aprendizaje del inglés suma y te acerca
    más a tu meta. <br><br>
    En esta evaluación final, <b
    >aún no se ha alcanzado el nivel de dominio necesario para cerrar el
    curso satisfactoriamente</b>. Esto indica que algunas habilidades clave siguen en proceso de
    desarrollo.
  </p>
</div>
`;
    
    // ====================================================
    // ================== EXIT: CEFR  ==================
    // ====================================================
    // ------------ fed from: function setCEFRInfo(syllabusVal) ---------------
const cefr = setCEFRInfo(syllabusVal);
    
    // KIDS AND TEENS PASSED CEFR
    
    const resultado_global_pass_kids_teens = `
    <div style="padding: 0 1rem; text-align: center;">

  <p
    style="padding: 0 1rem 0; font-size:26px; text-decoration: none; font-family: Segoe UI; color: #14767B; font-weight: 700; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0;">
    ¡Un gran paso hacia el dominio del idioma!
  </p>

  <p style="font-size: 18px; font-weight: 600; font-family:  Segoe UI, Roboto; color: #14767B; padding: 1.5rem 0;">
    Tu hijo/a ha alcanzado un nivel
    ${cefr.finalCEFR} de inglés<br>
    <span style="font-size: 13px; font-weight: 400; color: #497275;">Según el Marco Común Europeo (CEFR)</span>
  </p>

  <p style="font-size:15px; font-weight: 400; padding: 0 1rem 0; color: #497275; font-family: Segoe UI;">
    Estamos seguros de que este logro abrirá
    muchas puertas para su futuro.
  </p>
</div>


<div class="desempeño"
  style="margin: 3rem 1rem; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
  <table width="80%" align="center" cellspacing="0" style="width: 80%; overflow: hidden;" width="80%">
    <thead>
      <tr>
        <th
          style="font-size: 22px; font-family:  Segoe UI, Roboto; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
          align="center">
          Esto significa que es capaz de: </th>
      </tr>
    </thead>
    <tbody>
     ${cefr.descripcionCEFR}
    </tbody>
  </table>
</div>
    `;



    const semanas4kidsteens = syllabusVal.includes("Masters") ? 4 : 8;
    const resultado_global_fail_kids_teens = `
   <div class="resultado-global" style="padding: 0 1rem; text-align: center;">

  <p
    style="padding: 0 1rem 0; font-size:26px; text-decoration: none; font-family: Segoe UI; color: #14767B; font-weight: 700; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0; ">
    Siguientes Pasos
  </p>

  <p style="font-size: 18px; font-weight: 600; font-family:  Segoe UI, Roboto; color: #14767B; padding: 1.5rem 0 0; ">
    No te desanimes:<br>
    <span style="font-size: 14px; font-weight: 400; color: #497275;">tu hijo/a tendrá una segunda oportunidad en
          <b>${semanas4kidsteens} semanas</b>. </span>
  </p>

  <p style="font-size:14px; font-weight: 400; padding: 0 1rem 0; color: #497275; font-family: Segoe UI;">
    Será asignado/a nuevamente al mismo nivel,
    lo que le permitirá
    <b
    >repasar los contenidos, reforzar áreas clave y prepararse
    de la mejor manera </b>para aprobar en la próxima evaluación.
  </p>
</div>
<div class="desempeño"
  style="margin: 3rem 1rem; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
  <table width="80%" align="center" cellspacing="0" style="width: 80%; overflow: hidden;" width="80%">
    <thead>
      <tr>
        <th 
          style="font-size: 18px; font-family:  Segoe UI, Roboto; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
          align="center">
          Nivel actual: </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td
          style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px;text-align: left; font-weight: 400; ">
          Según el Marco Común Europeo de Referencia para las Lenguas
          (CEFR), tu hijo/a aún no alcanza el nivel ${cefr.finalCEFR}.<br><br>
          Actualmente se encuentra en un nivel ${cefr.failedCEFR}  y
          necesita reforzar estructuras clave, comprensión auditiva y
          expresión oral fluida para avanzar al siguiente nivel.
        </td>
      </tr>
    </tbody>
  </table>

  <p
    style="font-size:15px; font-weight: 500; padding: 2rem 1rem 0; color: #497275; font-family: Segoe UI; text-align:center;">
    Gracias por acompañar este proceso. Con práctica constante y
    apoyo familiar, ¡estamos seguros de que muy pronto alcanzará
    el siguiente nivel!
  </p>
</div>
`;
    const resultado_global_fail_adults = `
    <div class="resultado-global" style="padding: 0 1rem; text-align: center;">

  <p
    style="padding: 0 1rem 0; font-size:26px; text-decoration: none; font-family: Segoe UI; color: #14767B; font-weight: 700; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0; ">
    Siguientes Pasos
  </p>

  <p style="font-size: 18px; font-weight: 600; font-family:  Segoe UI, Roboto; color: #14767B; padding: 1.5rem 0 0; ">
    No te desanimes:<br>
    <span style="font-size: 15px; font-weight: 400; color: #497275;">tendrás una segunda oportunidad en
          <b>4 semanas</b> mientras repites el nivel.</span>
  </p>

  <p style="font-size:15px; font-weight: 400; padding: 0 1rem 0; color: #497275; font-family: Segoe UI;">
    Esto te permitirá
    repasar los contenidos, reforzar áreas específicas y llegar
    con más seguridad a tu próxima evaluación.

  </p>
  <p style="font-size:15px; font-weight: 500; padding: 1rem; color: #497275; font-family: Segoe UI; text-align:center;">

    Este resultado <b>no marca el final del camino</b>, sino una
    nueva oportunidad para avanzar. Con tu constancia y
    dedicación, estamos seguros de que muy pronto alcanzarás la
    meta.
  </p>
</div>`;
    // upd
    const resultado_global_pass_adults = `
    <div class="resultado-global" style="padding: 0 1rem; text-align: center;">

  <p
    style="padding: 0 1rem 0; font-size:26px; text-decoration: none; font-family: Segoe UI; color: #14767B; font-weight: 700; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0;">
    ¡Un gran paso hacia el dominio del idioma!
  </p>

  <p style="font-size: 18px; font-weight: 600; font-family:  Segoe UI, Roboto; color: #14767B; padding: 1.5rem 0;">
    Has alcanzado un nivel
    ${cefr.finalCEFR} de inglés<br>
    <span style="font-size: 13px; font-weight: 400; color: #497275;">Según el Marco Común Europeo (CEFR)</span>
  </p>

  <p style="font-size:15px; font-weight: 400; padding: 0 1rem 0; color: #497275; font-family: Segoe UI;">
    Estamos seguros de que este logro abrirá muchas puertas para tu futuro.


  </p>
</div>
<div class="desempeño"
  style="margin: 3rem 1rem; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
  <table width="80%" align="center" cellspacing="0" style="width: 80%; overflow: hidden;" width="80%">
    <thead>
      <tr>
        <th
          style="font-size: 22px; font-family:  Segoe UI, Roboto; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
          align="center">
          Esto significa que puedes: </th>
      </tr>
    </thead>
    <tbody>
     ${cefr.descripcionCEFR}
    </tbody>
  </table>

  <p style="font-size:15px; font-weight: 500; padding: 0 1rem 0; color: #497275; font-family: Segoe UI;">
    ¡Te animamos a seguir practicando para avanzar al siguiente nivel!
  </p>
</div>`;

    // ---NORMAL EVALUATIONS---
    let chosenSyllabus = syllabusLower.includes("adults") ? "English4Adults" : "English4Kids";
    let welcomeApproach = syllabusLower.includes("adults") ? "tu aprendizaje" : "el aprendizaje de tu hijo/a";
    const normal_pass_header = `
      <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">
    ¡Te saludamos de ${chosenSyllabus}!</p>
  <!-- &#x1F31F; -->
     <p
        style="padding: 0 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">
        Gracias por confiar en nosotros para acompañar ${welcomeApproach}.
      </p>
         <p style="font-family: Segoe UI; font-size: 15px; font-weight: 400; color: #1C5457; margin: 1.5rem auto;">A
        continuación, te compartimos los resultados de la evaluación.</p>
</div>
      `;
    const normal_fail_header = `
       <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
  <p
    style="padding: 0 1rem; font-size:22px; font-weight: 700; color: #14767B; font-family: Segoe UI; margin: 0.5rem 0;">
    ¡Te saludamos de ${chosenSyllabus}!</p>
  <!-- &#x1F31F; -->
    <p
        style="padding: 0 1rem; font-size: 1rem; font-weight: 400; color: #1C5457; margin-top: 0;padding-bottom: 0.5rem; font-family: Segoe UI;">
        Gracias por confiar en nosotros para acompañar ${welcomeApproach}.
      </p>
          <p style="font-family: Segoe UI; font-size: 15px; font-weight: 400; color: #1C5457; margin: 1.5rem auto;">A
        continuación, te compartimos los resultados de la evaluación.</p>
</div>
    `;
    // Class Paths
    // Helper
    const includesAny = (text, arr) => arr.some( (item) => text.includes(item.toLowerCase()));

    // Mapping centralizado
    const classGroups = [{
        match: ["kids (super intensivo) 8-12", "teens 13-17 (3hrs/week)"],
        B: "SI_0-10",
        S: "0-10",
    }, {
        match: ["kids (intensivo) 8-12", "teens 13-17 (3hrs/week)"],
        B: "I_0-10",
        S: "0-10",
    }, {
        match: ["juniors 5-7"],
        B: "J_1-10",
        S: "1-10",
    }, {
        match: ["kids masters", "kids masters 2", "teens masters", "teens masters 2", ],
        B: "M_1-10",
        S: "1-10",
    }, {
        match: ["adults (5hrs/week)", "adults masters (5hrs/week)"],
        B: "A5_1-10",
        S: "1-10",
    }, {
        match: ["adults (3hrs/week)", "adults masters (3hrs/week)"],
        B: "A3_1-12",
        S: "1-12",
    }, ];

    let SclassPathLvl = null;
    let BclassPathLvl = null;


    for (const group of classGroups) {
        if (includesAny(syllabusLower, group.match)) {
            BclassPathLvl = group.B;
            SclassPathLvl = group.S;
            break;
        }
    }

    // Final URLs
    const S_ClassPath = `https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Class%20Paths/S-CP_${SclassPathLvl}_A${levelVal}.png`;

    const B_ClassPath = `https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Class%20Paths/B-CP_${BclassPathLvl}_A${levelVal}.png`;

    // --- RESULTADO GLOBAL
    // upd removed:   <img src="${S_ClassPath}" style="width:80%; margin-bottom: 1rem;">
    let resultado_global_pass_normal = `
    <div class="resultado-global" style="padding: 0 1rem; text-align: center;">

  <p
    style="font-weight: 600; font-family: Segoe UI; font-size: 15px; color: #497275; margin: 0 0 0.5rem 0; padding: 0 1rem;">
      Programa: ${syllabusVal} |  Nivel Evaluado: Nivel ${levelVal}
  </p>

  <p
    style="padding: 0 1rem 0; font-size:26px; text-decoration: none; font-family: Segoe UI; color: #14767B; font-weight: 700; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0;">
    Evaluación Aprobada
  </p>

  <p class="h3"
    style="font-size: 18px; font-weight: 600; font-family:  Segoe UI, Roboto; color: #14767B; padding: 1.5rem 0;">
    &#127881;¡Felicidades!&#127881; <br>
        Se está avanzando a un excelente ritmo.
  </p>

  <p style="font-size:15px; font-weight: 400; padding: 0 1rem 0; color: #497275; font-family: Segoe UI;">
    A continuación un informe detallado de la evaluación:
  </p>
</div>
  `;
    // upd removed:  <img src="${S_ClassPath}" style="width:80%; margin-bottom: 1rem;">
    let resultado_global_fail_normal = ` 
  <div class="resultado-global" style="padding: 0 1rem; text-align: center;">
 
  <p
    style="font-weight: 600; font-family: Segoe UI; font-size: 15px; color: #497275; margin: 0 0 0.5rem 0; padding: 0 1rem;">
      Programa: ${syllabusVal} |  Nivel Evaluado: Nivel ${levelVal}
  </p>
                                                                                                                                                                                                                                                                                                                                                                                                                                            
  
        <p
          style="padding: 0 1rem 0; font-size:26px; text-decoration: none; font-family: Segoe UI; color: #14767B; font-weight: 700; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 3rem auto 0rem;">
         Resultado:<br> Objetivo del nivel aún no alcanzado

        </p>

 <p class="h3"
          style="font-size: 15px; font-weight: 600; font-family:  Segoe UI, Roboto; color: #14767B; padding: 1.5rem 20%;">
          Seguiremos acompañando su proceso para fortalecer las habilidades necesarias de este nivel.
        </p>

  <p style="font-size:15px; font-weight: 400; padding: 0 1rem 0; color: #497275; font-family: Segoe UI;">
    A continuación un informe detallado de la evaluación:
  </p>
</div>
`;
    // upd removed: <img src="${S_ClassPath}" style="width:80%; margin-bottom: 1rem;">
    let resultadoGlobalDiagEval = `
<div class="resultado-global" style="padding: 0 1rem; text-align: center;">
          
          <p
            style="font-weight: 500; font-family: Segoe UI; font-size: 14px; color: #497275; margin: 0 0 0.5rem 0; padding: 0 1rem;">

    ${syllabusVal} | Nivel ${levelVal}
          </p>


          <p
            style="padding: 1rem 1rem; font-size:26px; text-decoration: none; font-family: Segoe UI; color: #14767B; font-weight: 700; margin: 0;">
            Evaluación Diagnóstica
          </p>
          <div style="margin: 1rem auto 2rem; justify-items: center;">
            <table width="80%" align="center" cellspacing="0" width="80%" align="center" cellspacing="0" cellpadding="0"
              style="width: 80%; border-collapse: collapse; border-radius: 25px; border: none; overflow: hidden; margin: 0; background-color: #f9fafb; table-layout:fixed;">
              <tr>
                <td
                  style="font-size: 15px; font-family: Segoe UI;  padding: 1rem 2rem; font-weight: 500; color: #497275; text-align: center;"
                  align="center">
                  Esta evaluación es diagnóstica, su propósito es medir avances, identificar fortalezas actuales y
                  definir
                  áreas a reforzar para continuar acompañando el aprendizaje de tu hijo/a de forma efectiva.
                </td>
              </tr>
            </table>
          </div>
          <p style="font-size:14px; font-weight: 400; padding: 0 10% 0; color: #497275; font-family: Segoe UI;">
            A continuación, compartimos el reporte de evaluación diagnóstica realizada en el <b>Nivel ${levelVal}</b> del curso
            <b>${syllabusVal}</b>.
          </p>

        </div>`;
    // ---------- SHOW NOTA FINAL for Exit (only if not juniors) ----------
    let detalleNotaHTML = "";
    if (isExit && !syllabusLower.startsWith("juniors")) {
        const g = safe(grammarScore) || "-";
        const o = safe(oralScore) || "-";
        const f = safe(finalDisplay) || "-";

        detalleNotaHTML = `<div class="desempeño"
  style="margin: 3rem 1rem; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
  <table width="80%" align="center" cellspacing="0" style="width: 80%; overflow: hidden;" width="80%">
    <thead>
      <tr>
        <th 
          style="font-size: 22px; font-family:  Segoe UI, Roboto; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
          align="center">Detalles de la nota</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td
          style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px;text-align: left; font-weight: 400; ">

          <b>Resultado Prueba Gramática:</b> ${g}/10<br />
          <em style="font-size: 0.8rem">&emsp;&emsp;(equivale a 40% de la nota final)</em>
        </td>
      </tr>
      <tr>
        <td
          style="font-size: 15px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 20px;text-align: left; font-weight: 400; ">
          <b>Resultado Prueba Oral:</b> ${o}/10<br />
          <em style="font-size: 0.8rem">&emsp;&emsp;(equivale a 60% de la nota final)</em>
        </td>
      </tr>
      <tr>
        <td
          style="font-size: 16px; font-family: Segoe UI; color: #1C5457; padding: 10px 10px 10px 5%;text-align: left; font-weight: 400; border-top: 1px dotted #14767B;">
          &#10151; <b>Nota Global:</b> ${f}/10
        </td>
      </tr>
    </tbody>
  </table>
</div>
    `;
    }

    let welcomeHTML = "";
    let resultadoGlobal = "";


    if (isDiagnosticEval(syllabusVal, levelVal)) {
        resultadoGlobal = resultadoGlobalDiagEval;
    } else if (isExit) {

        const passedExit = finalDisplay !== "" && !Number.isNaN(Number(finalDisplay)) && Number(finalDisplay) >= 7;

        if (syllabusLower.includes("kids") || syllabusLower.includes("teens")) {
            welcomeHTML = passedExit ? header_pass_kids_teens : header_fail_kids_teens;
            resultadoGlobal = passedExit ? resultado_global_pass_kids_teens : resultado_global_fail_kids_teens;
        } else if (syllabusLower.includes("adults")) {
            welcomeHTML = passedExit ? header_pass_adults : header_fail_adults;
            resultadoGlobal = passedExit ? resultado_global_pass_adults : resultado_global_fail_adults;
        } else if (syllabusLower.startsWith("juniors") && levelVal === 10 && weekVal === 7) {
            // normal
            welcomeHTML = Number.isFinite(totalScore) && totalScore >= 7 ? header_pass_juniors : header_fail_juniors;
            resultadoGlobal = passedExit ? resultado_global_pass_kids_teens : resultado_global_fail_kids_teens;
        } else {
            welcomeHTML = passedExit ? `` : ``;
        }
    } else {
        welcomeHTML = Number.isFinite(totalScore) && totalScore < 7 ? normal_fail_header : normal_pass_header;
        resultadoGlobal = Number.isFinite(totalScore) && totalScore < 7 ? resultado_global_fail_normal : resultado_global_pass_normal;
    }

    //--extra sections
    let porqueEsImportante = ``;
    if (totalScore < 7) {
        // REPROBADO
        // upd
        porqueEsImportante = `  <!-- PORQUE ES IMPORTANTE -->
<div style="margin: 4rem auto; justify-items: center;">
  <table width="80%" align="center" cellspacing="0" cellpadding="0"
    style="width: 80%; border-collapse: collapse; border-radius: 25px; border: none; overflow: hidden; margin: 0 auto; background-color: #f9fafb; table-layout:fixed;">
    <tr>
      <th
        style="font-weight: 700; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 22px; padding: 1rem; color: #14767B; border: none; font-family: Segoe UI;"
        align="center">
        <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 35px; margin-right: 0.2rem"></span>
        ¿Por qué es importante reconocer los avances?
      </th>
    </tr>
    <tr>
      <td
        style="font-size: 15px; font-family: Segoe UI;  padding: 0 15% 1rem; font-weight: 400; color: #497275; text-align: center;"
        align="center">

          Porque <b>cada progreso cuenta</b>. Identificar lo que ya se domina <b>fortalece la confianza</b> y nos
          permite
          <b>enfocar</b> con
          claridad los <b>próximos pasos</b> para seguir avanzando.

      </td>
    </tr>
  </table>
</div>`;
    } else {
        // upd
        porqueEsImportante = `<!-- PORQUE ES IMPORTANTE -->
  <div style="margin: 4rem auto; justify-items: center;">
    <table width="80%" align="center" cellspacing="0" cellpadding="0"
      style="border: none; background-color: #f9fafb; margin: auto; width:80%;">
      <tr>
        <th
          style="font-weight: 700; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 22px; padding: 1rem; color: #14767B; border: none; font-family: Segoe UI;"
          align="center">
          <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 35px; margin-right: 0.2rem"></span>
          ¿Por qué es clave saber los logros?
        </th>
      </tr>
      <tr>
        <td
          style="font-size: 15px; font-family: Segoe UI;  padding: 0 15% 1rem; font-weight: 400; color: #497275; text-align: center;"
          align="center">
          Te permite <b>ver el progreso</b>, <b>celebrar cada avance</b> y
            <b>acompañar el aprendizaje</b> con determinación.
          <br><br>
          Cada paso <b>refuerza la confianza</b> y prepara para
            <b>comunicarse con seguridad</b> y <b>pensar en grande</b>.

        </td>
      </tr>
    </table>
  </div>`;
    }
    // both upd
    let tuEsfuerzoCuenta = ``;
    tuEsfuerzoCuenta += syllabusLower.includes("adults") ? `<!-- TU ESFUERZO CUENTA -->
<div style="margin: 4rem auto; justify-items: center;">
  <table width="80%" align="center" cellspacing="0" cellpadding="0"
    style="width: 80%; border-collapse: collapse; border-radius: 25px; border: none; overflow: hidden; margin: 0 auto; background-color: #f9fafb;  table-layout:fixed;">
    <tr>
      <th
        style="font-weight: 700; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 22px; padding: 1rem; color: #14767B; border: none; font-family: Segoe UI;"
        align="center">
        &#10024; ¡Tu esfuerzo cuenta! &#10024;
      </th>
    </tr>
    <tr>
      <td
        style="font-size: 14px; font-family: Segoe UI; padding: 0 15%; font-weight: 400; color: #1C5457; text-align: center;"
        align="center">
          Cada mes estás <b>avanzando más</b> y estamos
          <b>muy orgullosos de tu progreso</b>.
          Queremos que
          <b>aprendas inglés con confianza y entusiasmo</b>, dando un <b>paso firme en cada clase</b>.
      </td>
    </tr>
  </table>
</div>` : `<!-- TU ESFUERZO CUENTA -->
<div style="margin: 4rem auto; justify-items: center;">
  <table width="80%" align="center" cellspacing="0" cellpadding="0"
    style="width: 80%; border-collapse: collapse; border-radius: 25px; border: none; overflow: hidden; margin: 0; background-color: #f9fafb;  table-layout:fixed;">
    <tr>
      <th
        style="font-weight: 700; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 22px; padding: 1rem; color: #14767B; border: none; font-family: Segoe UI;"
        align="center">
        &#10024; ¡Tu esfuerzo cuenta! &#10024;
      </th>
    </tr>
    <tr>
      <td
        style="font-size: 14px; font-family: Segoe UI; padding: 0 15% 1rem; font-weight: 400; color: #1C5457; text-align: center;"
        align="center">
          Cada mes tu hijo/a <b>avanza más</b> y estamos
          <b>muy orgullosos de su progreso</b>.
          Queremos que
          <b>aprenda inglés con confianza y entusiasmo</b>, dando un <b>paso firme en cada clase</b>.
      </td>
    </tr>
  </table>
</div>
    `;

    if (totalScore < 7) {
        tuEsfuerzoCuenta = ``;
    }

    // ---------- build topics & opportunities HTML ----------
    // upd
    let dominatedHTML = approvedTopics.length ? `
    <!-- TEMAS DOMINADOS -->
    <div style="margin: 3rem 0; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
  <table width="80%" align="center" cellspacing="0" style="width: 80%; margin: auto;" width="80%">
    <thead>
      <tr>
        <th
          style="font-size: 22px; font-family:  Segoe UI, Roboto; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
          align="center"> Temas Dominados </th>
      </tr> 
      ${isDiagnosticEval(syllabusVal, levelVal) ? `<tr>
          <th
            style="font-family: Segoe UI;  text-align: center; padding: 0.5rem 5% 1rem; font-size: 16px; font-weight: 500; color: #497275;"
            align="left">
            Durante el curso, el estudiante ha desarrollado conocimientos y habilidades en los
            siguientes
            temas:
          </th>
        </tr>` : ""}
        </thead>
    <tbody>
        ${approvedTopics.map( (topic) => {
        const topicKey = topic.toLowerCase();


        const matchedKey = Object.keys(topicBreakdown).find( (k) => k.toLowerCase() === topicKey, );

        const topicDescription = matchedKey ? topicBreakdown[matchedKey] : "";

        return `
                 <tr>
        <td
          style="font-family: Segoe UI;  text-align: left; padding: 1rem 0 0.2rem 5%; font-size: 15px; font-weight: 600; color: #1C5457;"
          align="left">
          <span style="font-weight: bold; margin-right: 5px;"> &#10004;</span>${safe(topic)}
        </td>
      </tr>
      <tr>
        <td
          style="font-family: Segoe UI; font-weight: 400; text-align: left; padding: 0.3rem 0 1rem 13%;  color: #275B60; font-size: 14px"
          align="left">
          ${topicDescription}
        </td>
      </tr>
              `;
    }
    ).join("")}
        </tbody>
      </table>
    </div>
      ${isDiagnosticEval(syllabusVal, levelVal) ? `
      <div style="margin: 4rem auto; justify-items: center;">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 25px; border: none; overflow: hidden; margin: 0; background-color: #F5FAFA; table-layout:fixed;">
          <tr>
            <th
              style="font-weight: 700; border-bottom: 1px dotted #219fa6; text-align: right; font-size: 22px; padding: 1rem; color: #14767B; border: none; font-family: Segoe UI; width: 60px"
              align="center">
              <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 35px; margin-right: 0.2rem"></span>

            </th>
            <td
              style="font-size: 15px; font-family: Segoe UI;  padding: 1rem 1rem 1rem 0; font-weight: 500; color: #497275; text-align: left;"
              align="center">Estos resultados reflejan el estado actual del aprendizaje y nos ayudan a guiar los
                siguientes
                pasos.
            </td>
          </tr>
        </table>
      </div>` : `${porqueEsImportante}`}

    ` : "";
    // upd
    const reinforceHTML = reinforceTopics.length ? ` <!--temas a reforzar-->
  <div style="margin: 4rem auto; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
    <table width="80%" align="center" cellspacing="0" style="width: 80%; overflow: hidden;" width="80%">
      <thead>
        <tr>
          <th
            style="font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
            align="center">
            Temas que aún necesita reforzar </th>
        </tr>
      </thead>
      <tbody>
          ${reinforceTopics.map( (topic) => {
        const topicKey = topic.toLowerCase();


        const matchedKey = Object.keys(topicBreakdown).find( (k) => k.toLowerCase() === topicKey, );

        const topicDescription = matchedKey ? topicBreakdown[matchedKey] : "";

        return ` <tr>
          <td
            style="font-family: Segoe UI;  text-align: left; padding: 1rem 0 0.2rem 5%; font-size: 15px; font-weight: 600; color: #1C5457;"
            align="left">
            <span style="font-weight: bold; margin-right: 5px;"> &#9744;</span> ${safe(topic)}</td>
        </tr>
        <tr>
          <td
            style="font-family: Segoe UI; font-weight: 400; text-align: left; padding: 0.3rem 0 1rem 13%;  color: #1C5457; font-size: 14px;"
            align="left">${topicDescription}</td>
                      </tr>`;
    }
    ).join("")}
        </tbody>
      </table>
    </div>` : "";


    let opportunityHTML = "";

    if (isDiagnosticEval(syllabusVal, levelVal)) {

        const diagAOIs = [{
            checkboxLabel: "Construcción de oraciones completas",
            title: "Construcción de oraciones completas",
            desc: "Reforzar el uso de frases con sujeto + verbo + complemento para expresar ideas con mayor claridad.",
        }, {
            checkboxLabel: "Fluidez al responder preguntas",
            title: "Fluidez al responder preguntas",
            desc: "Desarrollar mayor continuidad al hablar, reduciendo pausas largas y ganando seguridad al responder.",
        }, {
            checkboxLabel: "Uso de vocab en nuevos contextos",
            title: "Uso del vocabulario aprendido en nuevos contextos",
            desc: "Aplicar palabras conocidas en diferentes situaciones y preguntas, no solo en ejemplos memorizados.",
        }, {
            checkboxLabel: "Uso correcto del presente simple",
            title: "Uso correcto del presente simple",
            desc: "Fortalecer la estructura del presente simple, especialmente en la tercera persona (he / she).",
        }, {
            checkboxLabel: "Pronunciación de palabras frecuentes",
            title: "Pronunciación de palabras frecuentes",
            desc: "Mejorar la claridad al pronunciar palabras de uso común para facilitar la comprensión.",
        }, {
            checkboxLabel: "Comprensión y seguimiento de preguntas",
            title: "Comprensión y seguimiento de preguntas",
            desc: "Reforzar la comprensión auditiva para responder de forma más precisa a lo que se pregunta.",
        }, ];


        const checkboxes = document.querySelectorAll('#optionsGroup input[type="checkbox"]', );
        const checkedHTML = [];

        checkboxes.forEach( (cb) => {
            if (cb.checked) {
                const labelText = cb.closest("label").textContent.trim();
                const match = diagAOIs.find( (o) => o.checkboxLabel === labelText);
                if (match) {
                    checkedHTML.push(`
        <tr>
          <td style="font-size:15px; font-family:Segoe UI; font-weight:600; color:#1C5457; padding:10px 10px 3px 5%; text-align:left; margin:0;">
            <span style="font-weight:400; margin-right:5px; color:#14767B; font-size:12px;">&#9745;</span>${match.title}
          </td>
        </tr>
        <tr>
          <td style="text-align:left; color:#1C5457; font-weight:400; padding:3px 10px 5px 15%; font-family:Segoe UI; font-size:14px; margin:0;">
            ${match.desc}
          </td>
        </tr>
      `);
                }
            }
        }
        );

        opportunityHTML = `
  <div style="margin:4rem auto; justify-items:center; background-color:rgba(252,250,250,0.1); border-radius:25px;">
    <table width="80%">
      <thead>
        <tr>
          <th style="font-size:22px; font-family:Segoe UI; font-weight:700; color:#14767B; text-align:center; padding:0.5rem; border-bottom:1px dotted #219fa6;">
            Áreas de Oportunidad
          </th>
        </tr>
        <tr>
          <th style="font-family:Segoe UI; text-align:center; padding:0.5rem 5% 1rem; font-size:16px; font-weight:500; color:#497275;" align="left">
            Estas áreas se trabajarán progresivamente en las siguientes clases.
          </th>
        </tr>
      </thead>
      <tbody>
        ${checkedHTML.join("")}
      </tbody>
    </table>
  </div>
`;
    } else {        opportunityHTML = opportunityTopics.length ? `
      <div style="margin:4rem auto; justify-items:center; background-color:rgba(252,250,250,0.1); border-radius:25px;">
        <table width="80%" align="center" cellspacing="0" width="80%">
          <thead>
            <tr>
              <th style="font-size:22px; font-family:Segoe UI; font-weight:700; color:#14767B; text-align:center; padding:0.5rem; border-bottom:1px dotted #219fa6;">
                Áreas de Oportunidad
              </th>
            </tr>
          </thead>
          <tbody>
            ${opportunityTopics.map( (o) => `
                <tr>
                  <td style="font-size:15px; font-family:Segoe UI; font-weight:400; color:#1C5457; padding:10px 10px 10px 5%; text-align:left;">
                    <b>Tema:</b> ${safe(o.title)}
                  </td>
                </tr>
                ${o.answer ? `<tr>
                  <td style="text-align:left; color:#1C5457; font-weight:400; padding:5px 10px 5px 15%; font-family:Segoe UI; font-size:14px;">
                    <span style="color:#E87373; font-weight:bold; margin-right:5px;">&#10006;</span>
                    Respuesta: ${safe(o.answer)}
                  </td>
                </tr>` : ""}
                ${o.correction ? `<tr>
                  <td style="text-align:left; color:#1C5457; font-weight:400; padding:5px 10px 5px 15%; font-family:Segoe UI; font-size:14px;">
                    <span style="color:#89C287; font-weight:bold; margin-right:5px;">&#10004;</span>
                    Corrección: ${safe(o.correction)}
                  </td>
                </tr>` : ""}
              `, ).join("")}
          </tbody>
        </table>
      </div>
      ${tuEsfuerzoCuenta}
    ` : "";
    }


    const pronunciationHTML = pronunciationMistakes ? `  <div style="margin: 4rem auto; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
    <table width="80%">
      <thead>
        <tr>
          <th
            style="font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;">
            Pronunciación a reforzar</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            style="font-family: Segoe UI; font-weight: 400; text-align: center; padding: 0.3rem 1rem 1rem;  color: #1C5457; font-size: 14px;"
            align="center">${safe(pronunciationMistakes)}</td>
        </tr>
      </tbody>
    </table>
  </div>` : "";

    // ---------- Extra areas for L10 Kids SI  ----------
    let kidsSIExtraAreas = "";

    if (syllabusVal === "Kids (Super Intensivo) 8-12" && levelVal === 10) {
        const extraAreas = document.querySelectorAll(".l10-generated");

        const validAreas = Array.from(extraAreas).filter(area => {
            const value = area.querySelector(".extraarea select")?.value?.trim();
            return value && value !== "No aplica";
        }
        );

        if (validAreas.length === 0) {
            kidsSIExtraAreas = "";
        } else {
            kidsSIExtraAreas = `<tr>
      <td
        style="color: #1C5457; text-align: left; padding: 1.1rem 0.5rem 0.3rem 5%; font-family: Segoe UI; font-size:16px; font-weight: 600;">
        &#x24D8; Habilidades Evaluadas:
      </td>
    </tr>` + validAreas.map(area => `
        <tr>
          <td
            style="color: #1C5457; text-align: left; padding: 0.5rem 0.5rem 0.4rem 10%; font-family: Segoe UI; font-size:15px; font-weight: 600;">
            <span style="font-size: 16px; margin-right: 5px; font-weight: 400;">&#9679;</span> 
            ${area.querySelector(".areasevaluation")?.textContent?.trim() || ""}
          </td>
        </tr>
        <tr>
          <td
            style="color: #497275; text-align: left; padding: 0rem 0.5rem 0.9rem 15%; font-family: Segoe UI; font-size: 14px; font-weight: 400;">
            ${area.querySelector(".extraarea select")?.value?.trim() || ""}
          </td>
        </tr>
      `).join("");
        }
    }

    // upd
    const selectorComments = areaDetails.join("");
    const commentsFinal = selectorComments || extraCommentsFallback || "";
    const commentsHTML = kidsSIExtraAreas || commentsFinal || isCondicionado ? `
        <div style="margin: 4rem auto; justify-items: center; background-color:rgba(252,250,250,0.1); border-radius: 25px;">
    <table width="80%" align="center" cellspacing="0" style="width:80%; ">
      <thead>
        <th
          style="font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;">
          Comentarios del evaluador </th>
        </tr>
      </thead>
      <tbody>
           ${commentsFinal || ""}
            ${kidsSIExtraAreas || ""}
            ${isCondicionado ? condicionadoText : ""}
          </tbody>
        </table>
      </div>` : "";
    // evaluator + survey + referidos

    const shouldHideEvaluator = evaluatorName && String(evaluatorName).startsWith("━");

    const surveyBaseFinal = syllabusLower.includes("adults") ? "https://e4cc.typeform.com/to/efJago3L#coach=" : "https://e4cc.typeform.com/to/ovOnAdWx#coach=";

    const surveyLinkFinal = surveyBaseFinal + encodeURIComponent(evaluatorID || "");
    // upd
    const evaluatorLine = shouldHideEvaluator ? "" : `

  <!-- EVALUATORS Referal -->
  <div style="margin: 4rem auto 0; padding: 0;">
    <div
      style="border-radius: 20px; padding: 2rem 1.5rem; width: 80%; margin: 0 auto;  background-color: rgba(216, 241, 244, 0.2); min-width: 300px; max-width: 1000px; text-align: center;">
      <p style="font-family: Segoe UI; color: #497275; padding: 0 2rem; font-size: 16px; font-weight: 700;">
        Tu
        evaluación fue realizada por</p>
      <p style="font-family: Segoe UI; color: #14767B; padding: 0 2rem; font-size: 22px; font-weight: 700;">
        ${safe(evaluatorName || "English4Kids")}</p>
      <p style="font-family: Segoe UI; color: #497275; padding: 0 2rem; font-size: 15px; font-weight: 700;">
        Gracias por tu tiempo y confianza.</p>
      <p style="font-family: Segoe UI; font-size: 14px; color: #1C5457; padding: auto 2rem;">
        Te invitamos a completar una breve encuesta de satisfacción para ayudarnos a seguir mejorando nuestro
        servicio.
      </p>
      <a href="${surveyLinkFinal}" target="_blank"
        style="text-decoration: none; font-family: Segoe UI; background-color: #14767B; padding: 0.6rem 1.3rem; border-radius: 12px; font-weight: 700; color: white; font-size: 22px; margin: 1rem auto; display: inline-block;">Evalúame
        aquí</a>
    </div> `;

    //referidos text- its alr no need to upd
    const referText = syllabusLower.includes("adults") ? ` <!-- referal -->

      <h1
        style="font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
        align="center">¡Has recibido un cupón de ahorro!</h1>
          <a href="https://www.english4kidsonline.com/amigo" target="_blank"
            style="display:inline-block; margin:0; text-decoration:none;">
            <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/referalAdults.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
          </a> ` : ` <!-- referal -->
        <h1
          style="font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
          align="center">¡Has recibido un cupón de ahorro!</h1>
          <a href="https://www.english4kidsonline.com/amigo" target="_blank"
            style="display:inline-block; margin:0; text-decoration:none;">
            <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/refKids.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
          </a>`;

    //===================================================
    // Coaching Opportunity in RC
    const checkedInputs = document.querySelectorAll(".coachingOpportunity input:checked", );

    const links = {
        futuroGoingTo: "https://view.genially.com/68ae362d32a8126030592eb7",
        pasadoProgresivo: "https://view.genially.com/68ace62d5a6838e7306b1395",
        presenteProgresivo: "https://view.genially.com/68ace5b12d712b8b4b642422",
    };

    const labels = {
        futuroGoingTo: "Futuro: Going to",
        pasadoProgresivo: "Pasado Progresivo",
        presenteProgresivo: "Presente Progresivo",
    };

    let coachingHTML = "";

    if (checkedInputs.length) {
        coachingHTML = `
    <div style="margin: 4rem auto; justify-items: center; border-radius: 25px; background-color:rgba(252,250,250,0.1);">
    <table width="100%" align="center" cellspacing="0" cellpadding="0" style="width: 80%; border-collapse: collapse;">
      <tr>
        <th
          style="border-bottom: none; font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6; "
          align="center">Condición para avanzar al siguiente nivel</th>
      </tr>
      <tr>
        <td
          style="  color: #1C5457;  text-align: left;  padding: 0.9rem 0.5rem 0 0.3rem; font-family: Segoe UI; font-size:16px; font-weight: 500;">
          &#x24D8; Deberás completar el test de certificación en un plazo máximo de <b>5 días</b>.
        </td>
      </tr>
      </thead>
      <tbody>`;

        checkedInputs.forEach( (input) => {
            const id = input.id;
            if (links[id]) {
                coachingHTML += `
        <tr>
          <td
            style="font-family: Segoe UI;  text-align: left; padding: 0.9rem 0.5rem 0 5%; font-size: 16px; font-weight: 400; color: #1C5457; margin:0;"
            align="left">
            Es necesario reforzar el tema de <b>${labels[id]}</b>.
          </td>
        </tr>
        <tr>
          <td
            style="font-family: Segoe UI;  text-align: left; padding: 0.5rem 0 20px 10%; font-size: 14px; font-weight: 400; color: white;"
            align="left">
            <a style="text-decoration: none; background-color: rgba(235, 242, 242, 0.5); padding: 5px 10px; border-radius: 8px; color: #275B60; margin: 0; display: inline-block;"
              href="${links[id]}" target="_blank" rel="noopener noreferrer">
              <span style="color: #14767B; font-weight: bold; margin-right: 5px; font-size: 18px;">&#9741;</span> Test
              de
              Certificación ${labels[id]}</a>
          </td>
        </tr>`;
            }
        }
        );

        coachingHTML += `
        </tbody>
      </table>
    </div>`;
    }

    //headers & footers
    // ---HEADERS & FOOTERS---

    // Adults vs Kids assets
    const adultsHeader = "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERADULTS.png";
    const adultsFooter = "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerAdults.png";

    const kidsHeader = "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERKIDS.png";
    const kidsFooter = "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerKids.png";
    const avanceMotivacionAdults = `  <!--avance -->
   <div style="margin: 4rem auto; justify-items: center; ">
    <table width="80%" align="center" cellspacing="0" cellpadding="0"
      style="width: 80%; border-collapse: collapse; border-radius: 25px; border: none; overflow: hidden; margin: 0; background-color: #f9fafb;  table-layout:fixed;">
      <tr>
        <th
          style="font-family: Segoe UI; font-weight: 700; text-align: center; font-size: 22px; padding: 1rem; color: #14767B; border-bottom: none;"
          align="center">&#128171;¡Estás avanzando
          increíblemente en tu camino al inglés!&#128171;
        </th>
      </tr>
      <tr>
        <td
          style="font-size: 14px; font-family: Segoe UI; padding: 0 15%; font-weight: 400; color: #1C5457; text-align: center;"
          align="center"><b>Has avanzado increíblemente</b>, y en el siguiente nivel fortalecerás tu confianza, usarás
            expresiones naturales y comprenderás conversaciones más fluidas.
         &#9733; <b>Nuestro objetivo:</b> que aprendas inglés con seguridad y entusiasmo, abriendote puertas a
            nuevas
            oportunidades.
        </td>
      </tr>
    </table>
  </div>`;
    const avanceMotivacionKids = ` <!--avance -->
    <div style="margin: 4rem auto; justify-items: center; ">
    <table width="80%" align="center" cellspacing="0" cellpadding="0"
      style="border: none;  background-color: #f9fafb;">
      <tr>
        <th
          style="font-family: Segoe UI; font-weight: 700; text-align: center; font-size: 22px; padding: 1rem; color: #14767B; border-bottom: none;"
          align="center">&#128171;¡Tu hijo avanza
          increíblemente en su camino al inglés!&#128171;
        </th>
      </tr>
      <tr>
        <td
          style="font-size: 14px; font-family: Segoe UI; padding: 0 15%; font-weight: 400; color: #1C5457; text-align: center;"
          align="center">
         <b>Tu hijo/a ha avanzado increíblemente</b>, y en el siguiente nivel fortalecerá su confianza, usará
            expresiones naturales y comprenderá conversaciones más fluidas.
            &#9733; <b>Nuestro objetivo:</b> que aprenda inglés con seguridad y entusiasmo, abriendo puertas a
            nuevas
            oportunidades.
        </td>
      </tr>
    </table>
  </div>`;
    const avanceMotivacionDiagEvals = `<div style="margin: 4rem auto; justify-items: center;">
    <table width="80%" align="center" cellspacing="0" cellpadding="0"
      style="width: 80%; border-collapse: collapse; border-radius: 25px; border: none; overflow: hidden; margin: 0; background-color: #F5FAFA; table-layout:fixed;">
      <tr>
        <th
          style="font-weight: 700; border-bottom: 1px dotted #219fa6; text-align: right; font-size: 22px; padding: 1rem; color: #14767B; border: none; font-family: Segoe UI; width: 60px"
          align="center">
          <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 35px; margin-right: 0.2rem"></span>

        </th>
        <td
          style="font-size: 15px; font-family: Segoe UI;  padding: 1rem 1rem 1rem 0; font-weight: 500; color: #497275; text-align: left;"
          align="center">
          Nuestro compromiso es que aprenda inglés con seguridad, entusiasmo y sentido de logro,
          preparándolo
          para
          comunicarse cada vez mejor.
        </td>
      </tr>
    </table>
  </div>`;
    const avanceMotivacionFailAdults = "";
    const avanceMotivacionFailKids = "";

    // Final selection
    let imgHeader = syllabusLower.includes("adults") ? adultsHeader : kidsHeader;

    let imgFooter = syllabusLower.includes("adults") ? adultsFooter : kidsFooter;

    // let avanceMotivacion = syllabusLower.includes("adults") ? avanceMotivacionAdults : avanceMotivacionKids;

    let avanceMotivacion = isDiagnosticEval(syllabusVal, levelVal) ? avanceMotivacionDiagEvals : totalScore >= 7 ? syllabusLower.includes("adults") ? avanceMotivacionAdults : avanceMotivacionKids : syllabusLower.includes("adults") ? avanceMotivacionFailAdults : avanceMotivacionFailKids;

    //===================================================================
    //IS FILTER / ISFILTEREVAL LOGIC

    const isFilter = isFilterEval(syllabusVal, levelVal, weekVal);

    let willLearn = [];
    let nextFilter = "";
    let weeksToRepeat = "";

    if (syllabus === "Juniors 5-7") {
        weeksToRepeat = "8";
        if (levelVal === 7 && weekVal === 7) {
            willLearn = ["Futuro Simple (Going to)", "Futuro Simple (Will)", "Repaso de Tiempos Gramaticales Básicos", ];
            nextFilter = "9";
        }
        if (levelVal === 9 && weekVal === 7) {
            willLearn = ["Repaso de Tiempos Gramaticales Básicos"];
            nextFilter = "10";

        }
    }

    if (syllabus === "Kids (Intensivo) 8-12") {
        weeksToRepeat = "8";
        if (levelVal === 2 && weekVal === 13) {
            willLearn = ["Futuro Simple (Going to)", "Futuro Simple (Will)", "Pasado Simple", ];
            nextFilter = "4";
        }
        if (levelVal === 4 && weekVal === 13) {
            willLearn = ["Pasado Simple", "Pasado Progresivo", "Repaso General"];
            nextFilter = "7";
        }
        if (levelVal === 7 && weekVal === 13) {
            willLearn = ["Condicionales", "Comparativos y Superlativos", "Modales"];
            nextFilter = "9";
        }
        if (levelVal === 9 && weekVal === 13) {
            willLearn = ["Presente Perfecto", "Repaso de Tiempos Gramaticales Básicos", ];
            nextFilter = "10";

        }
    }

    if (syllabus === "Kids (Super Intensivo) 8-12") {
        weeksToRepeat = "8";
        if (levelVal === 4 && weekVal === 7) {
            willLearn = ["Pasado Simple", "Pasado Progresivo", "Repaso General"];
            nextFilter = "7";
        }
        if (levelVal === 7 && weekVal === 7) {
            willLearn = ["Condicionales", "Comparativos y Superlativos", "Modales"];
            nextFilter = "9";
        }
        if (levelVal === 9 && weekVal === 7) {
            willLearn = ["Repaso de Tiempos Gramaticales Básicos"];
            nextFilter = "10";
        }
    }

    if (syllabus === "Kids Masters") {
        weeksToRepeat = "4";
        if (levelVal === 4 && weekVal === 3) {
            willLearn = ["Superlativos", "Presente Perfecto", "Presente Perfecto Progresivo", ];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Repaso de Tiempos Gramaticales Básicos"];
            nextFilter = "10";

        }
    }

    if (syllabus === "Kids Masters 2") {
        weeksToRepeat = "4";
        if (levelVal === 4 && weekVal === 3) {
            willLearn = ["Presente Perfecto Progresivo", "Repaso de Tiempos Gramaticales Básicos", ];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Futuro Perfecto", "Modales perfectos", "Repaso de Tiempos Gramaticales Básicos", ];
            nextFilter = "10";

        }
    }

    if (syllabus === "Teens 13-17 (3hrs/week)") {
        weeksToRepeat = "8";
        if (levelVal === 2 && weekVal === 13) {
            willLearn = ["Pasado Simple", "Pasado Progresivo", "Repaso de Tiempos Gramaticales Básicos", ];
            nextFilter = "4";
        }
        if (levelVal === 4 && weekVal === 13) {
            willLearn = ["Modales", "Condicionales", "Comparativos y Superlativos"];
            nextFilter = "7";
        }
        if (levelVal === 7 && weekVal === 13) {
            willLearn = ["Presente Perfecto", "Repaso General"];
            nextFilter = "9";
        }
        if (levelVal === 9 && weekVal === 13) {
            willLearn = ["Presente Perfecto Progresivo", "Repaso General"];
            nextFilter = "10";

        }
    }

    if (syllabus === "Teens 13-17 (5hrs/week)") {
        weeksToRepeat = "8";
        if (levelVal === 4 && weekVal === 7) {
            willLearn = ["Modales", "Condicionales", "Comparativos y Superlativos"];
            nextFilter = "7";
        }
        if (levelVal === 7 && weekVal === 7) {
            willLearn = ["Presente Perfecto", "Repaso General"];
            nextFilter = "9";
        }
        if (levelVal === 9 && weekVal === 7) {
            willLearn = ["Presente Perfecto Progresivo", "Repaso de Tiempos Gramaticales Básicos", ];
            nextFilter = "10";

        }
    }

    if (syllabus === "Teens Masters") {
        weeksToRepeat = "4";
        if (levelVal === 4 && weekVal === 3) {
            willLearn = ["Superlativos", "Presente Perfecto", "Presente Perfecto Progresivo", ];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Futuro Perfecto", "Repaso de Tiempos Gramaticales Básicos"];
            nextFilter = "10";

        }
    }

    if (syllabus === "Teens Masters 2") {
        weeksToRepeat = "4";
        if (levelVal === 4 && weekVal === 3) {
            willLearn = ["Superlativos", "Presente Perfecto", "Presente Perfecto Progresivo", ];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Futuro Perfecto", "Repaso de Tiempos Gramaticales Básicos"];
            nextFilter = "10";

        }
    }

    if (syllabus === "Adults (3hrs/week)") {
        weeksToRepeat = "4";
        if (levelVal === 5 && weekVal === 3) {
            willLearn = ["Pasado Progresivo", "Pasado Simple", "Repaso General"];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Modales: Can / Should", "Comparativos y Superlativos", "Repaso General", ];
            nextFilter = "12";

        }
    }

    if (syllabus === "Adults (5hrs/week)") {
        weeksToRepeat = "4";
        if (levelVal === 5 && weekVal === 3) {
            willLearn = ["Pasado Progresivo", "Pasado Simple", "Repaso General"];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Modales: Can / Should", "Comparativos y Superlativos", "Repaso General", ];
            nextFilter = "12";

        }
    }

    if (syllabus === "Adults Masters (3hrs/week)") {
        weeksToRepeat = "4";
        if (levelVal === 5 && weekVal === 3) {
            willLearn = ["Presente Perfecto", "Condicionales", "Deseos (I wish / If only)", ];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Used to", "Deseos en Presente y Futuro (I wish / If only)", "Voz Pasiva", ];
            nextFilter = "12";

        }
    }

    if (syllabus === "Adults Masters (5hrs/week)") {
        weeksToRepeat = "4";
        if (levelVal === 5 && weekVal === 3) {
            willLearn = ["Presente Perfecto", "Condicionales", "Deseos (I wish / If only)", ];
            nextFilter = "8";
        }
        if (levelVal === 8 && weekVal === 3) {
            willLearn = ["Used to", "Deseos en Presente y Futuro (I wish / If only)", "Voz Pasiva", ];
            nextFilter = "12";

        }
    }

    let loQueAprendera = ``;

    if (isFilter && totalScore > 6.9) {
        loQueAprendera = `  <!-- lo que aprenderá -->
  <div style="margin: 4rem auto; justify-items: center; border-radius: 25px; background-color:rgba(252,250,250,0.1);">
    <table width="100%" align="center" cellspacing="0" cellpadding="0" style="width: 80%; border-collapse: collapse;">
      <tr>
        <th
          style="border-bottom: none; font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6; "
          align="center">
          <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/bell.png" style="height: 25px; margin-right: 0.2rem"></span>
          ¿Qué aprenderá antes del próximo nivel filtro?
        </th>
      </tr>
      </thead>
      <tbody>
            ${willLearn.map( (topic) => {
            const topicKey = topic.toLowerCase();


            const matchedKey = Object.keys(topicBreakdown).find( (k) => k.toLowerCase() === topicKey, );

            const topicDescription = matchedKey ? topicBreakdown[matchedKey] : "";

            return `

        <tr>
          <td
            style="  font-size: 15px;  font-family: Segoe UI;  font-weight: 400;  color: #1C5457;  padding: 10px 10px 10px 5%; text-align: left;">
            <b>Tema:</b> ${topic}
          </td>
        </tr>
        <tr>
          <td
            style="font-family: Segoe UI; font-weight: 400; text-align: left; padding: 0.3rem 0 1rem 13%;  color: #1C5457; font-size: 14px;"
            align="left">
            ${topicDescription}
          </td>
        </tr>
              `;
        }
        ).join("")}
          </tbody>
        </table>
      </div>`;

        console.log("Filter Eval detected:", syllabus, "Level:", levelVal, "Week:", weekVal, );
    }

    // video tutorials for next steps in RC
    let topicVideoTutorials = ""
    // "Futuro Simple (Will)": "",
    // "Pasado Simple": "",
    // "Pasado Progresivo": ""
if (syllabusLower.includes("kids (intensivo) 8-12") || syllabusLower.includes("kids (super intensivo) 8-12")){
   topicVideoTutorials = {
        "Presente Simple (1ra persona)": "https://vimeo.com/1203922050/b8bd4fdab4?share=copy&fl=sv&fe=ci",
        "Presente Simple (3ra persona)": "https://vimeo.com/1203923180/a0881078ea?share=copy&fl=sv&fe=ci",
        "Presente Progresivo (1ra persona)": "https://vimeo.com/1203923205/1fb6936ec4?share=copy&fl=sv&fe=ci",
        "Presente Progresivo (3ra persona)": "https://vimeo.com/1203923227/4087690b01?share=copy&fl=sv&fe=ci",
        "Futuro Simple (Going to)": "https://vimeo.com/1203923261/faa813b407?share=copy&fl=sv&fe=ci"
    };
}
    let mustPracticeTopics = ``;
    let mapaGrande = ``;

    if (isFilter && totalScore < 7) {
        // cuando no aprueban
        mustPracticeTopics = `
    ${reinforceTopics.map( (topic) => {

            const topicKey = topic.toLowerCase();

            // Buscar descripción
            const matchedDescriptionKey = Object.keys(topicBreakdown).find( (k) => k.toLowerCase() === topicKey);

            const topicDescription = matchedDescriptionKey ? topicBreakdown[matchedDescriptionKey] : "";

            // Buscar video
            const matchedVideoKey = Object.keys(topicVideoTutorials).find( (k) => k.toLowerCase() === topicKey);

            const videoUrl = matchedVideoKey ? topicVideoTutorials[matchedVideoKey] : null;

            return `
        <tr>
            <td
                style="font-family: Segoe UI; text-align: left; padding: 1rem 0 0.2rem 5%; font-size: 15px; font-weight: 600; color: #1C5457;"
                align="left">
                <span style="font-weight: bold; margin-right: 5px;">&#9744;</span>
                ${safe(topic)}
            </td>
        </tr>

        <tr>
            <td
                style="font-family: Segoe UI; font-weight: 400; text-align: left; padding: 0.3rem 0 0.3rem 13%; color: #1C5457; font-size: 14px;"
                align="left">
                ${topicDescription}
            </td>
        </tr>

        ${videoUrl ? `
        <tr>
            <td
                align="left"
                style="font-family: Segoe UI; text-align: left; padding: 5px 0 1rem 13%;">
                <a
                    href="${videoUrl}"
                    target="_blank"
                    style="
                        display:block;
                        box-sizing:border-box;
                        background-color:#f1f8f8;
                        padding:8px 15px;
                        border-radius:10px;
                        color:#126064;
                        text-decoration:none;
                        font-family:Segoe UI;
                        font-size:13px;
                        line-height:18px;
                        font-weight: 400;
                    ">
                    <span style="font-size:12px;">&#9654;</span>
                    Ver lección de
                    <span style="font-weight:600;">${safe(topic)}</span>
                </a>
            </td>
        </tr>
        ` : `
        <tr>
            <td style="height:12px;"></td>
        </tr>
        `}
        `;
        }
        ).join("")}
    `;
        // siguientes pasos for reprobado
        let approachforMap = "";
        approachforMap = syllabusLower.includes("adults") ? "<b>Continuarás reforzando</b> contenidos en tu <b>nivel actual</b>" : "El estudiante <b>continuará reforzando</b> contenidos en su <b>nivel actual</b>";
        let apoyarAvances = "";
        apoyarAvances = syllabusLower.includes("adults") ? "Para apoyar tu avance" : "Para apoyar su avance";

        // =======================================================
        mapaGrande = ` <!--SIGUIENTES PASOS-->
  <div style="margin: 4rem auto; justify-items: center; border-radius: 25px; background-color:rgba(252,250,250,0.1);">
    <table width="100%" align="center" cellspacing="0" cellpadding="0" style="width: 80%; border-collapse: collapse;">
      <tr>
        <th
          style="border-bottom: none; font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6;"
          align="center">
          <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/nextStepOutline.png" style="height: 25px; padding: 0; margin-right:5px;"></span>

          Siguientes Pasos
        </th>
      <tr>
        <td
          style="  color: #497275;  text-align: left;  padding: 10px; font-family: Segoe UI; font-size:15px; font-weight: 400;">
          ${approachforMap}
          (<b>nivel ${levelVal}</b>)
          durante
          las
          próximas <b>${weeksToRepeat}
          semanas</b>,
          hasta la siguiente evaluación filtro.
        </td>

      </tr>

      <tr>
        <td
          style="font-family: Segoe UI;  text-align: left; padding: 1rem; font-size: 16px; font-weight: 400; color: #1C5457;"
          align="left">
          ${apoyarAvances}, estos son los temas recomendados para practicar:
        </td>
      </tr>
      ${mustPracticeTopics}
    </table>
  </div>
     `;
    } else {
        // for aprobadso and no matter if its filter or not
        let approachforMap = "";
        approachforMap = syllabusLower.includes("adults") ? "Te encuentras en el" : "El estudiante se encuentra en el";

        let diagevalapproachformap = "";
        diagevalapproachformap = syllabusLower.includes("adults") ? "Continúas desarrollando las competencias del" : "El estudiante continúa desarrollando las competencias del";

        let bigmap = "";
        bigmap = syllabusLower.includes("adults") ? "" : `
      <img src="${B_ClassPath}" style="width: 90%; margin-bottom: 1rem;">`;

        // ===============
        mapaGrande = ` <!--MAPA GRANDE-->
  <div
    style="margin: 4rem auto; justify-items: center; border-radius: 25px; background-color:rgba(252,250,250,0.1); text-align:center;">
    <table width="100%" align="center" cellspacing="0" cellpadding="0" style="width: 80%; border-collapse: collapse;">
      <tr>
        <th
          style="border-bottom: none; font-size: 22px; font-family: Segoe UI; font-weight: 700; color: #14767B; text-align: center; padding: 0.5rem; border-bottom: 1px dotted #219fa6; "
          align="center">
          Progreso Actual
        </th>
      </tr>
              <tr>
        <td
          style="font-family: Segoe UI;  text-align: left; padding: 1rem; font-size: 15px; font-weight: 400; color: #1C5457;"
          align="left">
          &#9733; ${isDiagnosticEval(syllabusVal, levelVal) ? `${diagevalapproachformap}` : `${approachforMap}`}  <b>nivel ${levelVal}</b>.
      ${isDiagnosticEval(syllabusVal, levelVal) ? `<br> <br>
                &#9733; Seguirá consolidando bases importantes para
                avanzar con confianza hacia estructuras más complejas.` : ``}
        </td>
      </tr>`;
        if (isFilter) {
            mapaGrande += `<tr>
        <td
          style="font-family: Segoe UI;  text-align: left; padding: 0 1rem 1rem; font-size: 16px; font-weight: 400; color: #1C5457;"
          align="left">&#9733; El próximo nivel filtro es el
          <b>nivel ${nextFilter}</b>.
        </td>
      </tr>`;
        }
        mapaGrande += `
              </table>
              ${bigmap}
            </div>`;
    }

    // ---------- styles removed ----------

    //
    //===================================================================
    // ---------- final assembly ----------
    //===================================================================
    //

    let reportHTML = "";
    reportHTML += `
 <html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reporte de Evaluación</title>
</head>

<body style="margin: 0 auto; background: linear-gradient(to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%); background-color: #f5ffff; text-align: center">
  <div class="Evaluation-Results" style="margin: 0 auto; background: linear-gradient(to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%); background-color: #DCF7F9;">
      <!-- <!HEADER> -->
      <div style="
            text-align: center;
            background: linear-gradient(to bottom, #f5f0e6 0%, transparent 50%);
            background-color: transparent;
          ">
        <img src="${imgHeader}" alt="" style="width: 100%; display: block; border: 0">
      </div>`;
    reportHTML += welcomeHTML;
    reportHTML += ` <div class="email-body"
      style="border-radius: 20px; padding: 2rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">`;
    reportHTML += resultadoGlobal;
    reportHTML += detalleNotaHTML;
    reportHTML += desempeñoHTML;
    reportHTML += dominatedHTML;
    reportHTML += reinforceHTML;
    reportHTML += opportunityHTML;
    reportHTML += pronunciationHTML;
    reportHTML += commentsHTML;
    reportHTML += coachingHTML;
    reportHTML += loQueAprendera;
    reportHTML += mapaGrande;
    reportHTML += avanceMotivacion;
    reportHTML += evaluatorLine;
    reportHTML += rescheduleBox;
    reportHTML += referText;
    reportHTML += `</div>`;
    reportHTML += `</div>`;
    reportHTML += `<!--FOOTER -->

          <img src="${imgFooter}"
           style="width:100%; display:block; margin:0; padding:0; border:0;">
        `;
    reportHTML += `</div>
                    </body>
                  </html>`;

    // ---------- preview ----------
    const popupContent = document.querySelector("#popupContent");
    //const para preview de scores
    if (popupContent) {
        const fp = document.getElementById("fl").value;
        const gp = document.getElementById("gr").value;
        const pp = document.getElementById("pr").value;
        const cp = document.getElementById("co").value;
        const ip = document.getElementById("in").value;
        popupContent.innerHTML = `
    <div class="results-preview">
      <div class="floating-results">
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
        <td class="ar">Total</td>
        <td class="num">${totalScore}</td>
        </tr>
        </table>
      </div>
    <h2>Evaluation Results</h2>
    <p class="previewTitle">Preview</p>
    <div class="preview-wrapper">${reportHTML}</div>
    </div>`;

        // ---------- buttons ----------
        const backBtn = document.createElement("button");
        backBtn.id = "backFromCopy";
        backBtn.innerText = "Back: Finish Feedback";
        backBtn.classList.add("action-btn");
        backBtn.addEventListener("click", () => showFinalSection());
        popupContent.appendChild(backBtn);

        const restartBtn = document.createElement("button");
        restartBtn.id = "restart4Evaluators";
        restartBtn.innerText = "End: Start New Evaluation";
        restartBtn.classList.add("action-btn");
        restartBtn.addEventListener("click", evaluatorsReloadPage);
        popupContent.appendChild(restartBtn);
    }

    // ---------- copy to clipboard ----------
    navigator.clipboard.writeText(reportHTML).then( () => showPopup("<h3>✅Success!</h3><p>The Results have been copied to your clipboard! </p>", ), ).catch( () => showPopup("<h3>😓 Oops...</h3><p>❌ The results couldn't be copied, please try again or contact Michelle Hernández via Teams.</p>", ), );
}


async function evaluatorsReloadPage() {
    const proceed = await confirmPopup("<h3>Start again? 🤔</h3><p>We’ll reset everything so you can begin a fresh evaluation.</p><p><b>Are you sure you want to restart? 👀</b></p>", );

    if (proceed) {

        const fieldset = document.querySelector("#optionsGroup");

        if (fieldset) {
            const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]');

            checkboxes.forEach( (cb) => {
                cb.checked = false;

                const label = cb.closest("label");
                if (label) {
                    label.classList.remove("selected");
                    label.classList.remove("unselected");
                }
            }
            );
            const counter = document.querySelector("#counter");

            if (counter) {
                counter.textContent = `0/${maxAllowed} seleccionadas`;
            }
        }


        if (weeksDropdown) {
            weeksDropdown.dispatchEvent(new Event("change"));
        }


        const selects = document.querySelectorAll("#gr, #pr, #in, #fl, #co");
        selects.forEach( (select) => {
            select.value = "2.0";
        }
        );


        refreshVisibleComments();
        updateExtraInfo();
        if (fluency) {
            fluency.dispatchEvent(new Event("change"));
        }
        if (intonation) {
            intonation.dispatchEvent(new Event("change"));
        }


        const textareas = document.querySelectorAll("textarea");
        textareas.forEach( (textarea) => {
            textarea.value = "";
            skillTest.value = "";
        }
        );


        if (typeof updateTotalScore === "function") {
            updateTotalScore();
        }
        if (typeof calculateFinalScore === "function") {
            calculateFinalScore();
        }


        popup.classList.add("hidden");
        mainContent.style.display = "block";


        const topicsSection = document.getElementById("topicsList");
        if (topicsSection) {
            topicsSection.scrollIntoView({
                behavior: "smooth"
            });
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}



function showCoachingOpportunity() {
    const syllabus = syllabusE4E?.value || "";
    const level = levelE4E?.value || "";
    const totalScore = parseFloat(totalScoreEl?.textContent) || 0;



    const hasCoachingOpportunity = (syllabus.includes("Kids Intensivo") || syllabus.includes("Kids (Super Intensivo)")) && ["2", "4", "7"].includes(level) && totalScore <= 7;


    const popupContent = popup?.querySelector?.("#popupContent");

    if (hasCoachingOpportunity && popupContent) {
        // HTML de coaching
        popupContent.innerHTML = `
      <div class="final-container">
        <h4>Every Selected item will be added to the RC</h4>
        <fieldset class="coachingOpportunity">
          <legend>Coaching Opportunity</legend>
          <label for="presenteProgresivo">
            <input type="checkbox" id="presenteProgresivo"/> Presente progresivo
          </label>
          <label for="futuroGoingTo">
            <input type="checkbox" id="futuroGoingTo"/> Futuro con going to
          </label>
          <label for="pasadoProgresivo">
            <input type="checkbox" id="pasadoProgresivo"/> Pasado progresivo
          </label>
        </fieldset>
      </div>`;

        // Botón back
        const backButton = document.createElement("button");
        backButton.id = "nextBtn";
        backButton.innerText = "Back: See feedback";
        backButton.addEventListener("click", showFinalSection);
        popupContent.appendChild(backButton);

        // Botón copy results
        const copyButton = document.createElement("button");
        copyButton.id = "copyResults";
        copyButton.classList.add("copybutton");
        copyButton.innerText = "Next: Copy Results (EVALUATORS ONLY)";
        copyButton.addEventListener("click", evaluatorsCopyResults);
        popupContent.appendChild(copyButton);

        if (closeBtn)
            closeBtn.style.display = "inline-block";
    } else {
        console.log("no PASA");
        evaluatorsCopyResults();
    }
}

// ---open---
function openSoundboard() {
    const soundboard = document.createElement("div");
    soundboard.classList.add("soundboard", "slide-in");

    soundboard.innerHTML = `
    <button class="close" onclick="closeSoundboard()">✖</button>
    <div id="wrapping" class="wrapping">
      <button class="category-btn" onclick="openCategory('actions', this)">Actions</button>
      <button class="category-btn" onclick="openCategory('sfx', this)">SFX</button>
      <button class="category-btn" onclick="openCategory('music', this)">Music</button>
      <button class="category-btn" onclick="openCategory('animals', this)">Animals</button>
      </div>
  `;

    document.body.appendChild(soundboard);
    setTimeout( () => {
        document.addEventListener("click", handleOutsideClick);
    }
    , 0);
}

// ---close---
function closeSoundboard() {
    const soundboard = document.querySelector(".soundboard");
    if (soundboard) {
        soundboard.classList.remove("slide-in");
        soundboard.classList.add("slide-out");

        soundboard.addEventListener("animationend", () => {
            soundboard.remove();
            document.getElementById("soundboardBtn").style.display = "flex";
            document.removeEventListener("click", handleOutsideClick);
        }
        , {
            once: true
        }, );
    }
}

// ---category---

function openCategory(category, clickedBtn) {
    const soundboard = document.querySelector(".soundboard");
    const buttons = soundboard.querySelectorAll(".category-btn");
    const wrapping = document.getElementById("wrapping");


    const existingCategoryDiv = soundboard.querySelector(".category-content");
    if (existingCategoryDiv)
        existingCategoryDiv.remove();


    soundboard.classList.add("expanded");


    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("category-content", "fade-in");
    categoryDiv.id = category;
    wrapping.classList.remove("wrapping");
    wrapping.classList.add("wrapped");


    buttons.forEach( (btn) => {
        if (btn === clickedBtn) {
            btn.classList.remove("unselected");
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
            btn.classList.add("unselected");
        }
    }
    );


    const categories = {
        actions: ["Eat", "Bite", "Drink", "Sleep", "Run", "Jump", "Dance Macarena", "Walk", ],
        sfx: ["Impostor Among Us", "Buzzer", "Chan Chan Chan", "Claps", "Correct Ding", "Crickets", "Hoop Ding", "Horn", "Huh", "Sad Meow", "Shock Cinematic", "Tiny Violin", "Victory", "Vine Boom", "Yipee", ],
        music: ["My Little Soda Pop", "Dance-Remix", "Dynamite - BTS", "Fancy - Twice", "Jump - Blackpink", "Macarena", "Russian Roulette", ],
        animals: ["Bee", "Cat", "Chicken", "Cow", "Crow", "Dinosaur", "Dog", "Dove", "Duck", "Elephant", "Frog", "Giraffe", "Horse", "Whale", "Lion", "Owl", "Panda", "Penguin", "Pig", "Rabbit", "Raccoon", "Rat", "Rattlesnake", "Rooster", "Sheep", "Tiger", "Wolf", "Zebra", ],
    };


    let html = '<section class="press-button">';
    categories[category].forEach( (name) => {
        // convertir a minúsculas y reemplazar caracteres especiales para el archivo
        let fileName = name.toLowerCase().replace(/ /g, " ");
        let folder = category.charAt(0).toUpperCase() + category.slice(1);
        // Actions, SFX, Music, Animals
        html += `
      <div>
        <button data-sound="SoundBoard/${folder}/${fileName}.mp3" onclick="playSound(this)"></button>
        <h5>${name}</h5>
      </div>
    `;
    }
    );
    html += "</section>";


    categoryDiv.innerHTML = html;


    soundboard.appendChild(categoryDiv);
}


function handleOutsideClick(e) {
    const soundboard = document.querySelector(".soundboard");
    if (soundboard && !soundboard.contains(e.target) && e.target.id !== "soundboardBtn") {
        closeSoundboard();
    }
}


let activeAudios = [];

// ---PLAY SOUND---
function playSound(button) {
    const soundPath = button.getAttribute("data-sound");
    const audio = new Audio(soundPath);


    audio.play();


    activeAudios.push(audio);


    if (!document.getElementById("stop-all-btn")) {
        const stopBtn = document.createElement("button");
        stopBtn.id = "stop-all-btn";
        stopBtn.textContent = "Stop All Sounds";
        stopBtn.classList.add("stopSounds", "slide-in");
        stopBtn.onclick = stopAllSounds;
        document.body.appendChild(stopBtn);
    }


    audio.addEventListener("ended", () => {
        activeAudios = activeAudios.filter( (a) => a !== audio);


        if (activeAudios.length === 0) {
            const stopBtn = document.getElementById("stop-all-btn");
            if (stopBtn) {
                stopBtn.classList.remove("slide-in");
                stopBtn.classList.add("slide-out");

                stopBtn.addEventListener("animationend", () => {
                    stopBtn.remove();
                    document.getElementById("soundboardBtn").style.display = "flex";
                    document.removeEventListener("click", handleOutsideClick);
                }
                , {
                    once: true
                }, );
            }
        }
    }
    );
}

// ---STOP ALL SOUNDS---
function stopAllSounds() {
    activeAudios.forEach( (audio) => {
        audio.pause();
        audio.currentTime = 0;
        // Reiniciar al inicio
    }
    );
    activeAudios = [];


    const stopBtn = document.getElementById("stop-all-btn");
    if (stopBtn)
        stopBtn.remove();
}



const fieldset = document.querySelector("#optionsGroup");
const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]');
const counter = document.querySelector("#counter");
const maxAllowed = 3;

checkboxes.forEach( (cb) => {
    cb.addEventListener("change", () => {
        const checked = fieldset.querySelectorAll('input[type="checkbox"]:checked');
        const count = checked.length;


        counter.textContent = `${count}/${maxAllowed} seleccionadas`;


        checkboxes.forEach( (box) => {
            const label = box.closest("label");
            if (count >= maxAllowed && !box.checked) {
                box.disabled = true;
                label.classList.add("unselected");
            } else {
                box.disabled = false;
                label.classList.remove("unselected");
            }
        }
        );


        checkboxes.forEach( (box) => {
            const label = box.closest("label");
            if (box.checked) {
                label.classList.add("selected");
            } else {
                label.classList.remove("selected");
            }
        }
        );
    }
    );
}
);


// RESCHEDULE EVAL

function ReScheduleEmail() {
    const ReScheduleEmail = `
    <html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reporte de evaluación</title>
  <!-- STYLE -->

</head>

<body style="margin: 0 auto; background: linear-gradient(
          to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%
        ); background-color: #1ca5ab15; ">
  <div class="Evaluation-Results" style="margin: 0 auto; background: linear-gradient(
          to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%
        ); background-color: #1ca5ab15;">
    <!-- <!HEADER> -->
    <div style="
          text-align: center;
          background: linear-gradient(to bottom, #f5f0e6 0%, transparent 50%);
          background-color: transparent;
        ">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/emptyheaderpng.png" alt="" style="width: 100%; display: block; border: 0">
    </div>
    <div style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
      <p
        style="padding: 0 1rem; font-size: 18px; font-weight: 700; color: #126064; font-family: Segoe UI; margin: 1rem auto;">
        Estimado/a estudiante o padre de familia,<br>
        <!-- &#x1F31F; -->
        <span
        style="padding: 0 1rem; font-size: 14px; font-weight: 400; color: #126064; padding-bottom: 0.8rem; font-family: Segoe UI;">
        Esperamos que estés teniendo una excelente semana</span>
      </p>
    </div>

    <div class="email-body"
      style="border-radius: 20px; padding: 20px; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">
      <!-- next steps -->
      <div style="margin: 0rem auto;">
        <table width="100%" align="center" cellspacing="0" cellpadding="0"
          style="border-collapse: collapse; border: none; background-color: #f9fafb; border-radius: 20px;">
          <tr>
            <th width="35%" align="right" cellspacing="0" cellpadding="0" style="padding-top: 20px;">
              <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 50px; "">
            </th>
            <th width="65%"
              style="font-weight: 700; text-align: left; font-size: 20px; color: #126064; font-family: Segoe UI; padding: 50px 20px 30px; line-height: 1; "
              align="left">
             Reprogramar Evaluación
            </th>
          </tr>
          <tr>
            <td colspan="2"
              style="font-size: 14px; font-family: Segoe UI; padding: 0 20px 30px; font-weight: 400; color: #044043; text-align: center;"
              align="center">
              <p style="font-family: Segoe UI; margin: 1rem 15%">
                Te compartimos el siguiente enlace, donde podrás reagendar la evaluación de forma rápida y sencilla:
              </p>
              <a href="https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones" target="_blank"
                style="text-decoration: none; font-family: Segoe UI; background-color: #147b7b; padding: 1rem 10%; border-radius: 15px; font-weight: 700; color: white; font-size: 15px; margin: 1rem auto; display: inline-block;">
                Reprogramar Evaluación Aquí
              </a>
            </td>
          </tr>
        </table>
      </div>
      <!-- referal -->
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

</html>
`;

    // Copiar al portapapeles
    navigator.clipboard.writeText(ReScheduleEmail).then( () => showPopup(`<h3>✅Success!</h3><p>The reschedule email has been copied to your clipboard! </p> <h4 class="previewTitle">Preview:</h4>
        <div class="smallPreview"> ${ReScheduleEmail} </div>`, ), ).catch( () => showPopup(`<h3>😓 Oops...</h3><p>❌ The results couldn't be copied, please try again or contact Michelle Hernández via Teams.</p>`, ), );
}
