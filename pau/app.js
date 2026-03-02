const MONTHS = [
  {
    title: "Mes 1",
    range: "Març 2026",
    full: "Fonaments — Àlgebra & Física Bàsica",
    obj: "Construir la base sòlida: expressions algebraiques, funcions i cinemàtica",
    topics: [
      {
        name: "Àlgebra bàsica",
        mates: "Nombres enters, fraccions, potències i arrels. Expressions algebraiques: monomis i polinomis. Productes notables: (a±b)², (a+b)(a-b). Operatoria bàsica.",
        fisica: null
      },
      {
        name: "Equacions i sistemes",
        mates: "Equacions de 1r grau. Equacions de 2n grau: fórmula general i discriminant. Sistemes de 2 equacions amb 2 incògnites: substitució, igualació i reducció.",
        fisica: null
      },
      {
        name: "Polinomis i proporcionalitat",
        mates: "Divisió de polinomis (Ruffini). Arrels i factorització. Teorema del residu. Proporcionalitat directa i inversa. Semblança de triangles i Teorema de Tales.",
        fisica: null
      },
      {
        name: "Funcions: concepte i gràfiques",
        mates: "Concepte de funció, domini, recorregut i gràfiques. Funció lineal i quadràtica. Domini de funcions racionals, irracionals i logarítmiques.",
        fisica: null
      },
      {
        name: "Funcions especials",
        mates: "Trigonometria: sinus, cosinus, tangent, triangle rectangle, relacions fonamentals. Funcions logarítmiques i exponencials: propietats i equacions.",
        fisica: null
      },
      {
        name: "Unitats SI i mesures",
        mates: null,
        fisica: "Unitats del SI. Conversions d'unitats i factors de conversió. Anàlisi dimensional. Errors de mesura: error absolut i relatiu."
      },
      {
        name: "Cinemàtica",
        mates: null,
        fisica: "Posició, velocitat i acceleració. MRU: equacions i gràfiques. MRUA: equacions, caiguda lliure. Interpretació de gràfiques x-t, v-t i a-t."
      }
    ]
  },
  {
    title: "Mes 2",
    range: "Abril 2026",
    full: "Càlcul & Mecànica",
    obj: "Derivades, integrals i les lleis del moviment i les forces",
    topics: [
      {
        name: "Derivades: concepte i regles",
        mates: "Concepte de derivada com a pendent i límit. Derivades bàsiques: xⁿ, sin(x), cos(x), eˣ, ln(x). Regles de derivació: suma, producte, quocient i regla de la cadena.",
        fisica: null
      },
      {
        name: "Aplicació de derivades",
        mates: "Màxims i mínims relatius. Creixement i decreixement de funcions. Interpretació de f'(x) i f''(x). Anàlisi completa gràfica d'una funció.",
        fisica: null
      },
      {
        name: "Integrals (primitives)",
        mates: "Concepte de primitiva. Primitives bàsiques: xⁿ, eˣ, 1/x, sin(x), cos(x). Tècniques bàsiques d'integració. Regla de la cadena inversa.",
        fisica: null
      },
      {
        name: "Optimització",
        mates: "Problemes de màxims i mínims aplicats: maximitzar àrees, minimitzar costos, problemes reals. Metodologia: definir variable, funció objectiu, derivar i igualar a zero.",
        fisica: null
      },
      {
        name: "Dinàmica i forces",
        mates: null,
        fisica: "Lleis de Newton (1a, 2a i 3a). Força, massa i acceleració. Pes vs massa. Forces en plans inclinats. Diagrames de forces."
      },
      {
        name: "Moviment circular i gravitació",
        mates: null,
        fisica: "Moviment circular: velocitat angular i força centrípeta. Gravitació universal. Gravetat a diferents altures. Òrbites i satèl·lits. Lleis de Kepler."
      },
      {
        name: "Moment lineal i xocs",
        mates: null,
        fisica: "Moment lineal i impuls. Conservació del moment lineal. Xocs elàstics i inelàstics. Energia cinètica en xocs."
      }
    ]
  },
  {
    title: "Mes 3",
    range: "Maig 2026",
    full: "Àlgebra Lineal & Oscil·lacions",
    obj: "Matrius, determinants, sistemes 3×3 i moviment oscil·latori i ondulatori",
    topics: [
      {
        name: "Matrius: operacions i propietats",
        mates: "Definició i tipus de matrius. Suma, producte escalar i matricial, transposada. Propietats. Matriu identitat. Operatoria completa.",
        fisica: null
      },
      {
        name: "Determinants i matriu inversa",
        mates: "Determinant 2×2 i 3×3 (regla de Sarrus). Propietats dels determinants. Matriu inversa: existència i càlcul.",
        fisica: null
      },
      {
        name: "Rang i sistemes 3×3",
        mates: "Rang d'una matriu. Sistemes de 3 equacions i 3 incògnites. Mètode de Cramer. Eliminació de Gauss. Sistemes homogenis. Equacions matricials.",
        fisica: null
      },
      {
        name: "MHS — Moviment Harmònic Simple",
        mates: null,
        fisica: "Equació del MHS: x(t) = A·cos(ωt + φ). Paràmetres: amplitud, període, freqüència i fase. Molla i llei de Hooke. Energia en el MHS."
      },
      {
        name: "Ones harmòniques i so",
        mates: null,
        fisica: "Equació d'una ona harmònica. Longitud d'ona, freqüència i velocitat de propagació: λ·f = v. Ones en una corda. So: característiques i velocitat en l'aire."
      }
    ]
  },
  {
    title: "Mes 4",
    range: "Juny 2026",
    full: "Geometria & Electricitat",
    obj: "Geometria analítica 2D/3D i fenòmens elèctrics i magnètics",
    topics: [
      {
        name: "Geometria 2D",
        mates: "Vectors 2D: operacions, mòdul i producte escalar. Equació de la recta. Distància entre punts i d'un punt a una recta. Rectes paral·leles i perpendiculars. Punt mitjà i baricentre.",
        fisica: null
      },
      {
        name: "Geometria 3D",
        mates: "Vectors 3D: producte escalar i vectorial. Equació del pla: per un punt i vector normal, per 3 punts. Posicions relatives de rectes i plans. Distàncies i angles.",
        fisica: null
      },
      {
        name: "Electrostàtica",
        mates: null,
        fisica: "Càrrega elèctrica. Llei de Coulomb. Camp elèctric: definició i línies de camp. Superposició de camps elèctrics. Energia potencial elèctrica."
      },
      {
        name: "Circuits elèctrics",
        mates: null,
        fisica: "Intensitat, tensió i resistència. Llei d'Ohm. Resistències en sèrie i en paral·lel. Condensadors: capacitat i associació. Energia emmagatzemada."
      },
      {
        name: "Camp magnètic i inducció",
        mates: null,
        fisica: "Força de Lorentz: F = qv×B. Moviment d'una càrrega en un camp magnètic. Inducció de Faraday: fem induïda. Alternadors i corrent altern. Espectròmetre de masses."
      }
    ]
  },
  {
    title: "Mes 5",
    range: "Juliol 2026",
    full: "Repàs i Temes Complementaris",
    obj: "Consolidar el temari, atacar punts febles i completar l'òptica",
    topics: [
      {
        name: "Òptica geomètrica",
        mates: null,
        fisica: "Reflexió i refracció de la llum. Llei de Snell: n₁·sin(θ₁) = n₂·sin(θ₂). Reflexió total interna i angle crític. Aplicacions: fibra òptica i prismes."
      },
      {
        name: "Repàs Mates — temes prioritaris",
        mates: "Exercicis de tots els temes d'alta prioritat: funcions i domini, derivades, integrals (primitives), matrius i determinants, geometria 3D, equacions i polinomis. Usar exàmens anteriors per tema.",
        fisica: null
      },
      {
        name: "Repàs Física — temes prioritaris",
        mates: null,
        fisica: "Exercicis de tots els temes d'alta prioritat: unitats SI i conversions, cinemàtica (MRU/MRUA), dinàmica (Newton), MHS i ones, circuits elèctrics, gravitació."
      },
      {
        name: "Identificar i reforçar punts febles",
        mates: "Identificar els temes amb més errors. Exercicis específics per reforçar cada punt feble. Practicar amb problemes dels exàmens 2023, 2024 i 2025 per tema.",
        fisica: "Identificar els temes amb més errors. Exercicis específics per reforçar cada punt feble. Practicar amb problemes dels exàmens 2023, 2024 i 2025 per tema."
      }
    ]
  },
  {
    title: "Mes 6",
    range: "Agost 2026",
    full: "Simulacres i Revisió Final",
    obj: "Posar-se a prova amb exàmens reals i polir l'estratègia d'examen",
    topics: [
      {
        name: "Simulacre 1 — Exàmens 2023",
        mates: "Examen de Mates 2023 complet i cronometrat (90 min). Correcció immediata. Analitzar errors i punts febles.",
        fisica: "Examen de Física 2023 complet i cronometrat (90 min). Correcció immediata. Analitzar errors i punts febles.",
        simulacre: true
      },
      {
        name: "Simulacre 2 — Exàmens 2024",
        mates: "Examen de Mates 2024 complet i cronometrat (90 min). Correcció immediata. Analitzar errors i punts febles.",
        fisica: "Examen de Física 2024 complet i cronometrat (90 min). Correcció immediata. Analitzar errors i punts febles.",
        simulacre: true
      },
      {
        name: "Simulacre 3 — Exàmens 2025",
        mates: "Examen de Mates 2025 complet i cronometrat (90 min). Correcció immediata. Analitzar errors i punts febles.",
        fisica: "Examen de Física 2025 complet i cronometrat (90 min). Correcció immediata. Analitzar errors i punts febles.",
        simulacre: true
      },
      {
        name: "Reforç post-simulacres",
        mates: "Repàs intensiu dels temes amb més errors als simulacres. Elaborar formulari definitiu de mates.",
        fisica: "Repàs intensiu dels temes amb més errors als simulacres. Elaborar formulari definitiu de física."
      },
      {
        name: "Revisió final",
        mates: "Repassar fórmules clau i trucs d'examen. Revisió lleugera del temari. Estratègia per al dia de l'examen.",
        fisica: "Repassar fórmules clau i trucs d'examen. Revisió lleugera del temari. Estratègia per al dia de l'examen."
      }
    ]
  }
];

// ── State ──
let checked = {};
try { checked = JSON.parse(localStorage.getItem('studyChecked25v2') || '{}'); } catch(e) {}
let activePanel = 'w0';

function save() { try { localStorage.setItem('studyChecked25v2', JSON.stringify(checked)); } catch(e) {} }

function totalTopics() { return MONTHS.reduce((s, m) => s + m.topics.length, 0); }
function checkedCount() { return Object.values(checked).filter(Boolean).length; }
function monthChecked(mi) { return MONTHS[mi].topics.filter((_, ti) => checked[`${mi}-${ti}`]).length; }

function findCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed: 0=Gen, 2=Mar, 7=Ago
  if (year === 2026) {
    const idx = month - 2; // Març(2) = índex 0
    if (idx >= 0 && idx < MONTHS.length) return 'w' + idx;
  }
  return 'w0';
}

function updateCountdown() {
  // Data aproximada de l'examen — ajusta si cal
  const target = new Date(2026, 8, 15); // 15 de setembre 2026
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  const el = document.getElementById('countdown');
  if (el) el.textContent = diff > 0 ? diff : '0';
}

// ── Render ──
function renderNav() {
  const tabs = document.getElementById('navTabs');
  const currentIdx = parseInt(findCurrentMonth().slice(1));
  let html = '';
  MONTHS.forEach((m, i) => {
    const mPct = m.topics.length ? Math.round((monthChecked(i) / m.topics.length) * 100) : 0;
    const check = mPct === 100 ? ' ✓' : '';
    const isCurrent = i === currentIdx && activePanel !== 'w' + i;
    html += `<div class="nav-tab ${activePanel === 'w'+i ? 'active' : ''} ${isCurrent ? 'tab-current' : ''}" onclick="showPanel('w${i}')">${m.title} <span style="font-size:0.7rem;opacity:0.6">${m.range.split(' ')[0]}</span>${check}</div>`;
  });
  html += `<div class="nav-tab tab-analysis ${activePanel === 'analysis' ? 'active' : ''}" onclick="showPanel('analysis')">📊 Anàlisi</div>`;
  html += `<div class="nav-tab tab-tips ${activePanel === 'tips' ? 'active' : ''}" onclick="showPanel('tips')">💡 Consells</div>`;
  tabs.innerHTML = html;
}

function renderProgress() {
  const total = totalTopics();
  const pct = total ? Math.round((checkedCount() / total) * 100) : 0;
  document.getElementById('globalBar').style.width = pct + '%';
  document.getElementById('globalPct').textContent = pct + '%';
}

function renderMonth(mi) {
  const m = MONTHS[mi];
  const mPct = m.topics.length ? Math.round((monthChecked(mi) / m.topics.length) * 100) : 0;

  let html = `<div class="panel active">`;
  html += `<div class="month-header">
    <h2>${m.full}</h2>
    <div class="month-obj">${m.obj}</div>
    <div class="month-progress-mini">
      <div class="bar-outer"><div class="bar-inner" style="width:${mPct}%"></div></div>
      <span class="pct">${mPct}%</span>
    </div>
  </div>`;

  m.topics.forEach((t, ti) => {
    const key = `${mi}-${ti}`;
    const isChecked = checked[key];
    const cls = ['topic-card', isChecked ? 'completed' : '', t.simulacre ? 'simulacre' : ''].filter(Boolean).join(' ');

    let tags = '';
    if (t.mates && t.fisica) {
      tags = `<span class="topic-tag mates">Mates</span><span class="topic-tag fisica">Física</span>`;
    } else if (t.mates) {
      tags = `<span class="topic-tag mates">Mates</span>`;
    } else if (t.fisica) {
      tags = `<span class="topic-tag fisica">Física</span>`;
    }
    if (t.simulacre) tags += `<span class="topic-tag sim">Simulacre</span>`;

    html += `<div class="${cls}" id="card-${key}">
      <div class="topic-head" onclick="toggleTopic('${key}')">
        <div class="topic-check ${isChecked ? 'checked' : ''}" onclick="event.stopPropagation(); toggleCheck('${key}')"></div>
        <span class="topic-name">${t.name}</span>
        <div class="topic-tags">${tags}</div>
        <span class="topic-toggle">▾</span>
      </div>
      <div class="topic-body">`;

    if (t.mates) {
      html += `<div class="subject-block mates">
        <div class="subject-label">📐 Matemàtiques</div>
        <div class="subject-content">${t.mates}</div>
      </div>`;
    }
    if (t.fisica) {
      html += `<div class="subject-block fisica">
        <div class="subject-label">⚡ Física</div>
        <div class="subject-content">${t.fisica}</div>
      </div>`;
    }

    html += `</div></div>`;
  });

  html += '</div>';
  return html;
}

function topicRowHTML(name, desc, freq, priority) {
  return `<div class="topic-row">
    <div class="topic-row-name">${name}</div>
    <div class="topic-row-desc">${desc}</div>
    <div class="topic-freq">${freq}</div>
    <div class="priority-badge ${priority}">${priority}</div>
  </div>`;
}

function renderAnalysis() {
  return `<div class="panel active">
    <div class="analysis-section">
      <h2>Estructura de l'examen</h2>
      <p>Format idèntic per Mates i Física. Es permet calculadora científica (no programàtica).</p>
      <div class="exam-structure">
        <div class="struct-grid">
          <div class="struct-item part1">
            <div class="big">6 pts</div>
            <div class="desc">Part 1 — Tria 4 de 6 qüestions<br>(1.5 pts cadascuna)</div>
          </div>
          <div class="struct-item part2">
            <div class="big">4 pts</div>
            <div class="desc">Part 2 — Resol 1 de 2 problemes<br>(4 pts el problema)</div>
          </div>
        </div>
        <p style="margin-top:1rem;font-size:0.85rem;color:var(--text2)"><strong>Estratègia clau:</strong> Com que tries 4 de 6, no cal dominar-ho tot. Si controles bé 5 temes, sempre podràs triar les 4 que et van millor!</p>
      </div>
    </div>
    <div class="analysis-section">
      <h2>📐 Temes de Matemàtiques</h2>
      <p>Freqüència d'aparició als exàmens 2023, 2024 i 2025</p>
      <div class="topic-grid">
        ${topicRowHTML("Funcions i domini", "Domini de funcions racionals, irracionals, logarítmiques", "3/3", "alta")}
        ${topicRowHTML("Derivades", "Concepte, regles, màxims/mínims, anàlisi gràfica", "2/3", "alta")}
        ${topicRowHTML("Integrals (Primitives)", "Primitives bàsiques: eˣ, xⁿ, trigonomètriques", "3/3", "alta")}
        ${topicRowHTML("Matrius i determinants", "Operacions, propietats, rang, equacions matricials", "3/3", "alta")}
        ${topicRowHTML("Geometria 3D", "Pla per 3 punts, coplanaritat, rectes i plans", "3/3", "alta")}
        ${topicRowHTML("Equacions i polinomis", "2n grau, Ruffini, logarítmiques", "3/3", "alta")}
        ${topicRowHTML("Sistemes d'equacions", "3x3, plantejament, Cramer/Gauss", "2/3", "mitjana")}
        ${topicRowHTML("Geometria 2D", "Rectes, distàncies, àrees, baricentre", "2/3", "mitjana")}
        ${topicRowHTML("Optimització", "Màxims/mínims aplicats a problemes reals", "1/3", "mitjana")}
        ${topicRowHTML("Trigonometria", "Semblança, triangle rectangle", "1/3", "baixa")}
      </div>
    </div>
    <div class="analysis-section">
      <h2>⚡ Temes de Física</h2>
      <p>Freqüència d'aparició als exàmens 2023, 2024 i 2025</p>
      <div class="topic-grid">
        ${topicRowHTML("Unitats SI i conversions", "Factors de conversió, anàlisi dimensional, errors", "3/3", "alta")}
        ${topicRowHTML("Cinemàtica", "MRU, MRUA, caiguda lliure, gràfiques v-t / a-t", "3/3", "alta")}
        ${topicRowHTML("Dinàmica i forces", "Lleis Newton, força centrípeta, impuls", "3/3", "alta")}
        ${topicRowHTML("MHS i ones", "Equació MHS, molla, ones harmòniques, so", "3/3", "alta")}
        ${topicRowHTML("Circuits elèctrics", "Llei Ohm, sèrie/paral·lel, condensadors", "2/3", "alta")}
        ${topicRowHTML("Gravitació", "Llei gravitació, òrbites, Kepler, satèl·lits", "2/3", "alta")}
        ${topicRowHTML("Electromagnetisme", "Força Lorentz, inducció Faraday, alternadors", "2/3", "mitjana")}
        ${topicRowHTML("Òptica", "Refracció, Snell, reflexió total", "1/3", "mitjana")}
        ${topicRowHTML("Xocs i moment lineal", "Conservació moment, xocs elàstics/inelàstics", "1/3", "mitjana")}
        ${topicRowHTML("Electrostàtica", "Coulomb, camp elèctric", "1/3", "baixa")}
      </div>
    </div>
  </div>`;
}

function renderTips() {
  return `<div class="panel active">
    <div class="analysis-section"><h2>Consells d'examen</h2></div>
    <div class="tip-card">
      <h3><span class="tip-icon">⏱</span> Gestió del temps</h3>
      <p>Tens 90 minuts. Dedica ~50 min a les 4 qüestions (12 min cadascuna) i ~40 min al problema. Llegeix TOT l'examen abans de començar i tria primer.</p>
    </div>
    <div class="tip-card">
      <h3><span class="tip-icon">🎯</span> Tria estratègica</h3>
      <p>Tria les 4 qüestions que millor domines. Si dubtes entre dues, comença per la que segur que saps fer bé. Recorda: no cal contestar-les totes!</p>
    </div>
    <div class="tip-card">
      <h3><span class="tip-icon">📝</span> Mostra sempre el procés</h3>
      <p>Escriu tots els passos, no només el resultat. Si t'equivoques en un càlcul però el procés és correcte, et puntuen parcialment.</p>
    </div>
    <div class="tip-card">
      <h3><span class="tip-icon">📏</span> Revisa unitats (Física)</h3>
      <p>Assegura't que les unitats quadren al resultat. Si demanen metres i et surten km, converteix. Això dona punts fàcils.</p>
    </div>
    <div class="tip-card">
      <h3><span class="tip-icon">🧠</span> Fórmules clau — Mates</h3>
      <p>Fórmula quadràtica, derivades bàsiques (xⁿ, sin, cos, eˣ, ln), primitives bàsiques, determinant 3x3 (Sarrus), distància entre punts, equació del pla.</p>
    </div>
    <div class="tip-card">
      <h3><span class="tip-icon">🧠</span> Fórmules clau — Física</h3>
      <p>x = x₀+v₀t+½at², v = v₀+at, F = ma, F꜀ = mv²/r, F꜆ = GMm/r², V = IR, T = 2π/ω, λ = v/f, Snell: n₁sinθ₁ = n₂sinθ₂</p>
    </div>
    <div class="analysis-section" style="margin-top:2rem"><h2>Com estudiar amb Claude</h2></div>
    <div class="tip-card">
      <h3><span class="tip-icon">💬</span> Demana'm ajuda en qualsevol moment</h3>
      <p>Pots usar aquests prompts per estudiar de forma eficient:</p>
      <div class="claude-prompts">
        <div class="claude-prompt"><code>"Explica'm les derivades des de zero"</code> → T'ho explico pas a pas amb exemples</div>
        <div class="claude-prompt"><code>"Resol el problema 1 de l'examen de Mates 2023"</code> → Et guio la resolució completa</div>
        <div class="claude-prompt"><code>"Fes-me un exercici de pràctica de gravitació"</code> → Et genero exercicis personalitzats</div>
        <div class="claude-prompt"><code>"No entenc les matrius, explica-m'ho diferent"</code> → Analogies i exemples visuals</div>
        <div class="claude-prompt"><code>"Corregeix-me aquest exercici"</code> → Reviso el teu treball i t'indico errors</div>
      </div>
    </div>
  </div>`;
}

// ── Interactions ──
function showPanel(id) {
  activePanel = id;
  renderNav();
  const main = document.getElementById('mainContent');
  if (id.startsWith('w')) {
    main.innerHTML = renderMonth(parseInt(id.slice(1)));
  } else if (id === 'analysis') {
    main.innerHTML = renderAnalysis();
  } else if (id === 'tips') {
    main.innerHTML = renderTips();
  }
}

function toggleTopic(key) {
  const card = document.getElementById('card-' + key);
  if (card) card.classList.toggle('open');
}

function toggleCheck(key) {
  checked[key] = !checked[key];
  save();
  showPanel(activePanel);
  renderProgress();
}

// ── Init ──
activePanel = findCurrentMonth();
renderNav();
showPanel(activePanel);
renderProgress();
updateCountdown();
setInterval(updateCountdown, 60000);
