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

    function handleSubmit() {
        const form = document.getElementById('pedidoForm');
        if (!form) return;

        form.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const endereco = document.getElementById('enderecoInput')?.value?.trim() || '';
            const cliente = document.getElementById('clienteInput')?.value?.trim() || '';
            const pagamentos = getSelectedPayments();
            const produtos = getSelectedProducts();

            // validações simples
            if (!endereco) {
                alert('Informe o endereço.');
                return;
            }
            if (!cliente) {
                alert('Informe o nome do cliente.');
                return;
            }
            if (produtos.length === 0) {
                alert('Selecione ao menos 1 produto (quantidade > 0).');
                return;
            }
            if (pagamentos.length === 0) {
                alert('Selecione ao menos 1 forma de pagamento.');
                return;
            }

            const payload = { endereco, cliente, produtos, pagamentos };
            console.log('[pedido] payload pronto para envio', payload);

            // Aqui poderíamos enviar para o backend (ex.: POST /api/pedidos)
            // fetch('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            //   .then(r => r.json())
            //   .then(resp => { console.log('Pedido enviado com sucesso', resp); })
            //   .catch(err => { console.error('Falha ao enviar pedido', err); });

            alert('Pedido pronto para envio (veja o console para o payload).');
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        bindProductCards();
        Object.keys(state).forEach(updateQtyDisplay);
        handleSubmit();
    });
})();
