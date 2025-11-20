document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('lista-historico');
    if (!container) return;

    container.innerHTML = 'Carregando...';

    fetch('/dashboard/historico-entregas')
        .then(function (res) {
            if (!res.ok) throw new Error('Resposta de rede não OK');
            return res.json();
        })
        .then(function (data) {
            container.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p>Nenhuma entrega no histórico.</p>';
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

                const pEndereco = document.createElement('p');
                pEndereco.textContent = item.endereco || 'Endereço';

                const pProduto = document.createElement('p');
                pProduto.textContent = 'Produto: ' + (item.produto || '-');

                const pMetodo = document.createElement('p');
                pMetodo.textContent = 'Pagamento: ' + (item.metodo_pagamento || '-');

                const pPreco = document.createElement('p');
                pPreco.textContent = 'Preço: R$ ' + (item.preco || '0');

                body.appendChild(h2);
                body.appendChild(pEndereco);
                body.appendChild(pProduto);
                body.appendChild(pMetodo);
                body.appendChild(pPreco);

                card.appendChild(icon);
                card.appendChild(body);

                grid.appendChild(card);
            });

            container.appendChild(grid);

            // conectar botões de scroll do histórico
            const scrollUp = document.getElementById('scroll-up-hist');
            const scrollDown = document.getElementById('scroll-down-hist');
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
            container.innerHTML = '<p>Erro ao carregar histórico de entregas.</p>';
        });
});
