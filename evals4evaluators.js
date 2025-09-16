(() => {
  const version = "Evaluators";
  const versionnum = "1.0.2";
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
const finalScore = document.getElementById("finalScore");
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
//shows or hides exit evals content and shows condicionado
// updateExtraInfo (reordenada y defensiva)
function updateExtraInfo() {
  const syllabusVal = syllabusE4E?.value || "";
  const levelVal = parseInt(levelE4E?.value, 10) || 0;
  const weekVal = parseInt(weekE4E?.value, 10) || 0;

  // 1) Preparación (mostrar / poblar)
  const isprep = !!(
    syllabusVal && syllabusVal.toLowerCase().includes("masters 2")
  );

  if (prepCommentRow) {
    if (isprep) {
      prepCommentRow.classList.remove("hidden");
      // solo repoblar si está vacío (evita resetear)
      if (prepCommentRowEl && prepCommentRowEl.options.length === 0) {
        populatePreparation(prepCommentRowEl);
      }
    } else {
      prepCommentRow.classList.add("hidden");
      // if (prepCommentRowEl) prepCommentRowEl.innerHTML = "";
    }
  }

  // 2) Regla Exit (Juniors NO es exit)
  const isExit =
    !syllabusVal.startsWith("Juniors") &&
    ((levelVal === 10 && (weekVal === 8 || weekVal === 14)) ||
      (levelVal === 12 && weekVal === 4) ||
      (syllabusVal.includes("Masters") && levelVal === 10 && weekVal === 4));

  // 3) Mostrar/ocultar tabla Exit Evaluation
  if (exitevaltable) {
    exitevaltable.classList.toggle("hidden", !isExit);

    // si la tabla se oculta, resetear input de skillTest a vacío
    if (!isExit && skillTest) {
      skillTest.value = "";
      if (typeof calculateFinalScore === "function") calculateFinalScore();
    }
  }

  // 4) Ocultar/mostrar fila de total score cuando corresponde
  if (totalscorerow) {
    totalscorerow.classList.toggle("hidden", isExit);
  }

  // 5) Determinar condicionado (según isExit usamos finalScore; si no, totalscore)
  const messages = [];

  if (isExit) {
    const finalVal = finalScore ? parseFloat(finalScore.textContent) : NaN;
    if (!Number.isNaN(finalVal) && nearlyEqual(finalVal, 7)) {
      messages.push("Exit Condicionado ✅");
    }
  } else {
    const totalVal = totalScoreEl ? parseFloat(totalScoreEl.textContent) : NaN;
    if (!Number.isNaN(totalVal) && nearlyEqual(totalVal, 7)) {
      messages.push("Condicionado ✅");
    }
  }

  // 6) Actualizar DOM
  if (extraInfo) {
    extraInfo.innerHTML = messages.length ? messages.join("<br>") : "";
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

// Normaliza distintos formatos de datos a un array de items:
// - si data es array -> devuelve array de strings
// - si data es objeto { resumen: [html...] } -> devuelve array de { label, html }
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
// populatePreparation: llena el select de Preparación desde evaluatorsData
// Populate sólo para "Preparación" (sin placeholder)
// Populate exclusivo para "Preparación" (preserva selección previa)
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
    showPopup("<h3>😓 Oops...</h3><p>Please select a valid syllabus first.</p>");
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

  showPopup(`<h3>🎉 Success!</h3><p>Absent-Report for <b>${syllabus}</b> successfully copied ✅</p>`);
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
    // !syllabusVal.toLowerCase().startsWith("juniors") &&
    ((levelVal === 10 && (weekVal === 8 || weekVal === 14)) ||
      (levelVal === 12 && weekVal === 4) ||
      (syllabusVal.toLowerCase().includes("masters") &&
        levelVal === 10 &&
        weekVal === 4));

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
  const desempeñoHTML = areas
    .map((a) => {
      const val = document.getElementById(a.id)?.value ?? "";
      return `<b>${a.label}:</b> ${describeScore(val)}<br>`;
    })
    .join("");

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
      areaDetails.push(`<b>Detalle de Entonación:</b> ${safe(txt)}<br><br>`);
  }
  if (!Number.isNaN(flVal) && flVal <= 1.0) {
    const txt = document.getElementById("flcomment")?.value?.trim() || "";
    if (txt)
      areaDetails.push(`<b>Detalle de la fluidez:</b> ${safe(txt)}<br><br>`);
  }
  // if (syllabusVal.includes("Masters 2")) {
  //   const txt = document.getElementById("prepcomment")?.value?.trim() || "";
  //   if (txt) areaDetails.push(`<b>Preparación para la exposición:</b> ${safe(txt)}<br><br>`);
  // }
  // === Preparación (Masters 2) – versión larga sin leer JSON ===
  const PREPARACION_MAP = {
    "No se preparó": `<b>Preparación para la exposición: No se preparó</b><br>Recuerda que la práctica es clave para mejorar tu inglés. Para la próxima, intenta revisar cada tema con anticipación y practicar hablando en voz alta. Puedes hacer resúmenes o responder preguntas sobre cada tema para sentirte más seguro. ¡Anímate a prepararte mejor la próxima vez!`,
    "Se preparó, pero pudo hacerlo mejor": `<b>Preparación para la exposición: Se preparó, pero pudo hacerlo mejor</b><br>Hubo preparación de parte del estudiante, pero podría haber sido más claro y organizado en su exposición. Intenta practicar más con ejemplos y conectar mejor los temas. Puedes hacer una lista de frases clave para cada estructura gramatical y repasarlas en voz alta antes de hablar. ¡Sigue practicando, estás mejorando!`,
    "Se preparó bien y logró integrar la mitad o más de los temas": `<b>Preparación para la exposición: Se preparó bien y logró integrar la mitad o más de los temas</b><br>¡Excelente trabajo! Lograste integrar varios temas gramaticales en tu exposición de manera clara y organizada. Tu uso de los tiempos verbales fue acertado, y tu fluidez ha mejorado mucho. Sigue practicando para perfeccionar tu entonación y confianza al hablar. ¡Sigue así, vas por muy buen camino!`,
  };

  if (syllabusVal.includes("Masters 2")) {
    const txt = (document.getElementById("prepcomment")?.value || "").trim();
    if (txt) {
      const largo = PREPARACION_MAP[txt]; // coincide exacto con una de las 3 claves
      if (largo) {
        areaDetails.push(largo + "<br><br>");
      } else {
        // fallback
        areaDetails.push(
          `<b>Preparación para la exposición:</b> ${safe(txt)}<br><br>`,
        );
      }
    }
  }

  // ---------- grammar/oral/final details for exit ----------
  const grammarScore = getGrammarScore();
  const oralScore = getOralScore();
  const finalDisplay =
    finalScoreText || (Number.isFinite(totalScore) ? String(totalScore) : "");

  console.log('DEBUG isExit, finalDisplay, totalScore:', isExit, finalDisplay, totalScore);

  // ---------- condicionado logic ----------
  const isCondicionado =
    (isExit &&
      ( (finalDisplay !== "" && Math.abs(Number(finalDisplay) - 7) < 1e-6) ||
        (Number.isFinite(totalScore) && Math.abs(Number(totalScore) - 7) < 1e-6)
      )
    ) ||
    (!isExit &&
      Number.isFinite(totalScore) &&
      Math.abs(Number(totalScore) - 7) < 1e-6);


  const condicionadoText = `<b>Condicionado/a:</b> el estudiante pasa de nivel de manera condicionada, esto significa que debe practicar lo mencionado arriba para poder estar al día con sus compañeros del siguiente nivel. Por favor, lea cuidadosamente las recomendaciones.<br><br>
<b>Recomendaciones:</b><br><br>
<li>Escuchar música en inglés y ver videos o películas en inglés.</li>
<li>Revisar el contenido disponible en nuestra plataforma de práctica y completar todas las actividades.</li>
<li>Repetir las oraciones del día al menos 20 veces antes o después de clase.</li>
<li>Enlace para acceder a la plataforma: https://english4kids.pathwright.com</li><br><br>`;

  // // ---------- survey link ----------
  // const surveyBase = syllabusLower.includes("adults")
  //   ? "https://e4cc.typeform.com/to/efJago3L#coach="
  //   : "https://e4cc.typeform.com/to/ovOnAdWx#coach=";
  // const surveyLink = surveyBase + encodeURIComponent(evaluatorID || "");

  // ---------- Build full headers (complete texts) ----------
  const header_pass_kids_teens = `
<p><b>&#127881; ¡Felicidades, papás y mamás!</b></p>
<p>Hoy celebramos juntos un <b>logro extraordinario</b>: su hijo/a ha completado con éxito su curso de inglés, superando cada reto con <b>dedicación, alegría y una constancia admirable.</b> &#127942;&#10024;</p>
<p>Durante este tiempo, no solo adquirió nuevas habilidades lingüísticas, sino que también desarrolló <b>confianza, disciplina y una mentalidad de superación</b> que le acompañará toda la vida.</p>
<p>Este avance es fruto de su esfuerzo, del acompañamiento de ustedes y del compromiso de todo nuestro equipo English4kids. ¡Gracias por ser parte activa de este viaje y por inspirar a su pequeño/a a alcanzar la meta!</p>
<p><b> &#127775; Hoy, más que un curso terminado, celebramos el inicio de un futuro lleno de oportunidades.</b></p>
`;

  const header_fail_kids_teens = `
<p>&#127919; <b>Queremos reconocer</b> la dedicación y el esfuerzo</p>
<p>Tu hijo/a ha mostrado compromiso y participación en cada etapa del aprendizaje del inglés. ¡Cada paso cuenta! &#10024;</p>
<p>En esta evaluación final, <b>aún no se ha alcanzado el nivel de dominio necesario para cerrar el curso satisfactoriamente</b>. Esto significa que algunas habilidades clave todavía están en proceso de fortalecimiento.</p>
`;

  const header_pass_adults = `
    <p>&#127881; <b>¡Felicidades!</b></p>
    <p>Hoy celebramos contigo un logro extraordinario: has completado con éxito tu curso de inglés, superando cada reto con dedicación, constancia y una admirable voluntad de aprendizaje. &#127942;&#10024;</p>
  <p>Durante este tiempo, no solo has fortalecido tus habilidades lingüísticas para desenvolverte en situaciones cotidianas con mayor seguridad y fluidez, sino que también has desarrollado confianza, disciplina y una mentalidad de superación que te acompañará en cada meta que te propongas.</p>
  <p>&#127775; Este avance es fruto de tu esfuerzo, de tu compromiso y de la determinación de seguir creciendo. Hoy no solo celebramos un curso terminado, sino el inicio de un futuro lleno de nuevas oportunidades para comunicarte, conectar y alcanzar tus sueños.</p>
`;

  const header_fail_adults = `  
    <p><b>Reconocemos el esfuerzo y la participación</b> que has mostrado a lo largo de este programa. Cada paso que das en tu aprendizaje del inglés suma y te acerca más a tu meta.</p>
  <p>En esta evaluación final, <b>aún no se ha alcanzado el nivel de dominio necesario para cerrar el curso satisfactoriamente</b>. Esto indica que algunas habilidades clave siguen en proceso de desarrollo.</p> 

`;

  const header_pass_juniors = `
    <p>&#x1F389; <b>¡Felicidades, papás y mamás!</b></p>
    <p>Hoy celebramos junto a ustedes un logro muy especial: su hijo/a ha completado con éxito su curso de inglés, superando cada reto con compromiso, entusiasmo y constancia. &#x1F3C6;&#x2728;</p>
  <p>Durante este tiempo, ha demostrado un crecimiento notable en sus habilidades lingüísticas, ganando seguridad y confianza para comunicarse en inglés.</p>
  <p>&#x2728;&#x1F4D8;&#x1F393; ¡Estamos muy orgullosos de su esfuerzo y dedicación!</p>
  <p>&#x1F4E2; Gran noticia:</p>
  <p>Su hijo/a ha alcanzado un nivel básico alto de inglés (A2), lo que significa que puede comprender conversaciones simples, participar en intercambios cortos y expresar ideas sobre su vida diaria e intereses de forma clara y sencilla.</p>
  <p>&#x1F3AF; Este es un paso firme hacia el dominio del idioma, y sienta una base sólida para seguir avanzando hacia niveles más altos.</p> <hr>

`;

  const header_fail_juniors = `

  <p><b>Queridos papás y mamás:</b><br>
  En esta ocasión, su hijo/a no logró aprobar la evaluación final del curso, pero queremos reconocer el esfuerzo, la constancia y el compromiso que ha demostrado durante todo el programa. Cada intento es una oportunidad para aprender y avanzar.</p>
  <p>&#x1F4D8; Con práctica constante y refuerzo en las áreas clave, estamos seguros de que podrá superar este reto y alcanzar su meta.</p>
  <p>&#x1F504;<b> Siguientes pasos:</b></p>
  <p>Su hijo/a será asignado/a nuevamente al mismo nivel para reforzar los contenidos y habilidades que necesitan fortalecerse. Durante este periodo, trabajará en las áreas clave y, en <b>8 semanas</b>, será evaluado/a nuevamente para medir su progreso y confirmar que está listo/a para avanzar.</p>
  <p>&#x1F4DA;<b> Recomendación:</b></p>
  <p>Les invitamos a motivar a su hijo/a para que ingrese a nuestra plataforma <strong>Pathwright</strong>, donde encontrará actividades y recursos diseñados para reforzar los contenidos trabajados en clase.</p>
  <p>&#x1F499;<b> Mensaje final:</b></p>
  <p>Con apoyo en casa y dedicación en el estudio, estamos seguros de que muy pronto celebraremos juntos el logro de aprobar este curso.</p><hr>

`;

  // Normal eval header short
  const normal_pass_header = `&#9989;<b><u>Resultado Global:</u> Logrado, ¡felicidades! Sigue así.</b><br><br>¡Felicidades! Estás avanzando a un excelente ritmo. &#128170; &#127881;<hr>`;
  const normal_fail_header = `&#10060;<b><u>Resultado Global:</u> No lo logras aún, sigue esforzándote.</b><br><br>Aunque aún no se ha alcanzado el objetivo, el esfuerzo cuenta y seguiremos avanzando juntos.<hr>`;

  // ---------- details for Exit (only if not juniors) ----------
  let detailsHTML = "";
  if (isExit && !syllabusLower.startsWith("juniors")) {
    const g = safe(grammarScore) || "-";
    const o = safe(oralScore) || "-";
    const f = safe(finalDisplay) || "-";
    detailsHTML = `<b><u>Detalles de la nota:</u></b><br><br>
<b>- Resultado Prueba Gramática:</b> ${g}/10 <em>(equivale a 40% de la nota final)</em><br>
<b>- Resultado Prueba Oral:</b> ${o}/10 <em>(equivale a 60% de la nota final)</em><br>
<b>- Nota Global: </b>${f} de 10.0<br><br><hr>`;

    // add CEFR / next steps text for kids/teens/adults depending pass/fail
    if (
      (syllabusLower.includes("kids") || syllabusLower.includes("teens")) &&
      Number(f) >= 7
    ) {
      detailsHTML += `<p><b>Tu hijo/a ha alcanzado un nivel intermedio de inglés (B1–B2),</b> según el Marco Común Europeo (CEFR). Esto significa que es capaz de:</p>
<ul>
<li>&#10004; Comprender ideas principales en conversaciones claras</li>
<li>&#10004; Expresar opiniones y relatar experiencias</li>
<li>&#10004; Participar activamente en interacciones reales con seguridad y autonomía</li>
</ul>
<p><b> &#127919; ¡Un gran paso hacia el dominio del idioma! </b>Estamos seguros de que este logro abrirá muchas puertas para su futuro.</p><hr>`;
    } else if (
      (syllabusLower.includes("kids") || syllabusLower.includes("teens")) &&
      Number(f) < 7
    ) {
      detailsHTML += `<p>&#128170;<b> Siguientes pasos:</b></p>
<p>No te desanimes: tu hijo/a tendrá una segunda oportunidad en <b>8 semanas</b>. Será asignado/a nuevamente al mismo nivel, lo que le permitirá <b>repasar los contenidos, reforzar áreas clave y prepararse de la mejor manera </b>para aprobar en la próxima evaluación.</p>
<p>&#128218; <b>Nivel actual:</b></p>
<p>Según el Marco Común Europeo de Referencia para las Lenguas (CEFR), tu hijo/a aún no alcanza el nivel intermedio (B1). Actualmente se encuentra en un nivel básico alto (A2) y necesita reforzar estructuras clave, comprensión auditiva y expresión oral fluida para avanzar al siguiente nivel.</p>
<p>&#128187; <b>Recomendación:</b></p>
<p>Accede a nuestra plataforma <strong>Pathwright</strong> para repasar los contenidos vistos, realizar actividades prácticas y fortalecer las habilidades necesarias para avanzar con seguridad.</p>
<p>&#128153; <b>Agradecimiento: </b></p>
<p>  Gracias por acompañar este proceso. Con práctica constante y apoyo familiar, ¡estamos seguros de que muy pronto alcanzará el siguiente nivel!
</p>
hr>`;
    } else if (syllabusLower.includes("adults") && Number(f) >= 7) {
      detailsHTML += `<p>&#127757; <b>Has alcanzado un nivel A2 de inglés</b> según el Marco Común Europeo (CEFR), lo que significa que puedes:</p>
<ul>
<li>&#10004; Comprender expresiones comunes y frases sobre temas cotidianos</li>
<li>&#10004; Participar en conversaciones simples y directas</li>
<li>&#10004; Hablar sobre experiencias personales, rutinas, y necesidades inmediatas</li>
</ul>
<p>&#128079; ¡Te animamos a seguir practicando para avanzar al siguiente nivel!</p><hr>`;
    } else if (syllabusLower.includes("adults") && Number(f) < 7) {
      detailsHTML += `<p>&#128259; <b>Siguientes pasos:</b></p>
<p>Tendrás una segunda oportunidad en <b>4 semanas</b>, repitiendo el nivel. Esto te permitirá repasar los contenidos, reforzar áreas específicas y llegar con más seguridad a tu próxima evaluación.</p>
<p>&#128187; <b>Recomendación:</b></p>
<p>Accede a nuestra plataforma <b>Pathwright</b> para practicar actividades, revisar el material y fortalecer tus habilidades de forma dirigida.</p>
<p>&#128153; <b>Mensaje final:</b></p>
<p>Este resultado no marca el final del camino, sino una nueva oportunidad para avanzar. Con tu constancia y dedicación, estamos seguros de que muy pronto alcanzarás la meta.</p><hr>`;
    }
  }

  // ---------- Normal eval: choose simple header ----------
  // let headerHTML = "";
  // if (isExit) {
  //   // choose by syllabus and pass/fail
  //   const passedExit =
  //     finalDisplay !== "" &&
  //     !Number.isNaN(Number(finalDisplay)) &&
  //     Number(finalDisplay) >= 7;
  //   if (syllabusLower.includes("kids") || syllabusLower.includes("teens"))
  //     headerHTML = passedExit ? header_pass_kids_teens : header_fail_kids_teens;
  //   else if (syllabusLower.includes("adults"))
  //     headerHTML = passedExit ? header_pass_adults : header_fail_adults;
  //   else if (syllabusLower.startsWith("juniors"))
  //     headerHTML = totalScore ? header_pass_juniors : header_fail_juniors;
  //   else
  //     headerHTML = passedExit
  //       ? `<p>&#127881; ¡Felicidades!</p>`
  //       : `<p>Resultado reprobatorio</p>`;
  // } else {
  //   headerHTML =
  //     Number.isFinite(totalScore) && totalScore < 7
  //       ? normal_fail_header
  //       : normal_pass_header;
  // }
  let headerHTML = "";
  if (isExit) {
    // choose by syllabus and pass/fail
    const passedExit =
      finalDisplay !== "" &&
      !Number.isNaN(Number(finalDisplay)) &&
      Number(finalDisplay) >= 7;

    if (syllabusLower.includes("kids") || syllabusLower.includes("teens")) {
      headerHTML = passedExit ? header_pass_kids_teens : header_fail_kids_teens;
    } else if (syllabusLower.includes("adults")) {
      headerHTML = passedExit ? header_pass_adults : header_fail_adults;
    } else if (
      syllabusLower.startsWith("juniors") &&
      levelVal === 10 &&
      weekVal === 8
    ) {
      // Nuevo fix: aprobar/reprobar según el score real
      headerHTML =
        Number.isFinite(totalScore) && totalScore >= 7
          ? header_pass_juniors
          : header_fail_juniors;
    } else {
      headerHTML = passedExit
        ? `<p>&#127881; ¡Felicidades!</p>`
        : `<p></p>`;
    }
  } else {
    headerHTML =
      Number.isFinite(totalScore) && totalScore < 7
        ? normal_fail_header
        : normal_pass_header;
  }

  // ---------- build topics & opportunities HTML ----------
  const dominatedHTML = approvedTopics.length
    ? approvedTopics.map((t) => `&#9989; ${safe(t)}<br>`).join("") + "<br>"
    : "Aún no hay temas dominados.<br><br>";
  const reinforceHTML = reinforceTopics.length
    ? reinforceTopics.map((t) => `&#10004; ${safe(t)}<br>`).join("") + "<br>"
    : "¡Ningún tema para reforzar!<br><br>";
  const opportunityHTML = opportunityTopics.length
    ? opportunityTopics
        .map(
          (o) =>
            `&#128073; <b>Tema:</b> ${safe(o.title)}<br>${o.answer ? `&#10060; Respuesta: ${safe(o.answer)}<br>` : ""}${o.correction ? `&#9989; Corrección: ${safe(o.correction)}<br>` : ""}<br>`,
        )
        .join("")
    : "¡Ninguno en esta evaluación!<br><br>";

  const pronunciationSection = pronunciationMistakes
    ? `${safe(pronunciationMistakes)}<br><br>`
    : "¡Ninguna en esta evaluación!<br><br>";
  const selectorComments = areaDetails.join("");
  const commentsFinal = selectorComments || extraCommentsFallback || "";

  // evaluator + survey + referidos
 // Determinar si mostramos el nombre del evaluador o lo tratamos como vacío
const shouldHideEvaluator = evaluatorName && String(evaluatorName).startsWith("━");

const surveyBaseFinal = syllabusLower.includes("adults")
  ? "https://e4cc.typeform.com/to/efJago3L#coach="
  : "https://e4cc.typeform.com/to/ovOnAdWx#coach=";

const surveyLinkFinal = surveyBaseFinal + encodeURIComponent(evaluatorID || "");

const evaluatorLine = shouldHideEvaluator
  ? ""
  : `Tu evaluación fue realizada por <b>${safe(evaluatorName || "error")}</b>. Agradezco tu apoyo completando una breve encuesta de satisfacción para ayudarnos a mejorar nuestro servicio en el siguiente enlace: <a href="${surveyLinkFinal}" target="_blank">Haz clic aquí</a>.<br><br>`;


  //referidos text
  const referText = syllabusLower.includes("adults")
    ? `&#128483; &#10024; <b>¿Te gustan nuestras clases?</b> Puedes invitar a tus amigos o familiares a aprender inglés con nosotros. Por cada referido que se inscriba, obtienes 50% de descuento. Tu referido también obtiene un 50% de descuento en su primer pago. ¡Refiere, ahorra y ayuda a otros a mejorar su futuro!<br><br>&#128073; Tu referido debe agendar una llamada con uno de nuestros asesores en el siguiente enlace: <a href="https://www.english4adultsonline.com/amigo" target="_blank">www.english4adultsonline.com/amigo</a> &#128170;`
    : `&#129490; &#10024; Si te gustan nuestras clases, puedes ayudar a que más niños aprendan inglés y obtén 50% de descuento por cada referido que se inscriba. Tu referido también obtiene 50% de descuento en su primer pago. &#128073; Agenda llamada: <a href="https://www.english4kidsonline.com/amigo" target="_blank">www.english4kidsonline.com/amigo</a> &#128153;`;

  // ---------- final assembly ----------
  let reportHTML = "";
  reportHTML += headerHTML;
  reportHTML += detailsHTML;
  reportHTML += `&#128313; <b>Desempeño por área:</b><br><br>${desempeñoHTML}<br><hr>`;
  reportHTML += `<div>&#x1f4d8; <b>Temas Dominados:</b><br><br>${dominatedHTML}</div><hr>`;
  reportHTML += `<div>&#x1f7e1; <b>Temas que aún necesita reforzar:</b><br><br>${reinforceHTML}</div><hr>`;
  reportHTML += `<div>&#128204; <b>Áreas de Oportunidad:</b><br><br><b><u>Errores de gramática:</u></b><br><br>${opportunityHTML}</div>`;
  reportHTML += `<br><b><u>Pronunciación a reforzar:</u></b><br><br>${pronunciationSection}<hr>`;
  reportHTML += `<b><u>Comentarios del evaluador:</u></b><br><br>${commentsFinal}`;
  if (isCondicionado) reportHTML += `<br>${condicionadoText}`;
  reportHTML += `<br>${evaluatorLine}<br>`;
  reportHTML += referText;

  // ---------- preview ----------
  const popupContent = document.querySelector("#popupContent");
  if (popupContent) {
    popupContent.innerHTML = `<div class="results-preview"><h2>Evaluation Results</h2><div class="preview-wrapper">${reportHTML}</div></div>`;

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
    .then(() => showPopup("<h3>🎉 Success!</h3><p>✅ The Results have been copied to your clipboard!📝 </p>"))
    .catch(() =>
      showPopup("<h3>😓 Oops...</h3><p>❌ The results couldn't be copied, please try again or contact Michelle Hernández via Teams.</p>",
      ),
    );
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

//new
async  function evaluatorsReloadPage() {
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

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//
