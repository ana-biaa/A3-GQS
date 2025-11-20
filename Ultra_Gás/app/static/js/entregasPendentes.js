document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('lista-entregas');
    if (!container) return;

    function formatMetodo(m) {
        switch (m) {
            case 'pix': return 'Pix';
            case 'a_prazo': return 'A prazo';
            case 'cartao': return 'Cartão';
            case 'dinheiro': return 'Dinheiro';
            default: return m || '';
        }
    }

    container.innerHTML = 'Carregando...';

    fetch('/dashboard/entregas-pendentes')
        .then(function (res) {
            if (!res.ok) throw new Error('Resposta de rede não OK');
            return res.json();
        })
        .then(function (data) {
            container.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p>Nenhuma entrega pendente.</p>';
                return;
            }

            const grid = document.createElement('div');
            grid.className = 'dashboard-cards';

            data.forEach(function (item) {
                const card = document.createElement('div');
                card.className = 'card';

                const icon = document.createElement('i');
                icon.className = 'bx bxs-truck icon';

                const body = document.createElement('div');
                body.className = 'entrega-card-body';

                const h2 = document.createElement('h2');
                h2.textContent = item.destinatario || 'Destinatário';

                const p = document.createElement('p');
                p.textContent = item.endereco || 'Endereço';

                const prod = document.createElement('p');
                prod.className = 'produto-text';
                prod.textContent = item.produto ? `Produtos: ${item.produto}` : '';

                // elemento de método de pagamento
                const metodo = document.createElement('p');
                metodo.className = 'metodo-pagamento';
                metodo.textContent = item.metodo_pagamento ? `Pagamento: ${formatMetodo(item.metodo_pagamento)}` : '';

                body.appendChild(h2);
                body.appendChild(p);
                if (prod.textContent) body.appendChild(prod);
                if (metodo.textContent) body.appendChild(metodo);

                // opcional: ações pequenas (ex.: visualizar, confirmar)
                const actions = document.createElement('div');
                actions.className = 'card-actions-inline';
                const btnView = document.createElement('button');
                btnView.className = 'small-btn';
                btnView.textContent = 'Visualizar';
                const btnRetirar = document.createElement('button');
                btnRetirar.className = 'small-btn';
                btnRetirar.textContent = 'Retirar';
                actions.appendChild(btnView);
                actions.appendChild(btnRetirar);

                body.appendChild(actions);

                // Modal visualizar
                btnView.addEventListener('click', function () {
                    const overlay = document.createElement('div');
                    overlay.className = 'pedido-modal-overlay';
                    const modal = document.createElement('div');
                    modal.className = 'pedido-modal-card';
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'modal-close';
                    closeBtn.innerHTML = '&times;';
                    const title = document.createElement('h3');
                    title.textContent = 'Detalhes da Entrega';
                    const info = document.createElement('div');
                    info.className = 'modal-info';
                    info.innerHTML = `
                        <p><strong>Destinatário:</strong> ${item.destinatario || ''}</p>
                        <p><strong>Endereço:</strong> ${item.endereco || ''}</p>
                        <p><strong>Produtos:</strong> ${item.produto || ''}</p>
                        <p><strong>Método de Pagamento:</strong> ${formatMetodo(item.metodo_pagamento) || ''}</p>
                        <p><strong>Preço:</strong> R$ ${item.preco || '0'}</p>
                    `;
                    closeBtn.addEventListener('click', function () {
                        overlay.remove();
                    });
                    overlay.addEventListener('click', function (ev) {
                        if (ev.target === overlay) overlay.remove();
                    });
                    modal.appendChild(closeBtn);
                    modal.appendChild(title);
                    modal.appendChild(info);
                    overlay.appendChild(modal);
                    document.body.appendChild(overlay);
                });

                // Retirar (atribuir encarregado)
                btnRetirar.addEventListener('click', function () {
                    if (!item.id) {
                        console.warn('Entrega sem id, não é possível retirar.');
                        return;
                    }
                    btnRetirar.disabled = true;
                    fetch(`/api/entregas/${item.id}/retirar`, { method: 'POST' })
                        .then(r => r.json().then(j => ({ ok: r.ok, status: r.status, data: j })))
                        .then(resp => {
                            if (!resp.ok) {
                                btnRetirar.disabled = false;
                                mostrarMensagem(`Falha: ${resp.data.error || 'Erro ao retirar.'}`);
                                return;
                            }
                            // Remove card da lista (deixará de aparecer entre pendentes)
                            card.remove();
                            mostrarMensagem('Entrega atribuída ao seu usuário.');
                            // Dispara evento para atualizar bloco de entrega atual
                            setTimeout(() => {
                                document.dispatchEvent(new CustomEvent('entrega-atual-atualizar'));
                            }, 150);
                        })
                        .catch(err => {
                            console.error(err);
                            btnRetirar.disabled = false;
                            mostrarMensagem('Erro de rede ao retirar.');
                        });
                });

                function mostrarMensagem(msg) {
                    const overlay = document.createElement('div');
                    overlay.className = 'pedido-modal-overlay';
                    const modal = document.createElement('div');
                    modal.className = 'pedido-modal-card';
                    const pMsg = document.createElement('p');
                    pMsg.textContent = msg;
                    modal.appendChild(pMsg);
                    overlay.appendChild(modal);
                    document.body.appendChild(overlay);
                    setTimeout(() => overlay.remove(), 3000);
                }

                card.appendChild(icon);
                card.appendChild(body);

                grid.appendChild(card);
            });

            // limpa e adiciona
            container.innerHTML = '';
            container.appendChild(grid);

            // conectar botões de scroll (existem no template)
            const scrollUp = document.getElementById('scroll-up');
            const scrollDown = document.getElementById('scroll-down');
            if (scrollUp && scrollDown) {
                scrollUp.addEventListener('click', function () {
                    container.scrollBy({ top: -300, left: 0, behavior: 'smooth' });
                });
                scrollDown.addEventListener('click', function () {
                    container.scrollBy({ top: 300, left: 0, behavior: 'smooth' });
                });
            }
        })
        .catch(function (err) {
            console.error(err);
            container.innerHTML = '<p>Erro ao carregar entregas pendentes.</p>';
        });
});
