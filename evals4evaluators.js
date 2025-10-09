(() => {
  const version = "Evaluators";
  const versionnum = "1.1.0";
  //updated for no survey is not good evaluator
  const E4EjsonVersion = 1.1;
  window.appVersion = "Evaluators";
  const showversion = document.getElementById("version");
  showversion.innerHTML = `${version} ${versionnum} - JSON ${E4EjsonVersion}`;
})();

// ---------- Elementos del DOM ----------
const syllabusE4E = document.getElementById("syllabusDropdown");
const levelE4E = document.getElementById("levelsDropdown");
const weekE4E = document.getElementById("weeksDropdown");
const feedbackBtnE4E = document.getElementById("feedback");
const evaluatorsDropdown = document.getElementById("evaluatorsDropdown");
const evaluatorIDSpan = document.getElementById("evaluatorID");
const fluency = document.getElementById("fl");
const flCommentRowEl = document.getElementById("flcomment");
const flCommentRow = flCommentRowEl
  ? flCommentRowEl.parentElement.parentElement
  : null;
const intonation = document.getElementById("in");
const inCommentRowEl = document.getElementById("incomment");
const inCommentRow = inCommentRowEl
  ? inCommentRowEl.parentElement.parentElement
  : null;
const absentBtn = document.getElementById("absentBtn");
const extraInfo = document.getElementById("extra-info");
const totalScoreEl = document.getElementById("totalscore");
const skillTest = document.getElementById("skilltest");
const exitevaltable = document.getElementById("exitEvalTable");
const totalscorerow = document.getElementById("totalScoreRow");
const prepCommentRowEl = document.getElementById("prepcomment");
const prepCommentRow = prepCommentRowEl
  ? prepCommentRowEl.parentElement.parentElement
  : null;

// ---------- Estado global ----------
let evaluatorsData = {}; // se llena con fetch

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// ---------- Fetch único (popula evaluatorsDropdown + evaluatorsData) ----------
fetch("evaluators.json?v=${E4EjsonVersion}")
  .then((response) => response.json())
  .then((data) => {
    evaluatorsData = data;
    const evaluators = data.evaluators || {};
    evaluatorsDropdown.innerHTML =
      '<option value="">-- Select your credentials --</option>';
    Object.keys(evaluators).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      evaluatorsDropdown.appendChild(option);
    });

    evaluatorsDropdown.addEventListener("change", () => {
      const selectedName = evaluatorsDropdown.value;
      evaluatorIDSpan.textContent =
        selectedName && evaluators[selectedName]
          ? evaluators[selectedName][0]
          : "- - - -";
    });
  })
  .catch((error) => {
    console.error("Error al cargar el JSON:", error);
  });

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Habilitar absent al cambiar syllabus (comprueba existencia)
if (syllabusE4E) {
  syllabusE4E.addEventListener("change", () => {
    if (absentBtn) absentBtn.disabled = false;
  });
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// helper para comparar floats con tolerancia
function nearlyEqual(a, b, eps = 1e-6) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= eps;
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function updateExtraInfo() {
  const syllabusVal = syllabusE4E?.value || "";
  const levelVal = parseInt(levelE4E?.value, 10) || 0;
  const weekVal = parseInt(weekE4E?.value, 10) || 0;

  // 1) Mostrar / poblar preparación (solo Masters 2)
  const isprep = !!(
    syllabusVal && syllabusVal.toLowerCase().includes("masters 2")
  );
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

  // 2) Determinar si es Exit Evaluation (Juniors NO es exit)
  const syllabusLower = (syllabusVal || "").toLowerCase();

  const isExit =
    !syllabusVal.startsWith("Juniors") &&
    ((levelVal === 10 && (weekVal === 7 || weekVal === 13)) ||
      (levelVal === 12 && weekVal === 3) ||
      (syllabusVal.includes("Masters") && levelVal === 10 && weekVal === 3) ||
      (syllabusLower.includes("adults (5hrs/week)") &&
        levelVal === 10 &&
        weekVal === 3)) &&
    !(
      (syllabusLower.includes("kids intensivo") &&
        levelVal === 10 &&
        weekVal === 7) ||
      (syllabusLower.includes("teens 13-17 (3hrs/week)") &&
        levelVal === 10 &&
        weekVal === 7)
    );

  // 3) Mostrar/ocultar tabla de Exit Eval
  if (exitevaltable) {
    exitevaltable.classList.toggle("hidden", !isExit);
    if (!isExit && skillTest) {
      skillTest.value = "";
      if (typeof calculateFinalScore === "function") calculateFinalScore();
    }
  }

  // 4) Mostrar/ocultar fila de total score
  if (totalscorerow) {
    totalscorerow.classList.toggle("hidden", isExit);
  }

  // 5) Manejar checkbox "Condicionado"
  if (extraInfo) {
    let htmlContent = "";
    let scoreVal = NaN;

    if (isExit) {
      scoreVal = finalScore ? parseFloat(finalScore.textContent.trim()) : NaN;
    } else {
      scoreVal = totalScoreEl
        ? parseFloat(totalScoreEl.textContent.trim())
        : NaN;
    }

    // 🔍 Convertimos, redondeamos y comparamos exacto
    const fixedScore = Number(scoreVal.toFixed(2)); // redondea a 2 decimales exactos
    const isCondicionado = fixedScore === 7.0;

    if (isCondicionado) {
      htmlContent = `
        <label class="condicionado">
          ${isExit ? "Exit Condicionado" : "Condicionado"}
          <input type="checkbox" id="condicionado" checked>
        </label>`;
      extraInfo.innerHTML = htmlContent;
    } else {
      // si ya no es 7, eliminar el checkbox si existe
      extraInfo.innerHTML = "";
    }
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function calculateFinalScore() {
  const totalValue = parseFloat(totalScoreEl?.textContent) || 0;

  // si skillTest es input
  let skillTestScore = 0;
  if (skillTest) {
    if ("value" in skillTest) {
      skillTestScore = parseFloat(skillTest.value) || 0;
    } else {
      // fallback
      skillTestScore = parseFloat(skillTest.textContent) || 0;
    }
  }

  const finalScoreValue = totalValue * 0.6 + skillTestScore * 0.4;
  if (finalScore) {
    finalScore.textContent = Number.isFinite(finalScoreValue)
      ? Math.round(finalScoreValue * 10) / 10
      : "";
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

["gr", "pr", "in", "fl", "co"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", () => {
      updateExtraInfo();

      // si la exit eval table está visible, recalcular score
      if (exitevaltable && !exitevaltable.classList.contains("hidden")) {
        calculateFinalScore();
      }
    });
  }
});

if (weekE4E) weekE4E.addEventListener("change", updateExtraInfo);
if (levelE4E) levelE4E.addEventListener("change", updateExtraInfo);
if (syllabusE4E) syllabusE4E.addEventListener("change", updateExtraInfo);

// skillTest es un <input type="number">: recalcula final y luego extraInfo al cambiar
if (skillTest) {
  skillTest.addEventListener("input", () => {
    if (typeof calculateFinalScore === "function") calculateFinalScore();
    updateExtraInfo();
  });
}
//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// ---------- Helpers ----------
function getSyllabusBucket(syllabus) {
  if (!syllabus) return null;
  if (syllabus.startsWith("Juniors")) return "Juniors";
  if (syllabus.startsWith("Kids") && !syllabus.includes("Masters"))
    return "Kids";
  if (syllabus.startsWith("Teens") && !syllabus.includes("Master"))
    return "Teens";
  if (syllabus.startsWith("Adults") && !syllabus.includes("Masters"))
    return "Adults";
  if (syllabus.includes("Masters")) return "Masters";
  return null;
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Normaliza distintos formatos de datos a un array de items
function normalizeCommentsData(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data; // array de strings
  if (typeof data === "object") {
    // objeto: transformarlo en array de {label, html}
    return Object.keys(data).map((key) => {
      const val = data[key];
      const html = Array.isArray(val)
        ? val[0]
        : typeof val === "string"
          ? val
          : "";
      return { label: key, html };
    });
  }
  return [];
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Busca comentarios probando varias estructuras del JSON
function getCommentsArray(bucket, category) {
  if (!evaluatorsData) return [];

  // 1) bucket-first: evaluatorsData[bucket][category]
  if (bucket && evaluatorsData[bucket] && evaluatorsData[bucket][category]) {
    return normalizeCommentsData(evaluatorsData[bucket][category]);
  }

  // 2) evaluatorsData.comments[bucket][category]
  if (
    evaluatorsData.comments &&
    evaluatorsData.comments[bucket] &&
    evaluatorsData.comments[bucket][category]
  ) {
    return normalizeCommentsData(evaluatorsData.comments[bucket][category]);
  }

  // 3) category-first: evaluatorsData[category][bucket]
  if (evaluatorsData[category] && evaluatorsData[category][bucket]) {
    return normalizeCommentsData(evaluatorsData[category][bucket]);
  }

  // 4) commentsPerArea: evaluatorsData.commentsPerArea[category][bucket]  <-- tu caso
  if (
    evaluatorsData.commentsPerArea &&
    evaluatorsData.commentsPerArea[category] &&
    evaluatorsData.commentsPerArea[category][bucket]
  ) {
    return normalizeCommentsData(
      evaluatorsData.commentsPerArea[category][bucket],
    );
  }

  // 5) evaluatorsData[category] direct array
  if (Array.isArray(evaluatorsData[category])) {
    return normalizeCommentsData(evaluatorsData[category]);
  }

  return [];
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// Pobla el select con comentarios según categoría y syllabus
function populateComments(selectElement, category, syllabus) {
  selectElement.innerHTML = ""; // limpiar
  const bucket = getSyllabusBucket(syllabus);
  const items = getCommentsArray(bucket, category);

  if (items && items.length) {
    items.forEach((item) => {
      const opt = document.createElement("option");
      if (typeof item === "string") {
        opt.value = item;
        opt.textContent = item;
      } else if (item && typeof item === "object" && item.label) {
        opt.value = item.html || ""; // aquí guardamos el HTML de detalle
        opt.textContent = item.label; // y mostramos la frase resumen
      } else {
        opt.value = "";
        opt.textContent = String(item);
      }
      selectElement.appendChild(opt);
    });
  } else {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Choose a Syllabus first";
    selectElement.appendChild(opt);
  }

  // DEBUG
  // console.log({ syllabus, bucket, category, items });
}

//pobla preparation
function populatePreparation(selectEl) {
  if (!selectEl) return;

  // buscar datos en el JSON
  const prepObj = evaluatorsData?.commentsPerArea?.["Preparación"];
  if (!prepObj) {
    // si no hay datos, vacía y sal
    selectEl.innerHTML = "";
    return;
  }

  // guardar selección previa para restaurarla después
  const prevValue = selectEl.value;

  // repoblar
  selectEl.innerHTML = "";
  Object.keys(prepObj).forEach((label) => {
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label;
    selectEl.appendChild(opt);
  });

  // restaurar selección previa si existe entre las nuevas opciones
  if (
    prevValue &&
    Array.from(selectEl.options).some((o) => o.value === prevValue)
  ) {
    selectEl.value = prevValue;
  } else {
    // si no había selección previa, seleccionar la primera opción (opcional)
    if (selectEl.options.length > 0) selectEl.selectedIndex = 0;
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// ---------- Eventos: FLUENCY / INTONATION ----------
fluency.addEventListener("change", () => {
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
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

intonation.addEventListener("change", () => {
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
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// ------------------ helpers pequeños ------------------
function refreshVisibleComments() {
  const syllabus = syllabusE4E.value;

  // Fluency: si la fila está visible, repobla
  const flSelect = document.getElementById("flcomment");
  if (!flCommentRow.classList.contains("hidden")) {
    const prevLabel =
      flSelect.options[flSelect.selectedIndex]?.textContent || null;
    populateComments(flSelect, "Fluidez", syllabus);
    if (prevLabel) {
      const idx = Array.from(flSelect.options).findIndex(
        (o) => o.textContent === prevLabel,
      );
      if (idx >= 0) flSelect.selectedIndex = idx;
    }
  }

  // Intonation: si la fila está visible, repobla
  const inSelect = document.getElementById("incomment");
  if (!inCommentRow.classList.contains("hidden")) {
    const prevLabel =
      inSelect.options[inSelect.selectedIndex]?.textContent || null;
    populateComments(inSelect, "Entonación", syllabus);
    if (prevLabel) {
      const idx = Array.from(inSelect.options).findIndex(
        (o) => o.textContent === prevLabel,
      );
      if (idx >= 0) inSelect.selectedIndex = idx;
    }
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

// ------------------ reaccionar al cambio de syllabus ------------------
syllabusE4E.addEventListener("change", () => {
  // Si no hay syllabus seleccionado, limpiamos los selects visibles
  const syllabus = syllabusE4E.value;
  if (!syllabus) {
    if (!flCommentRow.classList.contains("hidden"))
      document.getElementById("flcomment").innerHTML = "";
    if (!inCommentRow.classList.contains("hidden"))
      document.getElementById("incomment").innerHTML = "";
    return;
  }

  // Re-popular solo los selects que estén visibles
  refreshVisibleComments();
});

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

(function () {
  function waitForEvaluatorReady(timeout = 4000) {
    return new Promise((resolve) => {
      const start = Date.now();
      (function check() {
        const domReady = document.readyState !== "loading";
        const hasOptions =
          document.getElementById("evaluatorsDropdown") &&
          document.getElementById("evaluatorsDropdown").options.length > 1;
        const dataReady =
          typeof evaluatorsData !== "undefined" &&
          (evaluatorsData.evaluators || Object.keys(evaluatorsData).length > 0);
        if (domReady && (hasOptions || dataReady)) return resolve(true);
        if (Date.now() - start > timeout) return resolve(false);
        setTimeout(check, 50);
      })();
    });
  }

  async function showEvaluatorModal() {
    await waitForEvaluatorReady();

    // overlay + box (usamos clases CSS)
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

    // clonar select real si tiene opciones; si no generarlo desde evaluatorsData
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
        modalSelect.innerHTML =
          '<option value="">-- Select evaluator --</option>';
        Object.keys(evaluatorsData.evaluators).forEach((name) => {
          const o = document.createElement("option");
          o.value = name;
          o.textContent = name;
          modalSelect.appendChild(o);
        });
      } else {
        modalSelect.innerHTML = '<option value="">(no evaluators)</option>';
      }
    }

    modalSelect.className = "modal-select";
    container.appendChild(modalSelect);
    modalSelect.focus();

    // función de shake reutilizable
    function shakeAndFocus() {
      box.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-8px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 220, easing: "ease-out" },
      );
      // tiny visual cue en el select
      modalSelect.style.boxShadow = "0 0 0 3px rgba(255,0,0,0.12)";
      setTimeout(() => (modalSelect.style.boxShadow = ""), 420);
      modalSelect.focus();
    }

    // confirmar: aplicar valor al select real y disparar change
    btnConfirm.addEventListener("click", () => {
      const chosen = modalSelect.value;
      if (!chosen) {
        shakeAndFocus();
        return;
      }

      if (realEval) {
        if (!Array.from(realEval.options).some((o) => o.value === chosen)) {
          const opt = document.createElement("option");
          opt.value = chosen;
          opt.textContent =
            modalSelect.options[modalSelect.selectedIndex]?.textContent ||
            chosen;
          realEval.appendChild(opt);
        }
        realEval.value = chosen;
        realEval.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        console.warn("evaluatorsDropdown no encontrado en DOM.");
      }

      if (overlay && overlay.parentElement) document.body.removeChild(overlay);
      document.documentElement.style.overflow = "";
    });

    // accesibilidad: Escape -> shake (no cierra)
    function onKey(e) {
      if (e.key === "Escape") {
        shakeAndFocus();
      }
      if (e.key === "Enter" && document.activeElement === modalSelect) {
        // permitir enter para confirmar también (si hay selección)
        btnConfirm.click();
      }
    }
    document.addEventListener("keydown", onKey);

    // limpiar listener cuando se cierra
    const observer = new MutationObserver(() => {
      if (!document.body.contains(box)) {
        document.removeEventListener("keydown", onKey);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      setTimeout(showEvaluatorModal, 60),
    );
  } else {
    setTimeout(showEvaluatorModal, 60);
  }
})();

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function absentsE4E() {
  const syllabus = syllabusE4E.value || "";
  if (!syllabus) {
    showPopup(
      "<h3>😓 Oops...</h3><p>Please select a valid syllabus first.</p>",
    );
    absentBtn.disabled = true;
    return;
  }

  let message = "";

  if (syllabus.startsWith("Adults")) {
    // ---- mensaje para estudiante ----
    message = `
Estimado estudiante,<br><br>Te informamos que <b>no asististe a la evaluación filtro</b> correspondiente a tu nivel en <b>${syllabus}</b>. Esta evaluación es  <b>obligatoria para avanzar al siguiente nivel</b> del programa.<br><br>&#9888;&#65039; Dado que te encuentras en un <b>nivel filtro</b>, si no presentas esta evaluación,  serás <b>reprogramado automáticamente para repetir el nivel</b>.<br><br>&#128073; Para evitar retrocesos en tu progreso, te solicitamos  <b>reagendar la evaluación lo antes posible</b> en el siguiente enlace: <a href=https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones target=_blank> Haz clic aquí</a> <br><br>Ahí podrás seleccionar el <b>horario que mejor se acomode</b> y agendarla por tu cuenta de forma rápida y sencilla.<br><hr> &#127919; En <b>English4Adults</b> creemos firmemente en tu potencial.<br><br>Con tu compromiso, podemos asegurarnos de que sigas avanzando con éxito. &#128170;&#127775;
    `;
  } else {
    // ---- mensaje para padres ----
    message = `
Estimado padre/madre de familia,<br><br>Le informamos que su hijo/a <b>no asistió a la evaluación filtro</b> correspondiente a su nivel en <b>${syllabus}</b>. Esta evaluación es <b>obligatoria para avanzar al siguiente nivel</b> del programa.

<p style=""color: #b30000;""> 
    &#9888;&#65039; Dado que se encuentra en un <strong>nivel filtro</strong>, si no presenta esta evaluación, el estudiante será <b>reprogramado automáticamente para repetir el nivel</b>. 
</p>

&#128073; Para evitar retrocesos en su progreso, le solicitamos <b>reagendar la evaluación lo antes posible</b> en el siguiente enlace: <a href=https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones target=_blank> Haz clic aquí</a><br><br>Ahí podrá seleccionar el <b>horario que mejor se le acomode</b> y agendarla por su cuenta de forma rápida y sencilla.<br><br><hr> &#127919; En <b>English4Kids</b> creemos firmemente en el potencial de cada estudiante.<br><br>Con su apoyo, podemos asegurar que su hijo/a continúe avanzando con éxito. &#128170;&#127775;
    `;
  }

  // Copiar al portapapeles
  const tempEl = document.createElement("textarea");
  tempEl.style.position = "fixed"; // evitar scroll raro
  tempEl.style.opacity = "0";
  tempEl.value = message; // aquí va el string literal con &#
  document.body.appendChild(tempEl);
  tempEl.select();
  document.execCommand("copy");
  document.body.removeChild(tempEl);

  showPopup(
    `<h3>🎉 Success!</h3><p>Absent-Report for <b>${syllabus}</b> successfully copied ✅</p>`,
  );
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

function evaluatorsCopyResults() {
  // ---------- helpers ----------
  const safe = (s) =>
    s === null || s === undefined ? "" : String(s).replace(/\n/g, "<br>");
  const toNum = (v) => {
    const n = Number(String(v ?? "").trim());
    return Number.isNaN(n) ? NaN : n;
  };
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
  };

  // ---------- little getters ----------
  const getGrammarScore = () =>
    (
      document.getElementById("skilltest")?.value ||
      document.getElementById("grammarScore")?.value ||
      document.getElementById("grammarTest")?.value ||
      ""
    ).toString();

  const getOralScore = () =>
    (
      document.getElementById("totalscore")?.textContent ||
      document.getElementById("totalscore")?.value ||
      document.getElementById("oralScore")?.value ||
      document.getElementById("oralTotal")?.textContent ||
      ""
    ).toString();

  const getFinalScore = () =>
    (
      document.getElementById("finalScore")?.textContent ||
      document.getElementById("finalscore")?.textContent ||
      ""
    ).toString();

  // ---------- read DOM/state ----------
  const syllabus = document.getElementById("syllabusDropdown")?.value || "";
  const syllabusLower = syllabus.toLowerCase();
  const levelVal = Number(window.selectedlevel || 0);
  const weekVal = Number(window.selectedweek || 0);
  const totalScore = Number(window.totalScore ?? NaN);
  const finalScoreText = getFinalScore();
  const evaluatorName = (
    document.getElementById("evaluatorsDropdown")?.value ||
    document.getElementById("evaluatorsDropdown")?.selectedOptions?.[0]?.text ||
    ""
  ).trim();
  let evaluatorID =
    document.getElementById("evaluatorID")?.textContent?.trim() || "";
  if (!evaluatorID && window.evaluatorsData && evaluatorName) {
    const ev =
      (window.evaluatorsData &&
        window.evaluatorsData.evaluators &&
        window.evaluatorsData.evaluators[evaluatorName]) ||
      null;
    evaluatorID = ev ? String(ev[0]) : evaluatorID;
  }

  // ---------- isExit logic ----------
  const syllabusVal = syllabus || "";
  const isExit =
    !syllabusVal.startsWith("Juniors") &&
    ((levelVal === 10 && (weekVal === 7 || weekVal === 13)) ||
      (levelVal === 12 && weekVal === 3) ||
      (syllabusVal.includes("Masters") && levelVal === 10 && weekVal === 3) ||
      (syllabusLower.includes("adults (5hrs/week)") &&
        levelVal === 10 &&
        weekVal === 3)) &&
    !(
      (syllabusLower.includes("kids intensivo") &&
        levelVal === 10 &&
        weekVal === 7) ||
      (syllabusLower.includes("teens 13-17 (3hrs/week)") &&
        levelVal === 10 &&
        weekVal === 7)
    );

  // ---------- topics extraction (robust) ----------
  const approvedTopics = [];
  const reinforceTopics = [];
  const opportunityTopics = []; // {title, answer, correction}
  const sections = Array.from(document.querySelectorAll("#topicsList section"));

  sections.forEach((section, idx) => {
    const container = section.querySelector(".topic-container") || section;
    const title =
      container.querySelector(".topic-title h3")?.innerText?.trim() ||
      "Tema desconocido";

    // detect status by button class, fallback to topicsStatus
    const yesBtn = container.querySelector(".toggle-cell.yes");
    const noBtn = container.querySelector(".toggle-cell.no");
    let choice;
    if (yesBtn) choice = "yes";
    else if (noBtn) choice = "no";
    else
      choice =
        (window.topicsStatus && window.topicsStatus[String(idx)]) || undefined;

    if (choice === "yes") approvedTopics.push(title);
    if (choice === "no") reinforceTopics.push(title);

    const answerEl =
      container.querySelector(`#answer${idx}`) ||
      document.getElementById(`answer${idx}`);
    const corrEl =
      container.querySelector(`#correction${idx}`) ||
      document.getElementById(`correction${idx}`);
    const answerText = answerEl
      ? (answerEl.innerText || answerEl.textContent || "").trim()
      : "";
    const correctionText = corrEl
      ? (corrEl.innerText || corrEl.textContent || "").trim()
      : "";

    if (answerText !== "" || correctionText !== "") {
      opportunityTopics.push({
        title,
        answer: answerText,
        correction: correctionText,
      });
    }
  });

  // ---------- performance areas ----------
  const areas = [
    { id: "gr", label: "Gramática" },
    { id: "fl", label: "Fluidez" },
    { id: "pr", label: "Pronunciación" },
    { id: "co", label: "Comprensión" },
    { id: "in", label: "Entonación" },
  ];
  const desempeñoHTML = `<div class="desempeño">
      <table>
        <thead>
          <tr>
            <th colspan="2">&#128313; Desempeño por área&#128313;</th>
          </tr>
        </thead>
        <tbody>
          ${areas
            .map((a) => {
              const val = document.getElementById(a.id)?.value ?? "";
              return `<tr><td class="evalarea">${
                a.label
              }</td><td> ${describeScore(val)}</td></tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;

  // pronunciation  comments
  const pronunciationMistakes =
    document.getElementById("pronunciationMistakes")?.value?.trim() || "";
  const extraCommentsFallback =
    document.getElementById("extraComments")?.value?.trim() || "";

  const areaDetails = [];
  const inVal = toNum(document.getElementById("in")?.value ?? NaN);
  const flVal = toNum(document.getElementById("fl")?.value ?? NaN);

  if (!Number.isNaN(inVal) && inVal <= 1.0) {
    const txt = document.getElementById("incomment")?.value?.trim() || "";
    if (txt)
      areaDetails.push(`<tr><td class="tema-reforzar">Detalle de <b>Entonación:</b></td>
    </tr> <tr><td class="reforzar-R-C"> ${safe(txt)}</td></tr>`);
  }
  if (!Number.isNaN(flVal) && flVal <= 1.0) {
    const txt = document.getElementById("flcomment")?.value?.trim() || "";
    if (txt)
      areaDetails.push(`<tr><td class="tema-reforzar">Detalle de <b>fluidez:</b></td>
    </tr> <tr><td class="reforzar-R-C"> ${safe(txt)}</td></tr>`);
  }
  // === Preparación (Masters 2) – versión larga sin leer JSON ===
  const PREPARACION_MAP = {
    "No se preparó": `
        <tr>
        <td class="tema-reforzar">
        <b>Preparación para la exposición:</b> No se preparó
        </td>
        </tr>
        <tr>
        <td class="reforzar-R-C">
        Recuerda que la práctica es clave para mejorar tu inglés.
        Para la próxima,
        intenta revisar cada tema con anticipación y practicar hablando en voz
        alta.Puedes hacer resúmenes o responder preguntas sobre cada tema para
        sentirte más seguro. <br/>
        ¡Anímate a prepararte mejor la próxima vez!
        </td>
        </tr>`,
    "Se preparó, pero pudo hacerlo mejor": `
      <tr>
      <td class="tema-reforzar">
      <b>Preparación para la exposición:</b> Se preparó, pero pudo hacerlo mejor
      </td>
      </tr>
      <tr>
      <td class="reforzar-R-C">
      Hubo preparación de parte del estudiante, pero podría haber sido más claro
      y organizado en su exposición.
      Intenta practicar más con ejemplos y conectar mejor los temas.      
      Puedes hacer una lista de frases clave para cada estructura gramatical y
      repasarlas en voz alta antes de hablar.<br/>
      ¡Sigue practicando, estás mejorando!
      </td>
      </tr>`,
    "Se preparó bien y logró integrar la mitad o más de los temas": `
        <tr>
        <td class="tema-reforzar">
        <b>Preparación para la exposición:</b> Se preparó bien y logró integrar la
        mitad o más de los temas
        </td>
        </tr>
        <tr>
        <td class="reforzar-R-C">
        ¡Excelente trabajo! <br/>
        Lograste integrar varios temas gramaticales en tu
          exposición de manera clara y organizada.
        Tu uso de los tiempos verbales
          fue acertado, y tu fluidez ha mejorado mucho.
         Sigue practicando para
          perfeccionar tu entonación y confianza al hablar. <br/>
        ¡Sigue así, vas por muy
          buen camino!
        </td>
        </tr>`,
  };

  if (syllabusVal.includes("Masters 2")) {
    const txt = (document.getElementById("prepcomment")?.value || "").trim();
    if (txt) {
      const largo = PREPARACION_MAP[txt]; // coincide exacto con una de las 3 claves
      if (largo) {
        areaDetails.push(largo + "");
      } else {
        // fallback
        areaDetails.push(` ${safe(txt)}`);
      }
    }
  }

  // ---------- grammar/oral/final details for exit ----------
  const grammarScore = getGrammarScore();
  const oralScore = getOralScore();
  const finalDisplay =
    finalScoreText || (Number.isFinite(totalScore) ? String(totalScore) : "");

  console.log(
    "DEBUG isExit, finalDisplay, totalScore:",
    isExit,
    finalDisplay,
    totalScore,
  );

  // ---------- condicionado logic ----------
  const isCondicionado =
    document.getElementById("condicionado")?.checked === true;

  const condicionadoText = `
      <tr>
      <td class="tema-reforzar">
      <b>Condicionado/a:</b>
      </td>
      </tr>
      <tr>
      <td class="reforzar-R-C">
      <p>
      El estudiante pasa de nivel de manera condicionada, esto
      significa que debe practicar lo mencionado arriba para poder
      estar al día con sus compañeros del siguiente nivel. Por
      favor, lea cuidadosamente las recomendaciones.
      </p>

      <p><b>Recomendaciones:</b></p>
      <ul>
      <li>
      Escuchar música en inglés y ver videos o películas en
      inglés.
      </li>
      <li>
      Revisar el contenido disponible en nuestra plataforma de
      práctica y completar todas las actividades.
      </li>
      <li>
      Repetir las oraciones del día al menos 20 veces antes o
      después de clase.
      </li>
      <li>
      <a
      target="_blank"
      href="https://english4kids.pathwright.com"
      >Accede a la plataforma aquí</a
      >
      </li>
      </ul>
      </td>
      </tr>`;

  // ---------- Build full headers (complete texts) ----------
  // ---***EXIT*** Kids and teens---
  const header_pass_kids_teens = `
    <div class="welcome">
    <p class="h2">&#127881; ¡Felicidades, papás y mamás!</p>
    <!-- &#x1F31F; -->
    <p class="h3">Hoy celebramos juntos un <b>logro extraordinario</b></p>
    <p class="h4">
    Su hijo/a ha completado con éxito su curso de inglés, <br />
    superando cada reto con
    <b>dedicación, alegría y una constancia admirable.</b></p>
    <p class="h4">
    Durante este tiempo, no solo adquirió nuevas habilidades lingüísticas,
    sino que también desarrolló
    <b>confianza, disciplina y una mentalidad de superación</b> que le
    acompañará toda la vida.
    </p>
    <p class="h4">
    Este avance es fruto de su esfuerzo, del acompañamiento de ustedes y
    del compromiso de todo nuestro equipo English4kids. ¡Gracias por ser
    parte activa de este viaje y por inspirar a su pequeño/a a alcanzar la
    meta!
    </p>
    <p class="h4">
    <b>
    &#127775; Hoy, más que un curso terminado, celebramos el inicio de
    un futuro lleno de oportunidades.</b
    >
    </p>
    </div>
      `;
  const resultado_global_pass_kids_teens = `
    <div class="resultado-global">
    <p class="h2">¡Un gran paso hacia el dominio del idioma!</p>
    <p class="h3">
    Tu hijo/a ha alcanzado un nivel <br />
    intermedio de inglés (B1–B2)<br />
    <em style="font-size: 0.8rem; font-weight: 500"
    >Según el Marco Común Europeo (CEFR)</em
    >
    </p>
    <p>
    Estamos seguros de que este logro abrirá <br />muchas puertas para
    su futuro.
    </p>
    <div class="temas-dominados">
    <table>
    <thead>
    <th>Esto significa que es capaz de:</th>
    </thead>
    <tr>
    <td>
    &#10004; Comprender ideas principales en conversaciones claras
    </td>
    </tr>
    <tr>
    <td>&#10004; Expresar opiniones y relatar experiencias</td>
    </tr>
    <tr>
    <td>
    &#10004; Participar activamente en interacciones reales con
    seguridad y autonomía
    </td>
    </tr>
    </table>
    </div>
    </div>`;
  const header_fail_kids_teens = `
    <div class="welcome">
    <p class="h2">
    &#127919; Queremos reconocer la dedicación y el esfuerzo
    </p>
    <!-- &#x1F31F; -->
    <p class="h3">Tu hijo/a ha mostrado compromiso y participación en cada etapa del
    aprendizaje del inglés. ¡Cada paso cuenta! &#10024;</p>
    <p class="h4">
    En esta evaluación final,
    <b
    >aún no se ha alcanzado el nivel de dominio necesario para cerrar el
    curso satisfactoriamente</b
    >. Esto significa que algunas habilidades clave todavía están en proceso
    de fortalecimiento.
    </p>
    </div>
    `;

  const semanas4kidsteens = syllabusVal.includes("Masters") ? 4 : 8;

  const resultado_global_fail_kids_teens = `
    <div class="areas-oportunidad">
    <table>
    <tbody>
    <tr>
    <td class="tema-reforzar"><b>Siguientes Pasos</b></td>
    </tr>
    <tr>
    <td class="reforzar-R-C">
    No te desanimes: tu hijo/a tendrá una segunda oportunidad en
    <b>${semanas4kidsteens} semanas</b>. Será asignado/a nuevamente al mismo nivel,
    lo que le permitirá
    <b
    >repasar los contenidos, reforzar áreas clave y prepararse
    de la mejor manera </b
    >para aprobar en la próxima evaluación.
    </td>
    </tr>
    <tr>
    <td class="tema-reforzar">&#128218; <b>Nivel actual:</b></td>
    </tr>
    <tr>
    <td class="reforzar-R-C">
    Según el Marco Común Europeo de Referencia para las Lenguas
    (CEFR), tu hijo/a aún no alcanza el nivel intermedio (B1).
    Actualmente se encuentra en un nivel básico alto (A2) y
    necesita reforzar estructuras clave, comprensión auditiva y
    expresión oral fluida para avanzar al siguiente nivel.
    </td>
    </tr>
    <tr>
    <td class="tema-reforzar">&#128187; <b>Recomendación:</b></td>
    </tr>
    <tr>
    <td class="reforzar-R-C">
    Accede a nuestra plataforma <a href="https://english4kids.pathwright.com/library/" target="_blank"><b>Pathwright</b></a> para repasar
    los contenidos vistos, realizar actividades prácticas y
    fortalecer las habilidades necesarias para avanzar con
    seguridad.
    </td>
    </tr>
    <tr>
    <td class="tema-reforzar">
    &#128153; <b>Agradecimiento: </b>
    </td>
    </tr>
    <tr>
    <td class="reforzar-R-C">
    Gracias por acompañar este proceso. Con práctica constante y
    apoyo familiar, ¡estamos seguros de que muy pronto alcanzará
    el siguiente nivel!
    </td>
    </tr>
    </tbody>
    </table>
    </div>`;
  // ---***EXIT***ADULTS---
  const header_pass_adults = `
      <div class="welcome">
      <p class="h2">&#127881; ¡Felicidades!</p>
      <!-- &#x1F31F; -->
      <p class="h3">Hoy celebramos contigo un logro extraordinario</p>
      <p class="h4">
      Has completado con éxito tu curso de inglés, superando cada reto con
      dedicación, constancia y una admirable voluntad de aprendizaje.
      &#127942;&#10024;
      </p>
      <p class="h4">
      Durante este tiempo, no solo has fortalecido tus habilidades
      lingüísticas para desenvolverte en situaciones cotidianas con mayor
      seguridad y fluidez, sino que también has desarrollado confianza,
      disciplina y una mentalidad de superación que te acompañará en cada
      meta que te propongas.
      </p>
      <p class="h4">
      &#127775; Este avance es fruto de tu esfuerzo, de tu compromiso y de
      la determinación de seguir creciendo. Hoy no solo celebramos un curso
      terminado, sino el inicio de un futuro lleno de nuevas oportunidades
      para comunicarte, conectar y alcanzar tus sueños.
      </p>
      </div>   `;

  const header_fail_adults = `
    <div class="welcome">
    <p class="h2">Reconocemos tu esfuerzo y tu participación</p>
    <p class="h3">Cada paso que das en tu aprendizaje del inglés suma y te acerca
    más a tu meta.
    </p>
    <p class="h4"> En esta evaluación final,
    <b
    >aún no se ha alcanzado el nivel de dominio necesario para cerrar el
    curso satisfactoriamente</b
    >. Esto indica que algunas habilidades clave siguen en proceso de
    desarrollo.
    </p>
    </div>  `;

  const resultado_global_fail_adults = `
    <div class="areas-oportunidad">
    <table>
    <tbody>
    <tr>
    <td class="tema-reforzar"><b>Siguientes Pasos</b></td>
    </tr>
    <tr>
    <td class="reforzar-R-C">
    No te desanimes, tendrás una segunda oportunidad en
    <b>4 semanas</b> mientras repites el nivel. Esto te permitirá
    repasar los contenidos, reforzar áreas específicas y llegar
    con más seguridad a tu próxima evaluación.
    </td>
    </tr>
    <tr>
    <td class="tema-reforzar"><b>Recomendación:</b></td>
    </tr>
    <tr>
    <td class="reforzar-R-C">
    Accede a nuestra plataforma
    <a
    href="https://english4kids.pathwright.com/library/"
    target="_blank"
    ><b>Pathwright</b></a
    >
    para practicar actividades, revisar el material y fortalecer
    tus habilidades de forma dirigida.
    </td>
    </tr>
    <tr>
    <td class="tema-reforzar"><b>Mensaje finalo: </b></td>
    </tr>
    <tr>
    <td class="reforzar-R-C">
    Este resultado <b>no marca el final del camino</b>, sino una
    nueva oportunidad para avanzar. Con tu constancia y
    dedicación, estamos seguros de que muy pronto alcanzarás la
    meta.
    </td>
    </tr>
    </tbody>
    </table>
   </div>`;
  const resultado_global_pass_adults = `
    <div class="resultado-global">
    <p class="h2">¡Un gran paso hacia el dominio del idioma!</p>
    <p class="h3">
    Has alcanzado un nivel<br />
    A2 de inglés<br />
    <em style="font-size: 0.8rem; font-weight: 500"
    >Según el Marco Común Europeo (CEFR)</em
    >
    </p>
    <p>
    Estamos seguros de que este logro abrirá muchas puertas para tu
    futuro.
    </p>
    <div class="temas-dominados">
    <table>
    <thead>
    <th>Esto significa que puedes:</th>
    </thead>
    <tr>
    <td>
    &#10004; Comprender expresiones comunes y frases sobre temas
    cotidianos
    </td>
    </tr>
    <tr>
    <td>
    &#10004; Participar en conversaciones simples y directas
    </td>
    </tr>
    <tr>
    <td>
    &#10004; Hablar sobre experiencias personales, rutinas, y
    necesidades inmediatas
    </td>
    </tr>
    </table>
    </div>
    <p>
    ¡Te animamos a seguir practicando para avanzar al siguiente nivel!
    </p>
    </div>`;
  // ---***EXIT***JUNIORS---
  const header_pass_juniors = `
      <div class="welcome">
      <p class="h2">&#127881; ¡Felicidades, papás y mamás!</p>
      <!-- &#x1F31F; -->
      <p class="h3">Hoy celebramos junto a ustedes un logro muy especial</p>
      <p class="h4">
      Su hijo/a ha completado con éxito su curso de inglés, <br />
      superando cada reto con
      <b> compromiso, entusiasmo y constancia.</b>
      </p>
      <p class="h4">
      Durante este tiempo, ha demostrado un crecimiento notable en sus
      habilidades lingüísticas, ganando seguridad y confianza para
      comunicarse en inglés.
      </p>
      <p class="h4">
      &#x1F393; ¡Estamos muy orgullosos de su esfuerzo y dedicación!
      </p>
      <p class="h3">&#x1F4E2; Gran noticia:</p>
      <p class="h4">
      Su hijo/a ha alcanzado un nivel básico alto de inglés (A2), lo que
      significa que puede comprender conversaciones simples, participar en
      intercambios cortos y expresar ideas sobre su vida diaria e intereses
      de forma clara y sencilla.
      </p>
      <p class="h4">
      &#x1F3AF; Este es un paso firme hacia el dominio del idioma, y sienta
      una base sólida para seguir avanzando hacia niveles más altos.
      </p>
      </div>
    `;

  const header_fail_juniors = `

      <div class="welcome">
      <p class="h2">Queridos papás y mamás</p>
      <!-- &#x1F31F; -->
      <p class="h3">
      Tu hijo/a ha mostrado compromiso y participación en cada etapa del
      aprendizaje del inglés. ¡Cada paso cuenta! &#10024;
      </p>
      <p class="h4">
      En esta ocasión, su hijo/a
      <b>no logró aprobar la evaluación final del curso</b>, pero queremos
      reconocer el esfuerzo, la constancia y el compromiso que ha demostrado
      durante todo el programa. Cada intento es una oportunidad para
      aprender y avanzar.
      </p>
      <p class="h4">
      &#x1F4D8; Con práctica constante y refuerzo en las áreas clave,
      estamos seguros de que podrá superar este reto y alcanzar su meta.
      </p>

      <p class="h3">&#x1F504;<b> Siguientes pasos:</b></p>
      <p class="h4">
      Su hijo/a será asignado/a nuevamente al mismo nivel para reforzar los
      contenidos y habilidades que necesitan fortalecerse. Durante este
      periodo, trabajará en las áreas clave y, en <b>8 semanas</b>, será
      evaluado/a nuevamente para medir su progreso y confirmar que está
      listo/a para avanzar.
      </p>

      <p class="h3">&#x1F4DA;<b> Recomendación:</b></p>

      <p class="h4">
      Les invitamos a motivar a su hijo/a para que ingrese a nuestra
      plataforma <strong>Pathwright</strong>, donde encontrará actividades y
      recursos diseñados para reforzar los contenidos trabajados en clase.
      </p>

      <p class="h3">&#x1F499;<b> Mensaje final:</b></p>

      <p class="h4">
      Con apoyo en casa y dedicación en el estudio, estamos seguros de que
      muy pronto celebraremos juntos el logro de aprobar este curso.
      </p>
      </div>
    `;

  // ---NORMAL EVALUATIONS---
  let chosenSyllabus = syllabusLower.includes("adults")
    ? "English4Adults"
    : "English4Kids";
  const normal_pass_header = `
      <div class="welcome">
      <p class="h2">¡Te saludamos de ${chosenSyllabus}!</p>
      <!-- &#x1F31F; -->
      <p class="h3"> Esperamos que estés teniendo una excelente semana
      </p>
      </div> 
      `;
  const normal_fail_header = `
      <div class="welcome">
      <p class="h2">¡Te saludamos de ${chosenSyllabus}!</p>
      <!-- &#x1F31F; -->
      <p class="h3"> Esperamos que estés teniendo una excelente semana
      </p>
      </div>    `;

  const resultado_global_pass_normal = `
      <div class='resultado-global'>
      <p class='h2'>Resultado Global: Logrado</p>
      <p class='h3'>&#127881;¡Felicidades!&#127881; <br> Se está avanzando a un excelente ritmo.</p>
      <p>A continuación un informe detallado de la evaluación:</p>
    </div>`;
  const resultado_global_fail_normal = `
      <div class='resultado-global'>
      <p class='h2'>Resultado Global: No Logrado</p>
      <p class='h3'>Aunque aún no se ha alcanzado el objetivo, el esfuerzo cuenta y seguiremos avanzando juntos.</p>
      <p>A continuación un informe detallado de la evaluación:</p>
    </div>`;
  // ---------- SHOW NOTA FINAL for Exit (only if not juniors) ----------
  let detalleNotaHTML = "";
  if (isExit && !syllabusLower.startsWith("juniors")) {
    const g = safe(grammarScore) || "-";
    const o = safe(oralScore) || "-";
    const f = safe(finalDisplay) || "-";

    detalleNotaHTML = `
      <div class="temas-dominados">
        <table>
          <thead>
            <tr>
              <th><b>&#128313;Detalles de la nota&#128313;</b></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                &#128204; <b>Resultado Prueba Gramática:</b> ${g}/10<br />
                <em style="font-size: 0.8rem">&emsp;&emsp;(equivale a 40% de la nota final)</em>
              </td>
            </tr>
            <tr>
              <td>
                &#128204; <b>Resultado Prueba Oral:</b> ${o}/10<br />
                <em style="font-size: 0.8rem">&emsp;&emsp;(equivale a 60% de la nota final)</em>
              </td>
            </tr>
            <tr>
              <td style="font-weight: bold; text-align: center; border-bottom: 1px dotted #219fa6;">
              Nota Global: ${f}/10
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  let welcomeHTML = "";
  let resultadoGlobal = "";
  if (isExit) {
    // choose by syllabus and pass/fail
    const passedExit =
      finalDisplay !== "" &&
      !Number.isNaN(Number(finalDisplay)) &&
      Number(finalDisplay) >= 7;

    if (syllabusLower.includes("kids") || syllabusLower.includes("teens")) {
      welcomeHTML = passedExit
        ? header_pass_kids_teens
        : header_fail_kids_teens;
      resultadoGlobal = passedExit
        ? resultado_global_pass_kids_teens
        : resultado_global_fail_kids_teens;
    } else if (syllabusLower.includes("adults")) {
      welcomeHTML = passedExit ? header_pass_adults : header_fail_adults;
      resultadoGlobal = passedExit
        ? resultado_global_pass_adults
        : resultado_global_fail_adults;
    } else if (
      syllabusLower.startsWith("juniors") &&
      levelVal === 10 &&
      weekVal === 7
    ) {
      // Nuevo fix: aprobar/reprobar según el score real
      welcomeHTML =
        Number.isFinite(totalScore) && totalScore >= 7
          ? header_pass_juniors
          : header_fail_juniors;
      resultadoGlobal = passedExit
        ? resultado_global_pass_kids_teens
        : resultado_global_fail_kids_teens;
    } else {
      welcomeHTML = passedExit ? `` : ``;
    }
  } else {
    welcomeHTML =
      Number.isFinite(totalScore) && totalScore < 7
        ? normal_fail_header
        : normal_pass_header;
    resultadoGlobal =
      Number.isFinite(totalScore) && totalScore < 7
        ? resultado_global_fail_normal
        : resultado_global_pass_normal;
  }

  // ---------- build topics & opportunities HTML ----------
  const dominatedHTML = approvedTopics.length
    ? `<div class="temas-dominados">
      <table>
        <thead>
          <tr>
            <th><b>&#128313;Temas Dominados&#128313;</b></th>
          </tr>
        </thead>
        <tbody>
          ${approvedTopics
            .map((t) => `<tr><td>&#9989; ${safe(t)}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    </div>`
    : "";

  const reinforceHTML = reinforceTopics.length
    ? `<div class="temas-reforzar">
        <table>
          <thead>
            <tr>
              <th>&#128313; <b>Temas que aún necesita reforzar</b>&#128313;</th>
            </tr>
          </thead>
          <tbody>
            ${reinforceTopics
              .map((t) => `<tr><td>&#10004; ${safe(t)}</td></tr>`)
              .join("")}
          </tbody>
        </table>
      </div>`
    : "";
  const opportunityHTML = opportunityTopics.length
    ? `<div class="areas-oportunidad">
        <table>
          <thead>
            <tr>
              <th>&#128313;<b>Áreas de Oportunidad&#128313;</b></th>
            </tr>
          </thead>
          <tbody>
            ${opportunityTopics
              .map(
                (o) => `
                  <tr>
                    <td class="tema-reforzar"><b>Tema:</b> ${safe(o.title)}</td>
                  </tr>
                  ${
                    o.answer
                      ? `<tr><td class="reforzar-R-C">&#10060; Respuesta: ${safe(
                          o.answer,
                        )}</td></tr>`
                      : ""
                  }
                  ${
                    o.correction
                      ? `<tr><td class="reforzar-R-C">&#9989; Corrección: ${safe(
                          o.correction,
                        )}</td></tr>`
                      : ""
                  }`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`
    : "";

  const pronunciationHTML = pronunciationMistakes
    ? `<div class="pronunciacion-reforzar">
        <table>
          <thead>
            <tr>
              <th><b>&#128313;Pronunciación a reforzar&#128313;</b></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${safe(pronunciationMistakes)}</td>
            </tr>
          </tbody>
        </table>
      </div>`
    : "";
  const selectorComments = areaDetails.join("");
  const commentsFinal = selectorComments || extraCommentsFallback || "";
  const commentsHTML =
    commentsFinal || isCondicionado
      ? `<div class="areas-oportunidad">
        <table>
          <thead>
            <tr>
              <th>&#128313;<b>Comentarios del evaluador:&#128313;</b></th>
            </tr>
          </thead>
          <tbody>
           ${commentsFinal || ""}
            ${isCondicionado ? condicionadoText : ""}
          </tbody>
        </table>
      </div>`
      : "";
  // evaluator + survey + referidos
  // Determinar si mostramos el nombre del evaluador o lo tratamos como vacío
  const shouldHideEvaluator =
    evaluatorName && String(evaluatorName).startsWith("━");

  const surveyBaseFinal = syllabusLower.includes("adults")
    ? "https://e4cc.typeform.com/to/efJago3L#coach="
    : "https://e4cc.typeform.com/to/ovOnAdWx#coach=";

  const surveyLinkFinal =
    surveyBaseFinal + encodeURIComponent(evaluatorID || "");

  const evaluatorLine = shouldHideEvaluator
    ? ""
    : `<div class="Evaluator-referidos">
    <p class="h4">Tu evaluación fue realizada por</p>
    <p class="eval-name">${safe(evaluatorName || "error")}</p>
    <p class="body-eval-refer">
      Agradezco tu apoyo completando una breve encuesta de satisfacción para
      ayudarnos a mejorar nuestro servicio en el siguiente enlace:
    </p>
    <a href="${surveyLinkFinal}" target="_blank" class="evaluatorreferbtn"
      >Evalúame aquí</a>
       </div> `;

  //referidos text
  const referText = syllabusLower.includes("adults")
    ? ` <div class="referidos">
          <p style="font-weight: bold; font-size: 1.3rem; color: white">
          Refiere a tus amigos o familiares y obtén un 50% de descuento por cada
          referido que se inscriba.
          </p>
          <p style="font-size: 0.9rem; color: white">
          &#129490; &#10024; Por cada referido que se inscriba, obtienes 50% de
          descuento y tu referido también obtiene un 50% de descuento en su
          primer pago.
          </p>
          <p style="font-size: 1.3rem; font-weight: bold; color: white">
          ¡Entre más refieras, más ahorras y ayudas a otros a mejorar su futuro!
          </p>
          <p style="font-size: 0.9rem; color: white">
          &#128073; Para que tu referido obtenga el descuento, debe agendar una
          llamada con uno de nuestros asesores
          </p>
          <a
          href="https://www.english4kidsonline.com/amigo"
          target="_blank"
          class="referbtn"
          >
          REFIERE AQUÍ
          </a>
          </div> `
    : ` <div class="referidos" style="color: white">
          <p style='font-weight: bold; font-size: 1.3rem; color: white'> Refiere a otros padres y obtén un 50% de descuento por cada referido que se inscriba.</p>
          <p style='font-size: 0.9rem; color: white'>&#129490; &#10024; Si disfrutas nuestras clases, puedes ayudar a que más niños aprendan inglés y tengan mejores oportunidades en la vida. Tu referido también recibe un 50% de descuento en su primer pago.</p>
          <p style='font-size: 1.3rem; font-weight: bold; color: white'>Entre más refieras, más ahorras y más ayudas.</p>
          <p style='font-size: 0.9rem; color: white'>&#128073; Para que tu referido obtenga el descuento, debe agendar una llamada con uno de nuestros asesores</p>
          <a href='https://www.english4kidsonline.com/amigo' target='_blank' class='referbtn'> REFIERE AQUÍ </a>
          </div>`;

  //titulo
  const isDiagEval = // Kids Masters Level 2
    (syllabusLower.includes("kids masters") && levelVal === 2) ||
    // Teens Masters Level 2
    (syllabusLower.includes("teens masters") && levelVal === 2) ||
    // Kids Super Intensivos Level 2
    (syllabusLower.includes("kids (super intensivo)") && levelVal === 2) ||
    // Teens 5 horas Level 2
    (syllabusLower.includes("teens 13-17 (5hrs/week)") && levelVal === 2) ||
    // Juniors Level 4
    (syllabusLower.includes("juniors") && levelVal === 4);

  const tituloEvaluacion = isDiagEval
    ? `<p class="h1">RESULTADO DE EVALUACIÓN DIAGNÓSTICA</p>`
    : `<p class="h1">RESULTADO DE EVALUACIÓN FILTRO</p>`;
  
//===================================================
// Coaching Opportunity in RC
  const checkedInputs = document.querySelectorAll(".coachingOpportunity input:checked");


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
    <div class="areas-oportunidad">
      <table>
        <thead>
          <tr><th><b>Condición para avanzar al siguiente nivel</b></th></tr>
          <tr><td class="reforzar-R-C">
            Deberás completar el test de certificación en un plazo máximo de <b>5 días</b>.
          </td></tr>
        </thead>
        <tbody>`;

  checkedInputs.forEach(input => {
    const id = input.id;
    if (links[id]) {
      coachingHTML += `
        <tr><td class="tema-reforzar">
          Es necesario reforzar el tema de <b>${labels[id]}</b>.
        </td></tr>
        <tr><td class="reforzar-R-C">
          &#128279; <b>Accede al test aquí:</b>
          <a href="${links[id]}" target="_blank" rel="noopener noreferrer">Test de Certificación</a>
        </td></tr>`;
    }
  });

  coachingHTML += `
        </tbody>
        <tfoot>
          <tr><td>
            &#128197; Además, te invitamos a ingresar a nuestra plataforma interactiva
            <a href="https://english4kids.pathwright.com" target="_blank">Pathwright</a>
            &#128187;&#10024;, donde podrás reforzar tus aprendizajes en cualquier momento y a tu propio ritmo.
          </td></tr>
        </tfoot>
      </table>
    </div>`;
}


  //
  //===================================================================
  // ---------- final assembly ----------
  //===================================================================
  //
  let reportHTML = "";
  reportHTML += `<html lang="en">
     <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Monthly Evaluation Results</title>
      <!-- STYLE -->
      <style>
      .Evaluation-Results {
      margin: 0 auto;
      background: linear-gradient(to bottom,
      #f5ffff 10%,
      #aed6d6 60%,
      #1ca5ab 90%);
      background-color: #1ca5ab15;
      }

      .Evaluation-Results ul {
      list-style-type: circle;
      }

      .Evaluation-Results table {
      width: 80%;
      }

      .Evaluation-Results a {
      text-decoration: none;
      font-weight: bold;
      color: #147b7b;
      font-family: Verdana;
      }

      .Evaluation-Results table th {
      font-size: clamp(0.9rem, calc(50vw * 0.1), 1.6rem);
      font-family: Serif;
      font-weight: 800;
      color: #126064;
      text-align: center;
      padding: 1.7rem 0.5rem;
      border-bottom: 1px dotted #219fa6;
      }

      .Evaluation-Results table td {
      font-size: clamp(0.8rem, calc(50vw * 0.06), 0.95rem);
      font-family: Verdana;
      font-weight: 500;
      color: #305254;
      padding: 0.9rem 0.5rem 0.9rem calc(50vw * 0.13);
      border-bottom: 1px dotted rgba(28, 165, 171, 0.15);
      text-align: left;
      }

      .Evaluation-Results p {
      font-family: Verdana;
      font-size: clamp(0.8rem, calc(50vw * 0.06), 0.95rem);
      }

      /* =================HEADER=============== */
      .Evaluation-Results .header {
      background-color: #1ca5ab;
      text-align: center;
      height: auto;
      width: 100%;
      overflow: hidden;
      border-radius: 7px;
      }

      .Evaluation-Results .logos {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      margin: 0 0 -1rem;
      }

      .Evaluation-Results .logos img {
      height: 1.7rem;
      }

      .Evaluation-Results .header .h1 {
      font-size: clamp(0.5rem, calc(50vw * 0.08), 1.6rem);
      font-weight: 800;
      font-family: Tahoma;
      color: #ffffff;
      padding: 1rem 0.7rem;
      }

      /* =================WELLCOME=============== */
      .Evaluation-Results .welcome {
      justify-items: center;
      padding: 4rem 2rem;
      text-align: center;
      margin: 0 auto;
      }

      .Evaluation-Results .welcome .h2 {
      font-size: clamp(1.2rem, calc(50vw * 0.15), 2.5rem);
      font-weight: 800;
      color: #126064;
      font-family: Serif;
      }

      .Evaluation-Results .welcome .h3 {
      font-size: clamp(0.7rem, calc(50vw * 0.08), 1.2rem);
      font-weight: 800;
      color: #126064;
      padding-bottom: 0.8rem;
      font-family: Verdana;
      }

      .Evaluation-Results .welcome .h4 {
      font-size: clamp(0.95rem, calc(50vw * 0.08), 1rem);
      font-weight: 500;
      color: #126064;
      padding-bottom: 0.8rem;
      font-family: Verdana;
      }

      .Evaluation-Results .welcome p {
      font-weight: 400;
      color: #273030;
      padding: 0 1rem;
      }

      /* =================EMAIL BODY=============== */
      .Evaluation-Results .email-body {
      border-radius: 20px;
      padding: 2rem 1.5rem;
      box-shadow: 0 0 15px rgb(14, 126, 134, 0.1);
      width: 80%;
      margin: 0 auto;
      background-color: rgba(255, 255, 255, 0.95);
      max-width: 1200px;
      }

      .Evaluation-Results .resultado-global {
      padding: 0 1rem;
      text-align: center;
      }

      .Evaluation-Results .resultado-global .h2 {
      font-family: Serif;
      font-size: clamp(1.1rem, calc(50vw * 0.18), 2.1rem);
      font-weight: bold;
      color: #297b7f;
      text-shadow: 0 0 10px rgb(163, 225, 230, 0.15);
      }

      .Evaluation-Results .resultado-global .h3 {
      font-size: clamp(0.95rem, calc(50vw * 0.1), 1.2rem);
      font-weight: 800;
      font-family: Verdana;
      color: #42757b;
      padding: 2.5rem 0;
      }

      .Evaluation-Results .resultado-global p {
      font-weight: 500;
      font-family: Verdana;
      color: #273030;
      padding: 0 1rem 0;
      }

      /* -------DESEMPEÑO POR ÁREA------- */
      .Evaluation-Results .desempeño {
      padding: 0 1rem;
      justify-items: center;
      }

      .Evaluation-Results .desempeño table {
      border-radius: 10%;
      overflow: hidden;
      }

      .Evaluation-Results .desempeño table td:first-child {
      font-weight: 500;
      color: #126064;
      text-align: center;
      font-size: clamp(0.5rem, calc(50vw * 0.07), 1.1rem);
      width: 20%;
      }

      .Evaluation-Results .desempeño table td:last-child {
      font-weight: 500;
      border-bottom: 1px dotted rgba(28, 165, 171, 0.15);
      }

      /* -------TEMAS DOMINADOS------- */

      .Evaluation-Results .temas-dominados {
      margin: 2.8rem 0;
      justify-items: center;
      }

      .Evaluation-Results .temas-dominados table {
      border-radius: 10%;
      overflow: hidden;
      }

      .Evaluation-Results .temas-dominados table td {
      color: #044043;
      text-align: left;
      }

      .Evaluation-Results .temas-reforzar {
      margin: 2.8rem 0;
      justify-items: center;
      }

      .Evaluation-Results .temas-reforzar table {
      border-radius: 10%;
      overflow: hidden;
      }

      .Evaluation-Results .temas-reforzar table td {
      color: #044043;
      }

      .Evaluation-Results .areas-oportunidad {
      margin: 2.8rem 0;
      justify-items: center;
      }

      .Evaluation-Results .areas-oportunidad table {
      border-radius: 10%;
      overflow: hidden;
      }

      .Evaluation-Results .tema-reforzar {
      color: #126064;
      text-align: left;
      padding: 0.9rem 0.5rem 0.9rem 1.5rem;
      border-bottom: 1px dotted rgb(18, 96, 100, 0.8);
      }

      .Evaluation-Results .reforzar-R-C {
      text-align: left;
      font-family: Verdana;
      color: #052729;
      }

      .Evaluation-Results .pronunciacion-reforzar {
      margin: 2.8rem 0;
      justify-items: center;
      }

      .Evaluation-Results .pronunciacion-reforzar table {
      border-radius: 10%;
      overflow: hidden;
      }

      .Evaluation-Results .pronunciacion-reforzar table td {
      text-align: left;
      color: #114d50;
      }

      .Evaluation-Results .pronunciacion-reforzar table tr:first-child td {
      font-weight: 500;
      color: #355d5f;
      text-align: center;
      padding: 0.95rem 0;
      }

      /* =================FOOTER=============== */
      .Evaluation-Results .footer {
      font-family: verdana;
      margin: 2.5rem auto;
      padding: 2rem 0.5rem 2rem 2%;
      width: 85%;
      background-color: #1ca5ab30;
      }

      .Evaluation-Results .footer p {
      font-weight: bold;
      font-size: clamp(0.7rem, calc(50vw * 0.09), 1rem);
      color: #dbfeff;
      margin-bottom: -1rem;
      }

      .Evaluation-Results .footer h5 {
      color: #ffffff;
      font-size: clamp(0.8rem, calc(50vw * 1.1), 1.1rem);
      padding: 0 3rem;
      }

      /* =================REFERIDO=============== */
      .Evaluation-Results .Evaluator-referidos {
      border-radius: 20px;
      padding: 2rem 1.5rem;
      width: 50%;
      margin: 0 auto 4rem;
      background-color: rgba(255, 255, 255, 0.95);
      min-width: 300px;
      max-width: 1000px;
      text-align: center;
      }

      .Evaluation-Results .Evaluator-referidos p {
      color: #147b7b;
      padding: auto 2rem;
      }

      .Evaluation-Results .Evaluator-referidos .h4 {
      font-size: 1.25rem;
      font-weight: bold;
      }

      .Evaluation-Results .Evaluator-referidos .eval-name {
      font-size: 1.5rem;
      font-weight: 800;
      }

      .Evaluation-Results .Evaluator-referidos .evaluatorreferbtn {
      background-color: #147b7b;
      padding: 0.6rem 1.3rem;
      border-radius: 12px;
      font-weight: 800;
      color: white;
      font-size: 1.3rem;
      margin: 1rem auto;
      display: inline-block;
      }

      .Evaluation-Results .referidos {
      text-align: center;
      height: auto;
      padding: 2rem 0;
      font-family: Verdana;
      background-color: #147b7b;
      color: white;
      width: 100%;
      border-radius: 7px;
      }

      .Evaluation-Results .referidos p {
      padding: 0 1.8rem;
      }

      .Evaluation-Results .referbtn {
      display: inline-block;
      padding: 0.6rem 1.3rem;
      background: linear-gradient(to bottom,
      #aed6d6 0%,
      #ffffff 15%,
      #ffffff 85%,
      #aed6d6 100%);
      background-color: white;
      color: #147b7b;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1.4rem;
      }
      </style>
      </head>
    <body>
    <div class="Evaluation-Results">
      <!-- <!HEADER> -->
      <div class="header">
        <!-- <!LOGOS> -->
        <div class="logos">
          <img src="https://imgur.com/Qk6oytx.png" />
          <img src="https://imgur.com/tVvbCqV.png" />
          <img src="https://imgur.com/Duh9RGt.png" />
          <img src="https://imgur.com/68ZykjC.png" />
  </div>`;
  reportHTML += tituloEvaluacion;
  reportHTML += `</div>`;
  reportHTML += welcomeHTML;
  reportHTML += `<div class="email-body">`;
  reportHTML += resultadoGlobal;
  reportHTML += detalleNotaHTML;
  reportHTML += desempeñoHTML;
  reportHTML += dominatedHTML;
  reportHTML += reinforceHTML;
  reportHTML += opportunityHTML;
  reportHTML += pronunciationHTML;
  reportHTML += commentsHTML;
  reportHTML += coachingHTML;
  reportHTML += `</div>`;
  reportHTML += `<div class="footer">
                    <p>Atentamente,</p>
                    <h5>Departamento de <em>Evaluaciones</em> de English4Kids</h5>
                    </div>`;
  reportHTML += evaluatorLine;
  reportHTML += referText;
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
  navigator.clipboard
    .writeText(reportHTML)
    .then(() =>
      showPopup(
        "<h3>🎉 Success!</h3><p>✅ The Results have been copied to your clipboard!📝 </p>",
      ),
    )
    .catch(() =>
      showPopup(
        "<h3>😓 Oops...</h3><p>❌ The results couldn't be copied, please try again or contact Michelle Hernández via Teams.</p>",
      ),
    );
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

async function evaluatorsReloadPage() {
  const proceed = await confirmPopup(
    "<h3>Start again? 🤔</h3><p>We’ll reset everything so you can begin a fresh evaluation.</p><p><b>Are you sure you want to restart? 👀</b></p>",
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

    //refresh extra-comments
    refreshVisibleComments();
    updateExtraInfo();
    if (fluency) {
      fluency.dispatchEvent(new Event("change"));
    }
    if (intonation) {
      intonation.dispatchEvent(new Event("change"));
    }

    // Vaciar todos los textareas
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      textarea.value = "";
      skillTest.value = "";
    });

    // Resetear el total
    if (typeof updateTotalScore === "function") {
      updateTotalScore();
    }
    if (typeof calculateFinalScore === "function") {
      calculateFinalScore();
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

function showCoachingOpportunity() {
  const syllabus = syllabusE4E?.value || "";
  const level = levelE4E?.value || "";
  const totalScore = parseFloat(totalScoreEl?.textContent) || 0; // si quieres score

  // Condición para mostrar coaching
  const hasCoachingOpportunity =
    (syllabus.includes("Kids Intensivo") || syllabus.includes("Kids Super Intensivo")) &&
    ["2", "4", "7"].includes(level) &&
    totalScore <= 7; // incluye score si aplica

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

    if (closeBtn) closeBtn.style.display = "inline-block";
  } else{
    console.log("no PASA");
    evaluatorsCopyResults();
  }
}


//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//
