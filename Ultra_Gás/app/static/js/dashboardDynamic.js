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
        if (nome === 'estoque') {
            initEstoque();
        }
        // Se a seção Financeiro foi ativada, inicializa o conteúdo do financeiro
        if (nome === 'financeiro') {
            initFinanceiro();
        }
    });
});


//*  ***ESTOQUE***  */

// Variável para guardar instância do chart e evitar recriações
let estoqueChartInstance = null;

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

    fetch('/api/estoque')
        .then(resp => {
            if (!resp.ok) throw new Error('No API');
            return resp.json();
        })
        .then(data => {
            applyEstoqueData(data, canvas, statusTextEl, legendEl);
        })
        .catch(err => {
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
    const bgColors = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#00a950'];

    estoqueChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors.slice(0, values.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Monta legenda com nome, quantidade e porcentagem
    const total = values.reduce((s, v) => s + v, 0) || 1;
    legendEl.innerHTML = '';
    labels.forEach((lbl, idx) => {
        const qty = values[idx];
        const percent = total ? ((qty / total) * 100) : 0;
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-color" style="background:${bgColors[idx]}"></span>
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

    // Dados simulados para o gráfico de financeiro
    const data = {
        labels: ['A prazo', 'Pix', 'Cartão', 'Dinheiro'], // Tipos de pagamento
        datasets: [{
            data: [40, 25, 20, 15], // Valores correspondentes aos tipos de pagamento
            backgroundColor: ['#4dc9f6', '#f67019', '#f53794', '#537bc4'], // Cores para cada tipo
        }],
    };

    // Inicializa o gráfico usando Chart.js
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'pie', // Define o tipo de gráfico como pizza
        data: data,
        options: {
            responsive: true, // Torna o gráfico responsivo
            animation: {
                duration: 500, // Define a duração da animação para 500ms
            },
            plugins: {
                legend: {
                    display: false, // Esconde a legenda padrão gerada pelo Chart.js
                },
            },
        },
    });

    // Gera uma legenda personalizada abaixo do gráfico
    const legendItems = data.labels.map((label, index) => {
        return `<div class="legend-item">
                    <span class="legend-color" style="background-color: ${data.datasets[0].backgroundColor[index]}"></span>
                    ${label}
                </div>`;
    });
    legendEl.innerHTML = legendItems.join(''); // Insere os itens da legenda no elemento correspondente
}

// Adiciona um listener para inicializar o gráfico quando a página for carregada
window.addEventListener('DOMContentLoaded', initFinanceiro);