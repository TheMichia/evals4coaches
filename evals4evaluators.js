(() => {
  const version = "Evaluators";
  const versionnum = "1.5.0";
  //fixed isfiltereval logic for master's to masters && topic descriptions matched on lowercase
  const E4EjsonVersion = 2.0;
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

let topicBreakdown = {};
let topicBreakdownLoaded = false;

// Carga inicial del JSON
async function loadTopicBreakdown() {
  try {
    const response = await fetch(`topicsBreakdown.json?v=${Date.now()}`);
    const data = await response.json();
    console.log("✅ JSON cargado:", data); // Verifica todo el objeto
    topicBreakdown = data["Topic Breakdown"] || {};
    topicBreakdownLoaded = true;
    console.log("📦 topicBreakdown procesado:", topicBreakdown);
  } catch (err) {
    console.error("❌ Error loading topic breakdown:", err);
  }
}

// Llamamos a la función al inicio
loadTopicBreakdown();

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
    message = `<html lang="en">

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
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERADULTS.png" alt="Resultado - Evaluación Filtro" style="width: 100%; display: block; border: 0">
    </div>
    <div class="welcome" style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
      <p class="h2"
        style="padding: 0 1rem; font-size: 2.5rem; font-weight: 800; color: #126064; font-family: Serif; margin: 0;">
        Estimado estudiante,</p>
      <!-- &#x1F31F; -->
      <p class="h3"
        style="padding: 0 1rem; font-size: 1.2rem; font-weight: 800; color: #126064; padding-bottom: 0.8rem; font-family: Verdana;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>
    <div class="email-body"
      style="border-radius: 20px; padding: 2rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">
      <div class="resultado-global" style="padding: 0 1rem; text-align: center;">
        <p
          style="padding: 1rem 1rem 0; font-size: 1.2rem; text-decoration: none; font-family: verdana; color: #297b7f; font-weight: bold; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0.2rem;">
          Te informamos que:
        </p>
        <p
          style="padding: 0 1rem 0; font-family: Verdana; font-weight: bold; color: #297b7f; font-size: 1.5rem; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0.5rem;">
          No asististe a tu evaluación filtro.
        </p>
        <p
          style="font-size: 1.1rem; font-weight: 500; padding: 0 1rem 0; color: #126064; font-family: Verdana; MARGIN: 1rem 0;">
          correspondiente a tu
          nivel en
          <b>${syllabus}</b>.
        </p>
      </div>
      <!-- PORQUE ES IMPORTANTE -->
      <div style="margin: 2rem 0">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 10%; border: none; overflow: hidden; margin-top: 1rem; background-color: #f9fafb;"
          bgcolor="#f9fafb">
          <tr>
            <th
              style="font-weight: 800; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 1.15rem; padding: 1rem; color: #126064; border: none; font-family: verdana;"
              align="center">
              <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 2.5rem; margin-right: 0.2rem"></span>
              Para evitar retrocesos en tu progreso, te solicitamos
              <b>reagendar la evaluación lo antes posible</b>
            </th>
          </tr>
          <tr>
            <td
              style="font-size: 0.95rem; font-family: Verdana; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); padding: 0.9rem 2rem; font-weight: 500; color: #044043; text-align: center;"
              align="center">
              <p style="font-family: Verdana; font-size: 0.95rem; margin: 1rem">
                Esta evaluación es <b>obligatoria para avanzar al siguiente nivel</b> del programa.<br><br>&#9888;&#65039; Dado que te encuentras en un
                <b>nivel filtro</b>, si no presentas esta evaluación, serás
                <b>reprogramado automáticamente para repetir el nivel</b>.
              </p>
              <a href=https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones target=_blank
                style="text-decoration: none; font-family: Verdana; background-color: #147b7b; padding: 1rem 1.3rem; border-radius: 12px; font-weight: 800; color: white; font-size: 1.2rem; margin: 1rem 1rem;; display: inline-block;">
                Reagenda tu
                Evaluación Aquí</a>
              <p style="font-family: Verdana; font-size: 0.85rem; margin: 0">
                Ahí podrás seleccionar el
                <b>horario que mejor se acomode</b> y agendarla por tu cuenta de forma rápida y sencilla.<br>
              </p>
            </td>
          </tr>
        </table>
      </div>
      <!-- TU ESFUERXO CUENTA -->
      <div style="margin: 2rem 0">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 10%; overflow: hidden; margin-top: 2rem; background-color: #f9fafb;"
          bgcolor="#f9fafb">
          <tr>
            <TH
              style="font-size: 1.1rem; font-family: Verdana; padding: 1rem 0.5rem 0; font-weight: 500; color: #044043; text-align: center; border-top: 1px dotted #219fa6;"
              align="center"> En <b>ENGLISH4ADULTS</b>,</TH>
          </tr>
          <tr>
            <td
              style="font-size: 1rem; font-family: Verdana; padding: 1rem 0.5rem 0.8rem; font-weight: 500; color: #044043; text-align: center; border-bottom: 1px dotted #219fa6;"
              align="center">
              Creemos firmemente en tu potencial.<br>
                Con tu compromiso, podemos asegurarnos de que <b>sigas avanzando con éxito</b>.

            </td>
          </tr>
          <tr>
            <td
              style="font-size: 0.95rem; font-family: Verdana; font-weight: 500; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5vw; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: center;"
              align="center">
              <p style="font-family: Verdana; font-size: 0.95rem; margin: 3rem 4rem;">

              </p>
            </td>
          </tr>
        </table>
      </div>
      <!-- referal -->
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
          font-family: Verdana;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        ">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerAdults.png" alt="Atentamente, equipo de English4Adults" style="width: 100%; display: block; border: 0">


    </div>
  </div>
</body>

</html>
    `;
  } else {
    // ---- mensaje para padres ----
    message = `<html lang="en">

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
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERKIDS.png" alt="Resultado - Evaluación Filtro" style="width: 100%; display: block; border: 0">
    </div>
    <div class="welcome" style="justify-items: center; padding: 0rem 2rem; text-align: center; margin: 0 auto;">
      <p class="h2"
        style="padding: 0 1rem; font-size: 2.5rem; font-weight: 800; color: #126064; font-family: Serif; margin: 0;">
        Estimado padre/madre de familia,</p>
      <!-- &#x1F31F; -->
      <p class="h3"
        style="padding: 0 1rem; font-size: 1.2rem; font-weight: 800; color: #126064; padding-bottom: 0.8rem; font-family: Verdana;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>
    <div class="email-body"
      style="border-radius: 20px; padding: 2rem 1.5rem; box-shadow: 0 0 15px rgb(14, 126, 134, 0.1); width: 80%; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); max-width: 1200px;">
      <div class="resultado-global" style="padding: 0 1rem; text-align: center;">
        <p
          style="padding: 1rem 1rem 0; font-size: 1.2rem; text-decoration: none; font-family: verdana; color: #297b7f; font-weight: bold; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0.2rem;">
          Te informamos que:
        </p>
        <p
          style="padding: 0 1rem 0; font-family: Verdana; font-weight: bold; color: #297b7f; font-size: 1.5rem; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0.5rem;">
          Tu hijo/a no asististió a su evaluación filtro.
        </p>
        <p
          style="font-size: 1.1rem; font-weight: 500; padding: 0 1rem 0; color: #126064; font-family: Verdana; MARGIN: 1rem 0;">
          correspondiente a su
          nivel en
          <b>${syllabus}</b>.
        </p>
      </div>
      <!-- PORQUE ES IMPORTANTE -->
      <div style="margin: 2rem 0">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 10%; border: none; overflow: hidden; margin-top: 1rem; background-color: #f9fafb;"
          bgcolor="#f9fafb">
          <tr>
            <th
              style="font-weight: 800; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 1.15rem; padding: 1rem; color: #126064; border: none; font-family: verdana;"
              align="center">
              <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="height: 2.5rem; margin-right: 0.2rem"></span>
              Para evitar retrocesos en su progreso, te solicitamos
              <b>reagendar la evaluación lo antes posible</b>
            </th>
          </tr>
          <tr>
            <td
              style="font-size: 0.95rem; font-family: Verdana; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); padding: 0.9rem 2rem; font-weight: 500; color: #044043; text-align: center;"
              align="center">
              <p style="font-family: Verdana; font-size: 0.95rem; margin: 1rem">
                Esta evaluación es <b>obligatoria para avanzar al siguiente nivel</b> del programa.<br><br>&#9888;&#65039; Dado que se encuentra en un
                <b>nivel filtro</b>, si no presenta esta evaluación, el estudiante será
                <b>reprogramado automáticamente para repetir el nivel</b>.
              </p>
              <a href=https://meetings.hubspot.com/evaluacionese4kidse4adults/evaluaciones target=_blank
                style="text-decoration: none; font-family: Verdana; background-color: #147b7b; padding: 1rem 1.3rem; border-radius: 12px; font-weight: 800; color: white; font-size: 1.2rem; margin: 1rem 1rem;; display: inline-block;">
                Reagenda su
                Evaluación Aquí</a>
              <p style="font-family: Verdana; font-size: 0.85rem; margin: 0">
                Ahí podrás seleccionar el
                <b>horario que mejor se acomode</b> y agendarla por tu cuenta de forma rápida y sencilla.<br>
              </p>
            </td>
          </tr>
        </table>
      </div>
      <!-- TU ESFUERXO CUENTA -->
      <div style="margin: 2rem 0">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 10%; overflow: hidden; margin-top: 2rem; background-color: #f9fafb;"
          bgcolor="#f9fafb">
          <tr>
            <TH
              style="font-size: 1.1rem; font-family: Verdana; padding: 1rem 0.5rem 0; font-weight: 500; color: #044043; text-align: center; border-top: 1px dotted #219fa6;"
              align="center">
              <b>En
                    <span style="
                        color: #233046;
                        font-family: verdana;
                        font-size: 1.1rem;
                      ">ENGLISH<span style="color: #ec6619">4</span><span style="color: #95c021">K</span><span style="color: #f18c29">I</span><span style="color: #eb5854">D</span><span style="color: #1da5aa">S</span></b>,
            </TH>
          </tr>
          <tr>
            <td
              style="font-size: 1rem; font-family: Verdana; padding: 1rem 0.5rem 0.8rem; font-weight: 500; color: #044043; text-align: center; border-bottom: 1px dotted #219fa6;"
              align="center">
              Creemos firmemente en el potencial de cada estudiante.
              <br>
                Con tu apoyo, podemos asegurar que tu hijo/a <b>siga avanzando con éxito</b>.

            </td>
          </tr>
          <tr>
            <td
              style="font-size: 0.95rem; font-family: Verdana; font-weight: 500; color: #305254; padding: 0.9rem 0.5rem 0.9rem 6.5vw; border-bottom: 1px dotted rgba(28, 165, 171, 0.15); text-align: center;"
              align="center">
              <p style="font-family: Verdana; font-size: 0.95rem; margin: 3rem 4rem;">

              </p>
            </td>
          </tr>
        </table>
        <!-- referal -->
        <a href="https://www.english4kidsonline.com/amigo" target="_blank"
          style="display:inline-block; margin:0; text-decoration:none;">
          <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/refKids.gif"
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
          font-family: Verdana;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        ">
      <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerKids.png" alt="Atentamente, equipo de English4Kids" style="width: 100%; display: block; border: 0">


    </div>
  </div>
</body>

</html>
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

async function evaluatorsCopyResults() {
  // Espera hasta que topicBreakdown esté listo
  while (!topicBreakdownLoaded) {
    console.log("⏳ Esperando que topicBreakdown cargue...");
    await new Promise((res) => setTimeout(res, 100)); // espera 100ms
  }

  console.log("✅ topicBreakdown cargado, generando RC");
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
  const desempeñoHTML = `
  <div class="desempeño" style="padding: 0 1rem; justify-items: center;">
    <table style="width: 80%; border-radius: 10%; overflow: hidden;" width="80%">
      <thead>
        <tr>
          <th colspan="2"
            style="font-size: 1.6rem; font-family: Serif; font-weight: 800; color: #126064; text-align: center; padding: 1.7rem 0.5rem; border-bottom: 1px dotted #219fa6;"
            align="center">&#128313; Desempeño por área&#128313;</th>
        </tr>
        </thead>
        <tbody>
          ${areas
            .map((a) => {
              const val = document.getElementById(a.id)?.value ?? "";
              return ` <tr>
          <td class="evalarea"
            style="font-family: Verdana; padding: 0.5rem 0.5rem 0.9rem 10%; border-bottom: 1px dotted #DCF8FA; font-weight: 500; color: #126064; text-align: center; font-size: 1.1rem; width=30%"
            width="40%" align="center">${a.label}</td>
          <td
            style="font-size:0.95rem; font-family: Verdana; color: #305254; padding: 0.9rem 0.5rem 0.9rem 10%; text-align: left; font-weight: 500; border-bottom: 1px dotted #DCF8FA;"
            align="left"> ${describeScore(val)}</td></tr>`;
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
    "DEBUG isExit:",
    isExit,
    "finalscore",
    finalDisplay,
    "totalScore:",
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
       <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
      <p
        style="padding: 0 1rem; font-size:2rem; font-weight: 800; color: #126064; font-family: Serif; margin: 0.5rem 0;">
        ¡Te saludamos de ${chosenSyllabus}!</p>
      <!-- &#x1F31F; -->
      <p
        style="padding: 0 1rem; font-size: 1rem; font-weight: 800; color: #126064; margin-top: 0;padding-bottom: 0.5rem; font-family: Verdana;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>
      `;
  const normal_fail_header = `
       <div style="justify-items: center; padding: 0 2rem; text-align: center; margin: 0 auto;">
      <p
        style="padding: 0 1rem; font-size:2rem; font-weight: 800; color: #126064; font-family: Serif; margin: 0.5rem 0;">
        ¡Te saludamos de ${chosenSyllabus}!</p>
      <!-- &#x1F31F; -->
      <p
        style="padding: 0 1rem; font-size: 1rem; font-weight: 800; color: #126064; margin-top: 0;padding-bottom: 0.5rem; font-family: Verdana;">
        Esperamos que estés teniendo una excelente semana</p>
    </div>
    `;
  // Class Paths
  // Helper
  const includesAny = (text, arr) =>
    arr.some((item) => text.includes(item.toLowerCase()));

  // Mapping centralizado
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

  // Resolver
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

  let resultado_global_pass_normal = `
    <div class="resultado-global" style="padding: 0 1rem; text-align: center;">
        <img src="${S_ClassPath}" style="width:80%; margin-bottom: 1rem;">
       <p
      style="font-weight: bold; font-family: Verdana; font-size: 0.85rem; color: #506d6d; margin: 0 0 0.5rem 0; padding: 0 1rem;">
      ${syllabusVal} | Nivel ${levelVal}
    </p>

    <p
      style="padding: 0 1rem 0; font-size: 2rem; text-decoration: none; font-family: verdana; color: #297b7f; font-weight: bold; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0;">
      Evaluación Aprobada
    </p>

    <p class="h3"
      style="font-size: 1.2rem; font-weight: 800; font-family: Verdana; color: #42757b; padding: 2.5rem 0;">
      &#127881;¡Felicidades!&#127881; <br>
      Se está avanzando a un excelente ritmo.
    </p>

    <p style="font-size:0.95rem; font-weight: 500; padding: 0 1rem 0; color: #126064; font-family: Verdana;">
      A continuación un informe detallado de la evaluación:
    </p>
  </div>
  `;

  let resultado_global_fail_normal = ` 
  <div class="resultado-global" style="padding: 0 1rem; text-align: center;">
          <img src="${S_ClassPath}" style="width:80%; margin-bottom: 1rem;">
          <p
            style="font-weight: bold; font-family: Verdana; font-size: 0.85rem; color: #506d6d; margin: 0 0 0.5rem 0; padding: 0 1rem 2.8rem;">
            ${syllabusVal} | Nivel ${levelVal}
          </p>
          <p
            style="padding: 2rem 1rem 0; font-size: 2rem; text-decoration: none; font-family: verdana; color: #297b7f; font-weight: bold; text-shadow: 0 0 10px rgba(163, 225, 230, 0.15); margin: 0;">
            Evaluación No Lograda
          </p>

          <p class="h3" style="font-size: 1rem; font-weight: 800; font-family: Verdana; color: #42757b; padding: 0;">
            Aunque aún no se ha alcanzado el objetivo, el esfuerzo cuenta y seguiremos trabajando para mejorar.
          </p>

          <p style="font-size:0.95rem; font-weight: 500; padding: 0 1rem 0; color: #126064; font-family: Verdana;">
            A continuación un informe detallado de la evaluación:
          </p>
        </div>
`;

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

  //--extra sections
  let porqueEsImportante = ``;
  if (totalScore < 7) {
    // REPROBADO
    porqueEsImportante = `  <!-- PORQUE ES IMPORTANTE -->
      <div style="margin: 4rem auto; justify-items: center;">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 10%; border: none; overflow: hidden; margin-top: 1rem; background-color: #f9fafb;"
          bgcolor="#f9fafb">
          <tr>
            <th
              style="font-weight: 800; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 1.15rem; padding: 1rem; color: #126064; border: none; font-family: verdana;"
              align="center">
              <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 2.5rem; margin-right: 0.2rem"></span>
              ¿Por qué es importante reconocer sus avances?
            </th>
          </tr>
          <tr>
            <td
              style="font-size:0.95rem; font-family: Verdana; border-bottom: 1px dotted #DCF8FA; padding: 0.9rem 2rem; font-weight: 500; color: #044043; text-align: center;"
              align="center">
              <p style="font-family: Verdana; font-size:0.95rem; margin: 0 0 0.5rem 0;">
                Porque cada logro, por pequeño que parezca, <B>acerca a tu hijo/a a la meta</B>. <br>Conocer su progreso
                nos
                permite seguir celebrando lo que ya domina y, al mismo tiempo, <B>trazar el camino para mejorar lo que
                aún está en desarrollo</B>.
              </p>

            </td>
          </tr>
        </table>
      </div>`;
  } else {
    porqueEsImportante = `<!-- PORQUE ES IMPORTANTE -->
      <div style="margin: 4rem auto; justify-items: center;">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 10%; border: none; overflow: hidden; margin-top: 1rem; background-color: #f9fafb;"
          bgcolor="#f9fafb">
          <tr>
            <th
              style="font-weight: 800; border-bottom: 1px dotted #219fa6; text-align: center; font-size: 1.15rem; padding: 1rem; color: #126064; border: none; font-family: verdana;"
              align="center">
              <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/message%20and%20light%20bulb.png" style="width: 2.5rem; margin-right: 0.2rem"></span>
              ¿Por qué es clave saber sus logros?
            </th>
          </tr>
          <tr>
            <td
              style="font-size:0.95rem; font-family: Verdana; border-bottom: 1px dotted #DCF8FA; padding: 0.9rem 2rem; font-weight: 500; color: #044043; text-align: center;"
              align="center">
              <p style="font-family: Verdana; font-size:0.95rem; margin: 0 0 0.5rem 0;">
              <p>Te permite <b>ver su progreso</b>, <b>celebrar cada avance</b> y
                <b>acompañarlo en su aprendizaje</b>.
              </p>
              <p>Cada paso <b>refuerza su confianza</b> y lo prepara para
                <b>comunicarse con seguridad</b> y <b>pensar en grande</b>.
              </p>

              </p>
            </td>
          </tr>
        </table>
      </div>`;
  }

  let tuEsfuerzoCuenta = `<!-- TU ESFUERZO CUENTA -->
      <div style="margin: 4rem 0; justify-items: center;">
        <table width="80%" align="center" cellspacing="0" cellpadding="0"
          style="width: 80%; border-collapse: collapse; border-radius: 10%; overflow: hidden; margin-top: 0.5rem; background-color: #f9fafb;"
          bgcolor="#f9fafb">
          <tr>
            <th
              style="font-family: Serif; font-weight: 800; text-align: center; font-size: 1.5rem; padding: 1rem; color: #126064; border-top: 1px dotted #219fa6; border-bottom: none;"
              align="center">
              &#10024; ¡Tu esfuerzo cuenta! &#10024;
            </th>
          </tr>
          <tr>
            <td
              style="font-size:0.95rem; font-family: Verdana; padding: 0.7rem 0.5rem; font-weight: 500; color: #044043; text-align: center; border-bottom: 1px dotted #219fa6;"
              align="center">
              <p style="font-family: Verdana; font-size:0.95rem;">
                Cada mes tu hijo/a <b>avanza más</b> y estamos
                <b>muy orgullosos de su progreso</b>.
              </p>
              <p style="font-family: Verdana; font-size:0.95rem;">
                Queremos que
                <b>aprenda inglés con confianza y entusiasmo</b>, dando un <b>paso firme en cada clase</b>.
              </p>
            </td>
          </tr>
        </table>
      </div>`;
  if (totalScore < 7) {
    tuEsfuerzoCuenta = ``;
  }

  // ---------- build topics & opportunities HTML ----------

  const dominatedHTML = approvedTopics.length
    ? `
    <!-- TEMAS DOMINADOS -->
    <div style="margin: 1.5rem 0; justify-items: center;">
      <table style="width: 80%; border-radius: 10%; overflow: hidden;" width="80%">
        <thead>
          <tr>
            <th
              style="font-size: 1.6rem; font-family: Serif; font-weight: 800; color: #126064; text-align: center; padding: 1.7rem 0.5rem; border-bottom: 1px dotted #219fa6;"
              align="center"><b>&#128313;Temas Dominados&#128313;</b></th>
          </tr>
        </thead>
        <tbody>
        ${approvedTopics
  .map((topic) => {
    const topicKey = topic.toLowerCase();

    // Buscar dentro del breakdown ignorando mayúsculas/minúsculas
    const matchedKey = Object.keys(topicBreakdown)
      .find((k) => k.toLowerCase() === topicKey);

    const topicDescription = matchedKey
      ? topicBreakdown[matchedKey]
      : "";

              return `
                <tr>
                  <td
                    style="font-family: Verdana; border-bottom: 1px dotted #DCF8FA; text-align: left; padding: 1rem 0 0.2rem 5%; font-size: 1.05rem; font-weight: 600; color: #126064;"
                    align="left">
                    &#9989; ${safe(topic)}
                  </td>
                </tr>
                <tr>
                  <td
                    style="font-family: Verdana; font-weight: 500; text-align: left; padding: 0.3rem 0 1rem 13%; border-bottom: 1px dotted #DCF8FA; color: #044043; font-size: 0.9rem;"
                    align="left">
                    ${topicDescription}
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
    ${porqueEsImportante}
    `
    : "";

  const reinforceHTML = reinforceTopics.length
    ? ` <div class="temas-reforzar" style="margin: 1rem 0; justify-items: center;">
        <table style="width: 80%; border-radius: 10%; overflow: hidden;" width="80%">
          <thead>
            <tr>
              <th
                style="font-size: 1.6rem; font-family: Serif; font-weight: 800; color: #126064; text-align: center; padding: 1.7rem 0.5rem; border-bottom: 1px dotted #219fa6;"
                align="center">
                &#128313; <b>Temas que aún necesita reforzar</b>&#128313;
              </th>
            </tr>
          </thead>
        <tbody>
          ${reinforceTopics
  .map((topic) => {
    const topicKey = topic.toLowerCase();

    // Match insensible a mayúsculas
    const matchedKey = Object.keys(topicBreakdown)
      .find((k) => k.toLowerCase() === topicKey);

    const topicDescription = matchedKey
      ? topicBreakdown[matchedKey]
      : "";

    return `<tr>
              <td
                style="font-family: Verdana; border-bottom: 1px dotted #DCF8FA; text-align: left; padding: 1rem 0 0.2rem 5%; font-size: 1rem; font-weight: 600; color: #126064;"
                align="left">
                &#10004; ${safe(topic)}</td>
                      </tr>
                      <tr>
              <td
                style="font-family: Verdana; font-weight: 500; text-align: left; padding: 0.3rem 0 1rem 13%; border-bottom: 1px dotted #DCF8FA; color: #044043; font-size: 0.9rem;"
                align="left">${topicDescription}</td>
                      </tr>`;
            })
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
      </div>
      ${tuEsfuerzoCuenta}
      `
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
    : `
    <!-- EVALUATORS Referal -->
      <div style="margin: 2rem auto 0; padding: 1rem 0">
        <div
          style="border-radius: 20px; padding: 2rem 1.5rem; width: 80%; margin: 2rem auto; background-color: rgba(255, 255, 255, 0.95); min-width: 300px; max-width: 1000px; text-align: center;">
          <p
            style="font-family: Verdana; color: #147b7b; padding: auto 2rem; font-size: 1.25rem; font-weight: bold;">
            Tu
            evaluación fue realizada por</p>
          <p
            style="font-family: Verdana; color: #147b7b; padding: auto 2rem; font-size: 1.5rem; font-weight: 800;">
                  ${safe(evaluatorName || "error")}</p>
          <p
            style="font-family: Verdana; color: #147b7b; padding: auto 2rem; font-size: 1rem; font-weight: bold;">
            Gracias por tu tiempo y confianza.</p>
          <p
            style="font-family: Verdana; font-size:0.95rem; color: #147b7b; padding: auto 2rem;">
            Te invitamos a completar una breve encuesta de satisfacción para ayudarnos a seguir mejorando nuestro
            servicio.
          </p>
          <a href="${surveyLinkFinal}" target="_blank"
            style="text-decoration: none; font-family: Verdana; background-color: #147b7b; padding: 0.6rem 1.3rem; border-radius: 12px; font-weight: 800; color: white; font-size: 1.3rem; margin: 1rem auto; display: inline-block;">Evalúame
            aquí</a>
        </div>
      </div> `;

  //referidos text
  const referText = syllabusLower.includes("adults")
    ? ` <!-- referal -->

      <h1
        style="font-size: 1.6rem; font-family: Serif; font-weight: 800; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
        align="center">¡Has recibido un cupón de ahorro!</h1>
          <a href="https://www.english4kidsonline.com/amigo" target="_blank"
            style="display:inline-block; margin:0; text-decoration:none;">
            <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/referalAdults.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
          </a> `
    : ` <!-- referal -->
        <h1
          style="font-size: 1.6rem; font-family: Serif; font-weight: 800; color: #126064; text-align: center;  border-bottom: 1px dotted #219fa6; margin:5rem auto 0.5rem;"
          align="center">¡Has recibido un cupón de ahorro!</h1>
          <a href="https://www.english4kidsonline.com/amigo" target="_blank"
            style="display:inline-block; margin:0; text-decoration:none;">
            <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Referal/refKids.gif"
             alt="Refiere Aquí"
             style="width: 100%; display:block; margin:0 auto; border:0;">
          </a>`;

  //===================================================
  // Coaching Opportunity in RC
  const checkedInputs = document.querySelectorAll(
    ".coachingOpportunity input:checked",
  );

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

    checkedInputs.forEach((input) => {
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

  //headers & footers
  // ---HEADERS & FOOTERS---

  // Adults vs Kids assets
  const adultsHeader =
    "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERADULTS.png";
  const adultsFooter =
    "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerAdults.png";

  const kidsHeader =
    "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Headers/HEADERKIDS.png";
  const kidsFooter =
    "https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/EmailAssets/Footers/footerKids.png";
  const avanceMotivacionAdults = ` <!--avance -->
  <div style="margin: 4rem 0; justify-items: center; ">
    <table width="80%" align="center" cellspacing="0" cellpadding="0"
      style="width: 80%; border-collapse: collapse; border-radius: 10%; overflow: hidden; margin-top: 2rem; background-color: #f9fafb;">
      <tr>
        <th
          style="font-family: Serif; font-weight: 800; text-align: center; font-size: 1.5rem; padding: 1rem; color: #126064; border-top: 1px dotted #219fa6; border-bottom: none;"
          align="center">&#128171;¡Estás avanzando
          increíblemente en tu camino al inglés!&#128171;
        </th>
      </tr>
      <tr>
        <td
          style="font-size:0.95rem; font-family: Verdana; padding: 0.7rem 0.5rem; font-weight: 500; color: #044043; text-align: center; border-bottom: 1px dotted #219fa6;"
          align="center">
          <p style="font-family: Verdana; font-size:0.95rem;">
          <p><b>Has avanzado increíblemente</b>, y en el siguiente nivel fortalecerás tu confianza, usarás
            expresiones naturales y comprenderás conversaciones más fluidas.</p>
          <p><b>Nuestro objetivo:</b> que aprendas inglés con seguridad y entusiasmo, abriendote puertas a nuevas
            oportunidades.</p>

          </p>
        </td>
      </tr>
    </table>
  </div>`;
  const avanceMotivacionKids = ` <!--avance -->
  <div style="margin: 4rem 0; justify-items: center; ">
    <table width="80%" align="center" cellspacing="0" cellpadding="0"
      style="width: 80%; border-collapse: collapse; border-radius: 10%; overflow: hidden; margin-top: 2rem; background-color: #f9fafb;">
      <tr>
        <th
          style="font-family: Serif; font-weight: 800; text-align: center; font-size: 1.5rem; padding: 1rem; color: #126064; border-top: 1px dotted #219fa6; border-bottom: none;"
          align="center">&#128171;¡Tu hijo avanza
          increíblemente en su camino al inglés!&#128171;
        </th>
      </tr>
      <tr>
        <td
          style="font-size:0.95rem; font-family: Verdana; padding: 0.7rem 0.5rem; font-weight: 500; color: #044043; text-align: center; border-bottom: 1px dotted #219fa6;"
          align="center">
          <p style="font-family: Verdana; font-size:0.95rem;">
          <p><b>Tu hijo/a ha avanzado increíblemente</b>, y en el siguiente nivel fortalecerá su confianza, usará
            expresiones naturales y comprenderá conversaciones más fluidas.</p>
          <p><b>Nuestro objetivo:</b> que aprenda inglés con seguridad y entusiasmo, abriendo puertas a nuevas
            oportunidades.</p>

          </p>
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

  let avanceMotivacion =
    totalScore >= 7
      ? syllabusLower.includes("adults")
        ? avanceMotivacionAdults
        : avanceMotivacionKids
      : syllabusLower.includes("adults")
        ? avanceMotivacionFailAdults
        : avanceMotivacionFailKids;

  //===================================================================
  //IS FILTER / ISFILTEREVAL LOGIC

  const isFilterEval =
    (syllabus === "Juniors 5-7" &&
      [7, 9].includes(levelVal) &&
      weekVal === 7) ||
    (syllabus === "Kids (Intensivo) 8-12" &&
      [2, 4, 7, 9].includes(levelVal) &&
      weekVal === 13) ||
    (syllabus === "Kids (Super Intensivo) 8-12" &&
      [4, 7, 9].includes(levelVal) &&
      weekVal === 7) ||
    (syllabus === "Kids Masters" &&
      [4, 8].includes(levelVal) &&
      weekVal === 3) ||
    (syllabus === "Kids Masters 2" &&
      [4, 8].includes(levelVal) &&
      weekVal === 3) ||
    (syllabus === "Teens 13-17 (3hrs/week)" &&
      [2, 4, 7, 9].includes(levelVal) &&
      weekVal === 13) ||
    (syllabus === "Teens 13-17 (5hrs/week)" &&
      [4, 7, 9].includes(levelVal) &&
      weekVal === 7) ||
    (syllabus === "Teens Masters" &&
      [4, 8].includes(levelVal) &&
      weekVal === 3) ||
    (syllabus === "Teens Masters 2" &&
      [4, 8].includes(levelVal) &&
      weekVal === 3) ||
    (syllabus === "Adults (3hrs/week)" &&
      [5, 8].includes(levelVal) &&
      weekVal === 3) ||
    (syllabus === "Adults (5hrs/week)" &&
      [5, 8].includes(levelVal) &&
      weekVal === 3) ||
    (syllabus === "Adults Masters (3hrs/week)" &&
      [5, 8].includes(levelVal) &&
      weekVal === 3) ||
    (syllabus === "Adults Masters (5hrs/week)" &&
      [5, 8].includes(levelVal) &&
      weekVal === 3);

  let willLearn = [];
  let nextFilter = "";
  let weeksToRepeat = "";

  if (syllabus === "Juniors 5-7") {
    weeksToRepeat = "8";
    if (levelVal === 7 && weekVal === 7) {
      willLearn = [
        "Futuro Simple (Going to)",
        "Futuro Simple (Will)",
        "Repaso de Tiempos Gramaticales Básicos",
      ];
      nextFilter = "9";
    }
    if (levelVal === 9 && weekVal === 7) {
      willLearn = ["Repaso de Tiempos Gramaticales Básicos"];
      nextFilter = "10"; // último
    }
  }

  if (syllabus === "Kids (Intensivo) 8-12") {
    weeksToRepeat = "8";
    if (levelVal === 2 && weekVal === 13) {
      willLearn = [
        "Futuro Simple (Going to)",
        "Futuro Simple (Will)",
        "Pasado Simple",
      ];
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
      willLearn = [
        "Presente Perfecto",
        "Repaso de Tiempos Gramaticales Básicos",
      ];
      nextFilter = "10"; // último
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
      nextFilter = "10"; // último
    }
  }

  if (syllabus === "Kids Masters") {
    weeksToRepeat = "4";
    if (levelVal === 4 && weekVal === 3) {
      willLearn = [
        "Superlativos",
        "Presente Perfecto",
        "Presente Perfecto Progresivo",
      ];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = ["Repaso de Tiempos Gramaticales Básicos"];
      nextFilter = "10"; // último
    }
  }

  if (syllabus === "Kids Masters 2") {
    weeksToRepeat = "4";
    if (levelVal === 4 && weekVal === 3) {
      willLearn = [
        "Presente Perfecto Progresivo",
        "Repaso de Tiempos Gramaticales Básicos",
      ];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = [
        "Futuro Perfecto",
        "Modales perfectos",
        "Repaso de Tiempos Gramaticales Básicos",
      ];
      nextFilter = "10"; // último
    }
  }

  if (syllabus === "Teens 13-17 (3hrs/week)") {
    weeksToRepeat = "8";
    if (levelVal === 2 && weekVal === 13) {
      willLearn = [
        "Pasado Simple",
        "Pasado Progresivo",
        "Repaso de Tiempos Gramaticales Básicos",
      ];
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
      nextFilter = "10"; // último
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
      willLearn = [
        "Presente Perfecto Progresivo",
        "Repaso de Tiempos Gramaticales Básicos",
      ];
      nextFilter = "10"; // último
    }
  }

  if (syllabus === "Teens Masters") {
    weeksToRepeat = "4";
    if (levelVal === 4 && weekVal === 3) {
      willLearn = [
        "Superlativos",
        "Presente Perfecto",
        "Presente Perfecto Progresivo",
      ];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = ["Futuro Perfecto", "Repaso de Tiempos Gramaticales Básicos"];
      nextFilter = "10"; // último
    }
  }

  if (syllabus === "Teens Masters 2") {
    weeksToRepeat = "4";
    if (levelVal === 4 && weekVal === 3) {
      willLearn = [
        "Superlativos",
        "Presente Perfecto",
        "Presente Perfecto Progresivo",
      ];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = ["Futuro Perfecto", "Repaso de Tiempos Gramaticales Básicos"];
      nextFilter = "10"; // último
    }
  }

  if (syllabus === "Adults (3hrs/week)") {
    weeksToRepeat = "4";
    if (levelVal === 5 && weekVal === 3) {
      willLearn = ["Pasado Progresivo", "Pasado Simple", "Repaso General"];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = [
        "Modales: Can / Should",
        "Comparativos y Superlativos",
        "Repaso General",
      ];
      nextFilter = "12"; // último
    }
  }

  if (syllabus === "Adults (5hrs/week)") {
    weeksToRepeat = "4";
    if (levelVal === 5 && weekVal === 3) {
      willLearn = ["Pasado Progresivo", "Pasado Simple", "Repaso General"];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = [
        "Modales: Can / Should",
        "Comparativos y Superlativos",
        "Repaso General",
      ];
      nextFilter = "12"; // último
    }
  }

  if (syllabus === "Adults Masters (3hrs/week)") {
    weeksToRepeat = "4";
    if (levelVal === 5 && weekVal === 3) {
      willLearn = [
        "Presente Perfecto",
        "Condicionales",
        "Deseos (I wish / If only)",
      ];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = [
        "Used to",
        "Deseos en Presente y Futuro (I wish / If only)",
        "Voz Pasiva",
      ];
      nextFilter = "12"; // último
    }
  }

  if (syllabus === "Adults Masters (5hrs/week)") {
    weeksToRepeat = "4";
    if (levelVal === 5 && weekVal === 3) {
      willLearn = [
        "Presente Perfecto",
        "Condicionales",
        "Deseos (I wish / If only)",
      ];
      nextFilter = "8";
    }
    if (levelVal === 8 && weekVal === 3) {
      willLearn = [
        "Used to",
        "Deseos en Presente y Futuro (I wish / If only)",
        "Voz Pasiva",
      ];
      nextFilter = "12"; // último
    }
  }

  let loQueAprendera = ``;

  if (isFilterEval && totalScore > 6.9) {
    loQueAprendera = `<!-- lo que aprenderá -->
      <div class="temas-dominados" style="margin: 1rem 0; justify-items: center;">
        <table style="width: 80%; border-radius: 10%; overflow: hidden; background-color: #FCFCFA;" width="80%">
          <thead>
            <tr>
              <th
                style="font-size: 1.3rem; font-family: Verdana; font-weight: 800; color: #126064; text-align: center; padding: 1.5rem 0.5rem; border-bottom: 1px dotted #219fa6;"
                align="center">
                <b>
                  <span><img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/bell.png" style="width: 2.5rem; margin-right: 0.2rem"></span>
                  ¿Qué aprenderá antes del próximo nivel filtro?
                </b>
              </th>
            </tr>
          </thead>
          <tbody>
            ${willLearn
                  .map((topic) => {
                    const topicKey = topic.toLowerCase();

                    // Match insensible a mayúsculas
                    const matchedKey = Object.keys(topicBreakdown)
                      .find((k) => k.toLowerCase() === topicKey);

                    const topicDescription = matchedKey
                      ? topicBreakdown[matchedKey]
                      : "";

                    return `
                <tr>
                  <td
                    style="font-family: Verdana; border-bottom: 1px dotted #DCF8FA; text-align: left; padding: 1rem 0 0.2rem 5%; font-size: 1.05rem; font-weight: 600; color: #126064;"
                    align="left">
                    &#9989; ${topic}
                  </td>
                </tr>
                <tr>
                  <td
                    style="font-family: Verdana; font-weight: 500; text-align: left; padding: 0.3rem 0 1rem 13%; border-bottom: 1px dotted #DCF8FA; color: #044043; font-size: 0.9rem;"
                    align="left">
                    ${topicDescription}
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;

    console.log(
      "Filter Eval detected:",
      syllabus,
      "Level:",
      levelVal,
      "Week:",
      weekVal,
    );
  }
  let mustPracticeTopics = ``;
  let mapaGrande = ``;
  if (isFilterEval && totalScore < 7) {
    //cuando no aprueban
    mustPracticeTopics = `
    ${approvedTopics
          .map((topic) => {
            const topicKey = topic.toLowerCase();

            // Match insensible a mayúsculas
            const matchedKey = Object.keys(topicBreakdown)
              .find((k) => k.toLowerCase() === topicKey);

            const topicDescription = matchedKey
              ? topicBreakdown[matchedKey]
              : "";

            return `
    <tr>
      <td
        style="font-family: Verdana; border-bottom: 1px dotted #DCF8FA; text-align: left; padding: 1rem 0 0.2rem 10%; font-size: 0.95rem; font-weight: 600; color: #126064;"
        align="left">
           &#9744;  ${safe(topic)}
          </td>
        </tr>
       <tr>
      <td
        style="font-family: Verdana; font-weight: 500; text-align: left; padding: 0.3rem 0 1rem 20%; border-bottom: 1px dotted #DCF8FA; color: #044043; font-size: 0.85rem;"
        align="left">
            ${topicDescription}
          </td>
        </tr>
      `;
      })
      .join("")}
    ${reinforceTopics
          .map((topic) => {
            const topicKey = topic.toLowerCase();

            // Match insensible a mayúsculas
            const matchedKey = Object.keys(topicBreakdown)
              .find((k) => k.toLowerCase() === topicKey);

            const topicDescription = matchedKey
              ? topicBreakdown[matchedKey]
              : "";

            return `
      <tr>
      <td
        style="font-family: Verdana; border-bottom: 1px dotted #DCF8FA; text-align: left; padding: 1rem 0 0.2rem 10%; font-size: 0.95rem; font-weight: 600; color: #126064;"
        align="left">
        &#9744; ${safe(topic)}</td>
              </tr>
               <tr>
      <td
        style="font-family: Verdana; font-weight: 500; text-align: left; padding: 0.3rem 0 1rem 20%; border-bottom: 1px dotted #DCF8FA; color: #044043; font-size: 0.85rem;"
        align="left">
        ${topicDescription}</td>
              </tr>`;
      })
      .join("")}
    `;

    mapaGrande = `<!--SIGUIENTES PASOS-->
 <div
          style="margin: 4rem 0; justify-items: center; width: 100%; justify-self: center; background-color: #FFFFFF; border-radius: 10%; text-align: center; padding:1.5rem 0;">
          <img src="https://raw.githubusercontent.com/TheMichia/database/refs/heads/main/icons/nextStepOutline.png" style="height: 3rem; padding: 0; margin:0;">
          <p style="font-size: 1.3rem; font-family: Verdana; font-weight: 800; color: #126064; text-align: center; padding:0; margin: 0.5rem auto 2rem;"
            align="center">
    Siguientes Pasos</p>
  <p style="font-family: Verdana; text-align: center; padding: 0rem 3rem; font-size: 0.95rem; font-weight: 500; color: #126064;"
    align="left">El estudiante <b>continuará reforzando</b> contenidos en su <b>nivel actual</b>
    (<b>nivel ${levelVal}</b>)
    durante
    las
    próximas <b>${weeksToRepeat}
          semanas</b>,
    hasta su siguiente evaluación filtro. </p>
  <table width="95%" align="center" cellspacing="0" cellpadding="0"
    style=" border-collapse: collapse; background-color: #FCFCFC; border-radius: 10%; text-align: center; margin: 2rem auto;">
    <tr>
      <td>
        <p style=" border-bottom: 1px dotted #BED5D6; margin: 0 5%; padding: 0.7rem 0; font-family: Verdana; text-align: center; font-size: 1rem; font-weight: 600; color: #126064;">Para apoyar su avance, estos
          son
          los
          temas
          recomendados
          para
          practicar:</p>
      </td>
    </tr>
   ${mustPracticeTopics}
  </table>
</div>
     `;
  } else {
    mapaGrande = `
  <!--MAPA GRANDE-->
  <div style="margin: 4rem 0; justify-items: center;">
    <table width="100%" align="center" cellspacing="0" cellpadding="0"
      style="width: 80%; border-collapse: collapse; border-radius: 10%; overflow: hidden; margin-top: 2rem; background-color: #f9fafb;">
      <tr>
        <th
          style="font-size: 1.3rem; font-family: Verdana; font-weight: 800; color: #126064; text-align: center; padding: 1.5rem 0.5rem;"
          align="center">
          Progreso Actual
        </th>
      </tr>
      <tr>
        <td
          style="font-family: Verdana; border-bottom: 1px dotted #DCF8FA; text-align: left; padding: 1rem 5rem 1rem; font-size: 1.05rem; font-weight: 500; color: #126064;"
          align="left">
          <li>El estudiante se encuentra en el <b>nivel ${levelVal}</b>.</li>`;
    if (isFilterEval) {
      mapaGrande += `<li>El próximo nivel filtro es el <b>nivel ${nextFilter}</b>.</li>`;
    }
    mapaGrande += `</td>
      </tr>
    </table><img src="${B_ClassPath}" style="width: 100%;"></div>
  `;
  }

  // ---------- styles ----------

  const stylesHTML = `
      <style>
    .Evaluation-Results {
      margin: 0 auto;
      background: linear-gradient(to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%);
      background-color: #f5ffff;
      justify-items: center;
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
      font-size: 1.6rem;
      font-family: Serif;
      font-weight: 800;
      color: #126064;
      text-align: center;
      padding: 1.7rem 0.5rem;
      border-bottom: 1px dotted #219fa6;
    }

    .Evaluation-Results table td {
      font-size: 0.95rem;
      font-family: Verdana;
      font-weight: 500;
      color: #305254;
      padding: 0.9rem 0.5rem 0.9rem 6.5vw;
      border-bottom: 1px dotted rgba(28, 165, 171, 0.15);
      text-align: left;
    }

    .Evaluation-Results p {
      font-family: Verdana;
      font-size: 0.95rem;
    }


    /* =================WELLCOME=============== */
    .Evaluation-Results .welcome {
      justify-items: center;
      padding: 4rem 2rem;
      text-align: center;
      margin: 0 auto;
    }

    .Evaluation-Results .welcome .h2 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #126064;
      font-family: Serif;
    }

    .Evaluation-Results .welcome .h3 {
      font-size: 1.2rem;
      font-weight: 800;
      color: #126064;
      padding-bottom: 0.8rem;
      font-family: Verdana;
    }

    .Evaluation-Results .welcome .h4 {
      font-size: 1rem;
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
      font-size: 1.1rem;
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
  </style>


      `;

  //
  //===================================================================
  // ---------- final assembly ----------
  //===================================================================
  //

  let reportHTML = "";
  reportHTML += `<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reporte de Evaluación</title>
${stylesHTML}
</head>

<body style="margin: 0 auto; background: linear-gradient(to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%); background-color: white; text-align: center">
  <div class="Evaluation-Results" style="margin: 0 auto; background: linear-gradient(to bottom,
          #f5ffff 10%,
          #aed6d6 60%,
          #1ca5ab 90%); background-color: #DCF7F9;">
    <!-- <!HEADER> -->
    <div class="Evaluation-Results">
      <!-- <!HEADER> -->
      <div style="
            text-align: center;
            background: linear-gradient(to bottom, #f5f0e6 0%, transparent 50%);
            background-color: transparent;
          ">
        <img src="${imgHeader}" alt="Reporte de Evaluación" style="width: 100%; display: block; border: 0"></div>
      `;
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
  reportHTML += referText;
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
    (syllabus.includes("Kids Intensivo") ||
      syllabus.includes("Kids (Super Intensivo)")) &&
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
  } else {
    console.log("no PASA");
    evaluatorsCopyResults();
  }
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

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
  // Detectar clic fuera para cerrar
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

// ---close---
function closeSoundboard() {
  const soundboard = document.querySelector(".soundboard");
  if (soundboard) {
    soundboard.classList.remove("slide-in");
    soundboard.classList.add("slide-out");

    soundboard.addEventListener(
      "animationend",
      () => {
        soundboard.remove();
        document.getElementById("soundboardBtn").style.display = "flex";
        document.removeEventListener("click", handleOutsideClick);
      },
      { once: true },
    );
  }
}

// ---category---

function openCategory(category, clickedBtn) {
  const soundboard = document.querySelector(".soundboard");
  const buttons = soundboard.querySelectorAll(".category-btn");
  const wrapping = document.getElementById("wrapping");

  // Eliminar div anterior si existe
  const existingCategoryDiv = soundboard.querySelector(".category-content");
  if (existingCategoryDiv) existingCategoryDiv.remove();

  // Expandir panel visualmente
  soundboard.classList.add("expanded");

  // Crear nuevo div con ID del nombre de la categoría
  const categoryDiv = document.createElement("div");
  categoryDiv.classList.add("category-content", "fade-in");
  categoryDiv.id = category;
  wrapping.classList.remove("wrapping");
  wrapping.classList.add("wrapped");

  // Marcar el botón seleccionado
  buttons.forEach((btn) => {
    if (btn === clickedBtn) {
      btn.classList.remove("unselected");
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
      btn.classList.add("unselected");
    }
  });

  // ---DATOS DE CADA CATEGORÍA---
  const categories = {
    actions: [
      "Eat",
      "Bite",
      "Drink",
      "Sleep",
      "Run",
      "Jump",
      "Dance Macarena",
      "Walk",
    ],
    sfx: [
      "Impostor Among Us",
      "Buzzer",
      "Chan Chan Chan",
      "Claps",
      "Correct Ding",
      "Crickets",
      "Hoop Ding",
      "Horn",
      "Huh",
      "Sad Meow",
      "Shock Cinematic",
      "Tiny Violin",
      "Victory",
      "Vine Boom",
      "Yipee",
    ],
    music: [
      "My Little Soda Pop",
      "Dance-Remix",
      "Dynamite - BTS",
      "Fancy - Twice",
      "Jump - Blackpink",
      "Macarena",
      "Russian Roulette",
    ],
    animals: [
      "Bee",
      "Cat",
      "Chicken",
      "Cow",
      "Crow",
      "Dinosaur",
      "Dog",
      "Dove",
      "Duck",
      "Elephant",
      "Frog",
      "Giraffe",
      "Horse",
      "Whale",
      "Lion",
      "Owl",
      "Panda",
      "Penguin",
      "Pig",
      "Rabbit",
      "Raccoon",
      "Rat",
      "Rattlesnake",
      "Rooster",
      "Sheep",
      "Tiger",
      "Wolf",
      "Zebra",
    ],
  };

  // Crear HTML dinámicamente según categoría
  let html = '<section class="press-button">';
  categories[category].forEach((name) => {
    // convertir a minúsculas y reemplazar caracteres especiales para el archivo
    let fileName = name.toLowerCase().replace(/ /g, " ");
    let folder = category.charAt(0).toUpperCase() + category.slice(1); // Actions, SFX, Music, Animals
    html += `
      <div>
        <button data-sound="SoundBoard/${folder}/${fileName}.mp3" onclick="playSound(this)"></button>
        <h5>${name}</h5>
      </div>
    `;
  });
  html += "</section>";

  // Insertar HTML al nuevo div
  categoryDiv.innerHTML = html;

  // Agregar el nuevo div al soundboard
  soundboard.appendChild(categoryDiv);
}

// ---Cerrar si se hace clic fuera---
function handleOutsideClick(e) {
  const soundboard = document.querySelector(".soundboard");
  if (
    soundboard &&
    !soundboard.contains(e.target) &&
    e.target.id !== "soundboardBtn"
  ) {
    closeSoundboard();
  }
}

// Array global para controlar todos los audios activos
let activeAudios = [];

// ---PLAY SOUND---
function playSound(button) {
  const soundPath = button.getAttribute("data-sound");
  const audio = new Audio(soundPath);

  // Reproducir audio
  audio.play();

  // Guardar audio en el array
  activeAudios.push(audio);

  // Si no existe botón Stop All, lo creamos
  if (!document.getElementById("stop-all-btn")) {
    const stopBtn = document.createElement("button");
    stopBtn.id = "stop-all-btn";
    stopBtn.textContent = "Stop All Sounds";
    stopBtn.classList.add("stopSounds", "slide-in");
    stopBtn.onclick = stopAllSounds;
    document.body.appendChild(stopBtn);
  }

  // Cuando el audio termina, se elimina del array
  audio.addEventListener("ended", () => {
    activeAudios = activeAudios.filter((a) => a !== audio);

    // Si no quedan audios, eliminamos el botón de stop
    if (activeAudios.length === 0) {
      const stopBtn = document.getElementById("stop-all-btn");
      if (stopBtn) {
        stopBtn.classList.remove("slide-in");
        stopBtn.classList.add("slide-out");

        stopBtn.addEventListener(
          "animationend",
          () => {
            stopBtn.remove();
            document.getElementById("soundboardBtn").style.display = "flex";
            document.removeEventListener("click", handleOutsideClick);
          },
          { once: true },
        );
      }
    }
  });
}

// ---STOP ALL SOUNDS---
function stopAllSounds() {
  activeAudios.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0; // Reiniciar al inicio
  });
  activeAudios = [];

  // Remover botón Stop All
  const stopBtn = document.getElementById("stop-all-btn");
  if (stopBtn) stopBtn.remove();
}

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//

//
//✧˖°── .✦────☼༺☆༻☾────✦.── °˖✧
//
