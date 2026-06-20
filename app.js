// =============================================
//  CONSTANTS
// =============================================
const TANK_LITERS = 50;
const STORAGE_KEY = 'compensa_valores';

// =============================================
//  HELPERS
// =============================================
const $ = id => document.getElementById(id);

function parseNum(id) {
  const val = parseFloat($(id).value.replace(',', '.'));
  return isNaN(val) || val <= 0 ? null : val;
}

function showError(id, show) {
  const input = $(id);
  const errEl = $('err-' + id);
  if (show) {
    input.classList.add('error');
    errEl && errEl.classList.add('show');
  } else {
    input.classList.remove('error');
    errEl && errEl.classList.remove('show');
  }
}

function clearErrors() {
  ['price-gas', 'price-eth', 'km-gas', 'km-eth'].forEach(id => showError(id, false));
}

function fmt(num, decimals = 4) {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(num) {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

// =============================================
//  LOCAL STORAGE — Feat #2
// =============================================
function saveToStorage(pGas, pEth, kmGas, kmEth) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pGas, pEth, kmGas, kmEth }));
  } catch (_) { /* ignorar erros de storage */ }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.pGas)  $('price-gas').value = String(data.pGas).replace('.', ',');
    if (data.pEth)  $('price-eth').value = String(data.pEth).replace('.', ',');
    if (data.kmGas) $('km-gas').value    = data.kmGas;
    if (data.kmEth) $('km-eth').value    = data.kmEth;
  } catch (_) { /* ignorar */ }
}

// =============================================
//  PRICE MASK
// =============================================
function applyPriceMask(e) {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 1) {
    val = val.substring(0, 1) + ',' + val.substring(1, 4);
  }
  e.target.value = val;
}

// =============================================
//  CALCULATION
// =============================================
function calculate() {
  clearErrors();

  const pGas  = parseNum('price-gas');
  const pEth  = parseNum('price-eth');
  const kmGas = parseNum('km-gas');
  const kmEth = parseNum('km-eth');

  let valid = true;
  if (!pGas)  { showError('price-gas', true); valid = false; }
  if (!pEth)  { showError('price-eth', true); valid = false; }
  if (!kmGas) { showError('km-gas', true);    valid = false; }
  if (!kmEth) { showError('km-eth', true);    valid = false; }
  if (!valid) return;

  // Custo por km de cada combustível
  const costGas = pGas / kmGas;   // R$/km
  const costEth = pEth / kmEth;   // R$/km
  const ratio   = pEth / pGas;    // relação álcool/gasolina

  const TOLERANCE = 0.001;
  let winner; // 'gas' | 'eth' | 'tie'
  if (Math.abs(costGas - costEth) < TOLERANCE) {
    winner = 'tie';
  } else if (costEth < costGas) {
    winner = 'eth';
  } else {
    winner = 'gas';
  }

  // Feat #4 — economia por tanque de 50L
  // Calcula quanto custaria rodar a mesma distância de um tanque do vencedor
  let economyValue = 0;
  let economyKm    = 0;

  if (winner === 'gas') {
    economyKm    = TANK_LITERS * kmGas;             // km rodados com 50L de gasolina
    const rGas   = TANK_LITERS * pGas;              // custo real com gasolina
    const rEth   = (economyKm / kmEth) * pEth;      // custo equivalente com álcool
    economyValue = rEth - rGas;
  } else if (winner === 'eth') {
    economyKm    = TANK_LITERS * kmEth;             // km rodados com 50L de álcool
    const rEth   = TANK_LITERS * pEth;              // custo real com álcool
    const rGas   = (economyKm / kmGas) * pGas;      // custo equivalente com gasolina
    economyValue = rGas - rEth;
  }

  // Salvar no localStorage — Feat #2
  saveToStorage(pGas, pEth, kmGas, kmEth);

  renderResult(winner, costGas, costEth, pGas, pEth, ratio, economyValue, economyKm);
}

// =============================================
//  RENDER RESULT
// =============================================
function renderResult(winner, costGas, costEth, pGas, pEth, ratio, economyValue, economyKm) {
  const section  = $('result-section');
  const card     = $('result-card');
  const emoji    = $('result-emoji');
  const badge    = $('result-badge');
  const headline = $('result-headline');
  const sub      = $('result-sub');
  const pills    = $('cost-pills');
  const hint     = $('ratio-hint');
  const econBox  = $('economy-box');
  const clearWrap = $('btn-clear-wrap');

  // Reset
  section.classList.remove('visible');
  card.className = 'result-card';

  const saving = Math.abs(costGas - costEth);
  const pct    = (saving / Math.max(costGas, costEth) * 100).toFixed(1);

  if (winner === 'gas') {
    card.classList.add('winner-gas');
    emoji.textContent    = '🔥';
    badge.className      = 'result-badge badge-gas';
    badge.textContent    = '⬛ Gasolina vence';
    headline.textContent = 'Use Gasolina!';
    sub.textContent      = `A gasolina está ${pct}% mais barata por quilômetro. Vale mais a pena abastecer com gasolina agora.`;
  } else if (winner === 'eth') {
    card.classList.add('winner-eth');
    emoji.textContent    = '🌿';
    badge.className      = 'result-badge badge-eth';
    badge.textContent    = '⬛ Álcool vence';
    headline.textContent = 'Use Álcool!';
    sub.textContent      = `O álcool está ${pct}% mais barato por quilômetro. É a melhor escolha para o seu bolso agora.`;
  } else {
    card.classList.add('winner-tie');
    emoji.textContent    = '🤝';
    badge.className      = 'result-badge badge-tie';
    badge.textContent    = 'Empate técnico';
    headline.textContent = 'Praticamente igual!';
    sub.textContent      = 'O custo por km dos dois combustíveis é quase idêntico. Pode abastecer com qualquer um!';
  }

  // Pills — custo por km
  const gasWinner = winner === 'gas';
  const ethWinner = winner === 'eth';
  pills.innerHTML = `
    <div class="cost-pill ${gasWinner ? 'is-winner' : ''}">
      ${gasWinner ? '<span class="winner-crown">👑</span>' : ''}
      <span class="pill-label">🔥 Gasolina</span>
      <span class="pill-value gas-color">R$ ${fmtCurrency(costGas)}</span>
      <span class="pill-unit">por km</span>
    </div>
    <div class="cost-pill ${ethWinner ? 'is-winner' : ''}">
      ${ethWinner ? '<span class="winner-crown">👑</span>' : ''}
      <span class="pill-label">🌿 Álcool</span>
      <span class="pill-value eth-color">R$ ${fmtCurrency(costEth)}</span>
      <span class="pill-unit">por km</span>
    </div>
  `;

  // Economy box — Feat #4
  if (winner !== 'tie') {
    const winnerLabel = winner === 'gas' ? 'gasolina' : 'álcool';
    econBox.innerHTML = `
      <span class="economy-icon">💰</span>
      <div class="economy-text">
        <span class="economy-label">Economia por tanque (${TANK_LITERS}L)</span>
        <span class="economy-value">R$ ${fmt(economyValue, 2)} a menos</span>
        <span class="economy-sub">usando ${winnerLabel} para rodar ${Math.round(economyKm)} km</span>
      </div>
    `;
    econBox.style.display = '';
  } else {
    econBox.style.display = 'none';
  }

  // Ratio hint — regra dos 70%
  const ratioStr    = (ratio * 100).toFixed(1);
  const ruleVerdict = ratio < 0.7
    ? 'A <strong>regra dos 70%</strong> também indica: álcool compensa ✅'
    : 'A <strong>regra dos 70%</strong> indica: gasolina compensa ✅';

  hint.innerHTML = `
    📊 Relação álcool/gasolina: <strong>${ratioStr}%</strong>
    &nbsp;(R$ ${fmt(pEth, 2)} ÷ R$ ${fmt(pGas, 2)})<br>
    ${ruleVerdict}
    <br><small style="color:var(--text-muted)">Regra dos 70%: se o álcool custar menos de 70% da gasolina, o álcool compensa.</small>
  `;

  // Mostrar seção de resultado e botão Limpar — Feat #3
  requestAnimationFrame(() => {
    section.classList.add('visible');
    clearWrap.classList.add('visible');
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// =============================================
//  CLEAR — Feat #3
// =============================================
function clearAll() {
  ['price-gas', 'price-eth', 'km-gas', 'km-eth'].forEach(id => {
    $(id).value = '';
    showError(id, false);
  });

  $('result-section').classList.remove('visible');
  $('btn-clear-wrap').classList.remove('visible');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  $('price-gas').focus();
}

// =============================================
//  EVENTS
// =============================================
$('btn-calc').addEventListener('click', calculate);
$('btn-clear').addEventListener('click', clearAll);

// Enter para calcular + limpar erro ao digitar
['price-gas', 'price-eth', 'km-gas', 'km-eth'].forEach(id => {
  $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
  $(id).addEventListener('input',   () => showError(id, false));
});

// Máscara de vírgula nos campos de preço
['price-gas', 'price-eth'].forEach(id => {
  $(id).addEventListener('input', applyPriceMask);
});

// =============================================
//  INIT — carregar valores salvos
// =============================================
loadFromStorage();
