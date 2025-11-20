// Lógica da seção Pedidos: controle de quantidades, seleção de pagamento e envio
(function () {
    const state = {
        p5: 0,
        p8: 0,
        p13: 0,
        p20: 0,
        p45: 0,
        agua: 0,
    };

    function updateQtyDisplay(key) {
        const el = document.getElementById(`qty-${key}`);
        if (el) el.textContent = String(state[key] ?? 0);
    }

    function adjustQty(key, delta) {
        const next = Math.max(0, (state[key] || 0) + delta);
        state[key] = next;
        updateQtyDisplay(key);
        updateTotalDisplay();
    }

    function bindProductCards() {
        document.querySelectorAll('.produto-card').forEach(card => {
            const key = card.getAttribute('data-produto');
            card.querySelectorAll('.btn-qty').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    if (action === 'increment') adjustQty(key, +1);
                    if (action === 'decrement') adjustQty(key, -1);
                });
            });
        });
    }

    function getSelectedPayments() {
        // Agora é seleção única (radio). Mantemos retorno como array com 1 item por compatibilidade.
        const sel = document.querySelector('input[name="pagamento"]:checked');
        return sel ? [sel.value] : [];
    }

    function getSelectedProducts() {
        return Object.entries(state)
            .filter(([, qty]) => qty > 0)
            .map(([nome, quantidade]) => ({ nome, quantidade }));
    }

    function produtosToString(produtos) {
        return produtos.map(p => `${p.nome}:${p.quantidade}`).join(', ');
    }

    function calcularTotalAtual() {
        const PRECO_UNIT = { p45: 400, p20: 200, p13: 130, p8: 100, p5: 90, agua: 10 };
        let total = 0;
        Object.entries(state).forEach(([nome, quantidade]) => {
            if (quantidade > 0 && PRECO_UNIT[nome] != null) {
                total += PRECO_UNIT[nome] * quantidade;
            }
        });
        return total;
    }

    function formatBRL(valor) {
        try { return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } catch { return 'R$ ' + valor; }
    }

    function updateTotalDisplay() {
        const span = document.getElementById('pedido-total-valor');
        if (!span) return;
        const total = calcularTotalAtual();
        span.textContent = formatBRL(total);
    }

    function showPedidoModal(message, title = 'Aviso', type = 'info', autoClose = false) {
        // cria overlay + card e injeta no body
        const overlay = document.createElement('div');
        overlay.className = 'pedido-modal-overlay';
        overlay.setAttribute('aria-hidden', 'false');

        const card = document.createElement('div');
        card.className = `pedido-modal-card ${type}`;
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-modal', 'true');

        const btnClose = document.createElement('button');
        btnClose.className = 'modal-close';
        btnClose.innerHTML = '&times;';
        btnClose.addEventListener('click', () => { document.body.removeChild(overlay); });

        const h3 = document.createElement('h3');
        h3.className = 'modal-title';
        h3.textContent = title;

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.textContent = message;

        card.appendChild(btnClose);
        card.appendChild(h3);
        card.appendChild(content);
        overlay.appendChild(card);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });

        document.body.appendChild(overlay);
        if (autoClose) setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 5000);
    }

    function handleSubmit() {
        const form = document.getElementById('pedidoForm');
        if (!form) return;

        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const endereco = document.getElementById('enderecoInput')?.value?.trim() || '';
            const cliente = document.getElementById('clienteInput')?.value?.trim() || '';
            const pagamentos = getSelectedPayments();
            const produtos = getSelectedProducts();

            // validações simples
            if (!endereco) {
                showPedidoModal('Informe o endereço.', 'Erro', 'error');
                return;
            }
            if (!cliente) {
                showPedidoModal('Informe o nome do cliente.', 'Erro', 'error');
                return;
            }
            if (produtos.length === 0) {
                showPedidoModal('Selecione ao menos 1 produto (quantidade > 0).', 'Erro', 'error');
                return;
            }
            if (pagamentos.length === 0) {
                showPedidoModal('Selecione ao menos 1 forma de pagamento.', 'Erro', 'error');
                return;
            }

            const produtoStr = produtosToString(produtos);
            const metodo = pagamentos[0];

            // tabela de preços unitários
            const PRECO_UNIT = { p45: 400, p20: 200, p13: 130, p8: 100, p5: 90, agua: 10 };
            let total = 0;
            produtos.forEach(p => {
                if (PRECO_UNIT[p.nome] != null) {
                    total += PRECO_UNIT[p.nome] * p.quantidade;
                }
            });
            // envia como string simples (ex.: "1130") ou poderia formatar BRL
            const precoStr = String(total);

            const payload = { endereco, destinatario: cliente, produto: produtoStr, metodo_pagamento: metodo, preco: precoStr };
            console.log('[pedido] payload pronto para envio', payload);

            try {
                const res = await fetch('/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const body = await res.json().catch(() => ({}));
                if (res.ok) {
                    showPedidoModal('Pedido registrado com sucesso.', 'Sucesso', 'success', true);
                    // resetar quantidades e campos
                    Object.keys(state).forEach(k => { state[k] = 0; updateQtyDisplay(k); });
                    document.getElementById('enderecoInput').value = '';
                    document.getElementById('clienteInput').value = '';
                    // desmarcar pagamentos
                    const sel = document.querySelector('input[name="pagamento"]:checked');
                    if (sel) sel.checked = false;
                    updateTotalDisplay();
                    console.log('Resposta do servidor', body);
                } else {
                    const msg = body?.error || 'Erro ao enviar pedido';
                    showPedidoModal(`Falha ao enviar pedido: ${msg}`, 'Erro', 'error');
                    console.error('Falha ao enviar pedido', body);
                }
            } catch (err) {
                console.error('Erro de rede ao enviar pedido', err);
                showPedidoModal('Erro de rede ao enviar pedido. Veja console para detalhes.', 'Erro', 'error');
            }
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        loadEnderecoSuggestions();
        bindProductCards();
        Object.keys(state).forEach(updateQtyDisplay);
        updateTotalDisplay();

        // Busca endereços já cadastrados e popula um datalist para sugestões
        async function loadEnderecoSuggestions() {
            const input = document.getElementById('enderecoInput');
            if (!input) return;

            const datalistId = 'datalist-clientes-enderecos';
            // evita recriar se já existir
            if (document.getElementById(datalistId)) {
                input.setAttribute('list', datalistId);
                return;
            }

            try {
                const res = await fetch('/dashboard/clientes');
                if (!res.ok) return;
                const data = await res.json().catch(() => null);
                if (!Array.isArray(data)) return;

                // extrai endereços únicos
                const seen = new Set();
                const enderecos = [];
                data.forEach(item => {
                    const e = (item && (item.endereco || item.address || item.rua)) || null;
                    if (e) {
                        const txt = String(e).trim();
                        if (txt && !seen.has(txt)) {
                            seen.add(txt);
                            enderecos.push(txt);
                        }
                    }
                });

                if (enderecos.length === 0) return;

                const dl = document.createElement('datalist');
                dl.id = datalistId;
                // limitar a 100 sugestões por precaução
                enderecos.slice(0, 100).forEach(addr => {
                    const opt = document.createElement('option');
                    opt.value = addr;
                    dl.appendChild(opt);
                });

                document.body.appendChild(dl);
                input.setAttribute('list', datalistId);
            } catch (err) {
                // falha silenciosa — não impede uso manual do campo
                console.debug('Não foi possível carregar sugestões de endereço', err);
            }
        }
        handleSubmit();
    });
})();
