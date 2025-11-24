document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lista-entrega-atual');
    if (!container) return;

    const scrollUp = document.getElementById('scroll-up-atual');
    const scrollDown = document.getElementById('scroll-down-atual');
    if (scrollUp && scrollDown) {
        scrollUp.addEventListener('click', () => container.scrollBy({ top: -300, left: 0, behavior: 'smooth' }));
        scrollDown.addEventListener('click', () => container.scrollBy({ top: 300, left: 0, behavior: 'smooth' }));
    }

    function render(lista) {
        container.innerHTML = '';
        if (!Array.isArray(lista) || lista.length === 0) {
            container.innerHTML = '<p>Nenhuma entrega atribuída.</p>';
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'dashboard-cards';

        lista.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';

            const icon = document.createElement('i');
            icon.className = 'bx bxs-truck icon';

            const body = document.createElement('div');
            body.className = 'entrega-card-body';

            const h2 = document.createElement('h2');
            h2.textContent = item.destinatario || 'Destinatário';

            const pEndereco = document.createElement('p');
            pEndereco.textContent = item.endereco || 'Endereço';

            const actions = document.createElement('div');
            actions.className = 'card-actions-inline';

            const btnConfirm = document.createElement('button');
            btnConfirm.className = 'small-btn confirmar-entrega';
            btnConfirm.textContent = 'Confirmar';

            const btnDetalhes = document.createElement('button');
            btnDetalhes.className = 'small-btn consultar-detalhes';
            btnDetalhes.textContent = 'Detalhes';

            const btnProblema = document.createElement('button');
            btnProblema.className = 'small-btn relatar-problema';
            btnProblema.textContent = 'Problema';

            // Eventos
            btnConfirm.addEventListener('click', () => confirmarEntrega(item.id, card));
            btnDetalhes.addEventListener('click', () => mostrarDetalhes(item));
            btnProblema.addEventListener('click', () => alert('Funcionalidade de problema ainda não definida.'));

            actions.appendChild(btnConfirm);
            actions.appendChild(btnDetalhes);
            actions.appendChild(btnProblema);

            body.appendChild(h2);
            body.appendChild(pEndereco);
            body.appendChild(actions);
            card.appendChild(icon);
            card.appendChild(body);
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }

    function fetchEntregas() {
        container.innerHTML = 'Carregando...';
        fetch('/dashboard/entrega-atual')
            .then(r => r.json())
            .then(render)
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p>Erro ao carregar entrega atual.</p>';
            });
    }

    // Atualiza quando evento global disparado após retirar nova entrega
    document.addEventListener('entrega-atual-atualizar', () => fetchEntregas());

    function confirmarEntrega(id, cardEl) {
        if (!id) return;
        fetch(`/api/entregas/${id}/confirm`, { method: 'POST' })
            .then(r => r.json())
            .then(resp => {
                if (resp.ok) {
                    cardEl.classList.add('entregue');
                    setTimeout(() => {
                        fetchEntregas();
                        // Atualiza cards do dashboard (ex.: entregas concluídas)
                        if (typeof fetchAndApplyDashboardCards === 'function') {
                            fetchAndApplyDashboardCards();
                        } else {
                            // fallback: dispara evento para quem quiser ouvir
                            document.dispatchEvent(new CustomEvent('dashboard-cards-atualizar'));
                        }
                    }, 400);
                } else {
                    alert('Falha ao confirmar entrega');
                }
            })
            .catch(() => alert('Erro na requisição de confirmação'));
    }

    function mostrarDetalhes(item) {
        const overlay = document.createElement('div');
        overlay.className = 'pedido-modal-overlay';

        const card = document.createElement('div');
        card.className = 'pedido-modal-card info';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => overlay.remove());

        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.textContent = 'Detalhes da Entrega';

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.innerHTML = `
            <p><strong>Endereço:</strong> ${item.endereco || '-'} </p>
            <p><strong>Destinatário:</strong> ${item.destinatario || '-'} </p>
            <p><strong>Produto(s):</strong> ${item.produto || '-'} </p>
            <p><strong>Método Pagamento:</strong> ${item.metodo_pagamento || '-'} </p>
            <p><strong>Preço:</strong> R$ ${item.preco || '0'} </p>
        `;

        card.appendChild(closeBtn);
        card.appendChild(title);
        card.appendChild(content);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    }

    fetchEntregas();
});