//* *** Sidebar *** */

const body = document.querySelector("body"),
    sidebar = body.querySelector(".sidebar"),
    toggle = body.querySelector(".toggle"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text");
// Garante que a sidebar esteja aberta ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    sidebar.classList.remove('close');
});


toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
})

// Seleciona todos os links da sidebar
const menuLinks = document.querySelectorAll('.menu-links .nav-link a');

menuLinks.forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault(); // impede recarregamento da página

        // Captura o texto do link e normaliza (remove acentos e espaços)
        const nome = link.querySelector('.nav-text').textContent.trim()
            .normalize("NFD") // separa acentos
            .replace(/[\u0300-\u036f]/g, "") // remove acentos
            .toLowerCase()
            .replace(/\s+/g, ''); // remove todos os espaços

        console.log('Clicou em:', nome); // <-- aparece no console ao clicar

        // Esconde todas as seções de conteúdo
        document.querySelectorAll('.conteudo').forEach(sec => sec.classList.remove('ativo'));

        // Mostra a seção correspondente (se existir)
        const alvo = document.getElementById(nome);
        if (alvo) {
            alvo.classList.add('ativo');
            console.log('Mostrando seção:', nome);
        } else {
            console.warn('Nenhum elemento encontrado com ID:', nome);
        }

        // Fecha a sidebar após o clique
        if (sidebar) sidebar.classList.add('close');
        // Se a seção Estoque foi ativada, inicializa o conteúdo do estoque
        // Parar pollers de seções que não são o alvo (evita fetchs desnecessários)
        stopPolling('estoque');
        stopPolling('financeiro');

        // Se a seção Estoque foi ativada, inicializa o conteúdo do estoque com polling
        if (nome === 'estoque') {
            startPolling('estoque', initEstoque, 60000); // 60s
        }
        // Se a seção Financeiro foi ativada, inicializa o conteúdo do financeiro com polling
        if (nome === 'financeiro') {
            startPolling('financeiro', initFinanceiro, 60000); // 60s
        }
    });
});


//*  ***ESTOQUE***  */

// Variável para guardar instância do chart e evitar recriações
let estoqueChartInstance = null;
// Instância do chart financeiro
let financeiroChartInstance = null;

/**
 * Inicializa a seção de estoque: busca dados e desenha o gráfico.
 * Assumimos um endpoint REST em /api/estoque que retorna JSON com estrutura opcional:
 * {
 *   "summary": { "statusText": "...", "lowItems": 3 },
 *   "pie": { "p45": 10, "p20": 5, "p13": 3, "p8": 2, "p5": 1, "agua": 4 }
 * }
 * Se o endpoint não existir ou falhar, usa mock de fallback.
 */
function initEstoque() {
    const statusTextEl = document.querySelector('.status-text');
    const canvas = document.getElementById('estoquePieChart');
    const legendEl = document.getElementById('pie-legend');

    if (!canvas || !statusTextEl || !legendEl) return;

    // Mostra carregando
    statusTextEl.textContent = 'Carregando informações...';
    legendEl.innerHTML = '';

    // Retorna a Promise para permitir que o poller aguarde conclusão e evite sobreposição
    console.log('[initEstoque] iniciando fetch /api/estoque');
    return fetch('/api/estoque')
        .then(resp => {
            if (!resp.ok) throw new Error('No API');
            return resp.json();
        })
        .then(data => {
            console.log('[initEstoque] dados recebidos', data);
            applyEstoqueData(data, canvas, statusTextEl, legendEl);
        })
        .catch(err => {
            console.warn('[initEstoque] falha no fetch, usando mock', err);
            // Fallback: dados mock (use estes até implementar backend)
            const mock = {
                summary: { statusText: 'Dados locais (mock): estoque OK — itens com baixa quantidade: 2' },
                pie: { p45: 45, p20: 20, p13: 13, p8: 8, p5: 5, agua: 9 }
            };
            applyEstoqueData(mock, canvas, statusTextEl, legendEl);
        });
}

function applyEstoqueData(data, canvas, statusTextEl, legendEl) {
    const summary = data.summary || {};
    const pie = data.pie || {};

    // Atualiza texto de status
    statusTextEl.textContent = summary.statusText || 'Sem informações de status';

    // Monta valores do pie (ordem desejada)
    const keys = ['p45', 'p20', 'p13', 'p8', 'p5', 'agua'];
    const labels = ['P45', 'P20', 'P13', 'P8', 'P5', 'Água'];
    const values = keys.map(k => Number(pie[k] || 0));

    // Se Chart.js não estiver carregado, exibe fallback textual
    if (typeof Chart === 'undefined') {
        legendEl.innerHTML = '<p>Chart.js não disponível — instalar/ligar CDN.</p>';
        return;
    }

    // Destrói instância anterior se existir
    if (estoqueChartInstance) {
        try { estoqueChartInstance.destroy(); } catch (e) { /* ignore */ }
        estoqueChartInstance = null;
    }
    const ctx = canvas.getContext('2d');
    // Usar paleta padrão e mesma configuração do financeiro para evitar flicker
    const defaultBg = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#00a950'];
    const bg = defaultBg.slice(0, values.length || labels.length);

    estoqueChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bg,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Monta legenda com nome, quantidade e porcentagem (igual ao financeiro)
    const total = values.reduce((s, v) => s + (Number(v) || 0), 0) || 1;
    legendEl.innerHTML = '';
    labels.forEach((lbl, idx) => {
        const qty = Number(values[idx] || 0);
        const percent = total ? ((qty / total) * 100) : 0;
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-color" style="background:${bg[idx] || defaultBg[idx]}"></span>
            <strong>${lbl}</strong>&nbsp;&nbsp; <span>${qty}</span> &middot; <small>${percent.toFixed(1)}%</small>`;
        legendEl.appendChild(item);
    });
}

// Inicia automaticamente ao carregar a página caso a seção estoque já esteja visível
window.addEventListener('DOMContentLoaded', () => {
    const estoqueSection = document.getElementById('estoque');
    if (estoqueSection && estoqueSection.classList.contains('ativo')) {
        initEstoque();
    }
});

/*** FINANCEIRO ***/

// Função para inicializar o gráfico de financeiro
function initFinanceiro() {
    // Seleciona o canvas do gráfico e o elemento da legenda
    const canvas = document.getElementById('financeiroPieChart');
    const legendEl = document.getElementById('financeiro-legend');

    // Verifica se os elementos necessários existem na página
    if (!canvas || !legendEl) return;

    // Tenta buscar dados do endpoint /api/financeiro; se falhar usa mock local
    // Retorna a Promise para permitir que o poller aguarde conclusão e evite sobreposição
    console.log('[initFinanceiro] iniciando fetch /api/financeiro');
    return fetch('/api/financeiro')
        .then(resp => {
            if (!resp.ok) throw new Error('API não disponível');
            return resp.json();
        })
        .then(data => {
            console.log('[initFinanceiro] dados recebidos', data);
            renderFinanceiroChart(data, canvas, legendEl);
        })
        .catch(err => {
            console.warn('[initFinanceiro] falha no fetch, usando mock', err);
            // Fallback: dados mock (usado quando a rota não responde)
            const mock = {
                labels: ['A prazo', 'Pix', 'Cartão', 'Dinheiro'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#4dc9f6', '#f67019', '#f53794', '#537bc4']
                }]
            };
            renderFinanceiroChart(mock, canvas, legendEl);
        });
}

function renderFinanceiroChart(data, canvas, legendEl) {
    if (typeof Chart === 'undefined') {
        legendEl.innerHTML = '<p>Chart.js não disponível — instalar/ligar CDN.</p>';
        return;
    }

    const ctx = canvas.getContext('2d');
    // Destrói instância anterior do chart financeiro se existir para evitar erro "Canvas is already in use"
    if (financeiroChartInstance) {
        try { financeiroChartInstance.destroy(); } catch (e) { /* ignore */ }
        financeiroChartInstance = null;
    }

    try { ctx.clearRect(0, 0, canvas.width, canvas.height); } catch (e) { /* ignore */ }

    // Normaliza dados e cores
    const labels = data.labels || [];
    const dataset = (data.datasets && data.datasets[0]) || { data: [] };
    const values = dataset.data || [];
    const defaultBg = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#00a950'];
    const bg = (dataset.backgroundColor && dataset.backgroundColor.length) ? dataset.backgroundColor : defaultBg.slice(0, values.length || labels.length);

    // O sizing do canvas agora é controlado por CSS para evitar reflows inesperados

    financeiroChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bg,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            plugins: { legend: { display: false } }
        }
    });

    // Monta legenda com nome, quantidade e porcentagem (igual ao estoque)
    const total = (values || []).reduce((s, v) => s + (Number(v) || 0), 0) || 1;
    legendEl.innerHTML = '';
    labels.forEach((lbl, idx) => {
        const qty = Number(values[idx] || 0);
        const percent = total ? ((qty / total) * 100) : 0;
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-color" style="background:${bg[idx] || defaultBg[idx]}"></span>
            <strong>${lbl}</strong>&nbsp;&nbsp; <span>${qty}</span> &middot; <small>${percent.toFixed(1)}%</small>`;
        legendEl.appendChild(item);
    });
}

// --- Polling manager ---
const _pollers = {};

function startPolling(name, fn, intervalMs = 60000) {
    // Se já existe e está ativo, não cria outro
    if (_pollers[name] && _pollers[name].active) return;

    _pollers[name] = _pollers[name] || { active: false, timer: null, inProgress: false };
    _pollers[name].active = true;

    // função que executa o job respeitando a flag inProgress
    const runOnce = () => {
        if (!_pollers[name].active) return;
        if (_pollers[name].inProgress) {
            console.log(`[poll:${name}] ignorado - ainda em progresso`);
            return; // evita sobreposição
        }
        _pollers[name].inProgress = true;
        console.log(`[poll:${name}] iniciando execução`);
        try {
            const p = fn();
            if (p && typeof p.then === 'function') {
                p.then(() => {
                    console.log(`[poll:${name}] execução concluída com sucesso`);
                    _pollers[name].inProgress = false;
                })
                    .catch((err) => {
                        console.warn(`[poll:${name}] execução com erro`, err);
                        _pollers[name].inProgress = false;
                    });
            } else {
                // Se a função não retornou Promise, limpa a flag gentilmente após um tempo
                console.log(`[poll:${name}] função não retornou Promise, aguardando timeout`);
                setTimeout(() => {
                    console.log(`[poll:${name}] timeout concluído, liberando inProgress`);
                    _pollers[name].inProgress = false;
                }, Math.max(1000, intervalMs / 2));
            }
        } catch (e) {
            console.warn(`[poll:${name}] exceção durante execução`, e);
            _pollers[name].inProgress = false;
        }
    };

    // Execução imediata
    runOnce();

    // Agendamento periódico
    _pollers[name].timer = setInterval(() => {
        runOnce();
    }, intervalMs);
}

function stopPolling(name) {
    const p = _pollers[name];
    if (!p) return;
    p.active = false;
    if (p.timer) {
        clearInterval(p.timer);
        p.timer = null;
    }
    p.inProgress = false;
}

// Pausa todos os pollers quando a aba não está visível para economizar recursos
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        Object.keys(_pollers).forEach(k => { if (_pollers[k] && _pollers[k].active) clearInterval(_pollers[k].timer); });
    } else {
        // ao voltar, reinicia timers para pollers que estavam ativos
        Object.keys(_pollers).forEach(k => {
            const p = _pollers[k];
            if (p && p.active && !p.timer) {
                // reinicia com 10s como padrão
                p.timer = setInterval(() => {
                    if (!p.inProgress) {
                        p.inProgress = true;
                        const maybePromise = (k === 'estoque') ? initEstoque() : (k === 'financeiro' ? initFinanceiro() : null);
                        if (maybePromise && typeof maybePromise.then === 'function') {
                            maybePromise.then(() => { p.inProgress = false; }).catch(() => { p.inProgress = false; });
                        } else {
                            setTimeout(() => { p.inProgress = false; }, 1000);
                        }
                    }
                }, 60000);
            }
        });
    }
});

// Inicia automaticamente ao carregar a página caso a seção estoque/financeiro já esteja visível
window.addEventListener('DOMContentLoaded', () => {
    const estoqueSection = document.getElementById('estoque');
    if (estoqueSection && estoqueSection.classList.contains('ativo')) {
        startPolling('estoque', initEstoque, 60000);
    }
    const financeiroSection = document.getElementById('financeiro');
    if (financeiroSection && financeiroSection.classList.contains('ativo')) {
        startPolling('financeiro', initFinanceiro, 60000);
    }
});