document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('lista-entregas');
    if (!container) return;

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

                body.appendChild(h2);
                body.appendChild(p);

                // opcional: ações pequenas (ex.: visualizar, confirmar)
                const actions = document.createElement('div');
                actions.className = 'card-actions-inline';
                const btnView = document.createElement('button');
                btnView.className = 'small-btn';
                btnView.textContent = 'Visualizar';
                const btnConfirm = document.createElement('button');
                btnConfirm.className = 'small-btn';
                btnConfirm.textContent = 'Confirmar';
                actions.appendChild(btnView);
                actions.appendChild(btnConfirm);

                body.appendChild(actions);

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
