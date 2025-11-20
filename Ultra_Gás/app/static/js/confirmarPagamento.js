document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lista-pagamentos-pendentes');
    if (!container) return;

    const scrollUp = document.getElementById('scroll-up-pag');
    const scrollDown = document.getElementById('scroll-down-pag');
    if (scrollUp && scrollDown) {
        scrollUp.addEventListener('click', () => container.scrollBy({ top: -300, left: 0, behavior: 'smooth' }));
        scrollDown.addEventListener('click', () => container.scrollBy({ top: 300, left: 0, behavior: 'smooth' }));
    }

    function render(lista) {
        container.innerHTML = '';
        if (!Array.isArray(lista) || lista.length === 0) {
            container.innerHTML = '<p>Nenhum pagamento pendente.</p>';
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'dashboard-cards';

        lista.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';

            const icon = document.createElement('i');
            icon.className = 'bx bx-wallet icon';

            const body = document.createElement('div');
            body.className = 'entrega-card-body';

            const h2 = document.createElement('h2');
            h2.textContent = item.destinatario || 'Destinatário';

            const pEndereco = document.createElement('p');
            pEndereco.textContent = item.endereco || 'Endereço';

            const pEncarregado = document.createElement('p');
            pEncarregado.textContent = 'Encarregado: ' + (item.encarregado || '-');

            const pProduto = document.createElement('p');
            pProduto.textContent = 'Produto: ' + (item.produto || '-');

            const pPreco = document.createElement('p');
            pPreco.textContent = 'Preço: R$ ' + (item.preco || '0');

            const btnPagar = document.createElement('button');
            btnPagar.className = 'small-btn';
            btnPagar.textContent = 'Marcar Pago';

            btnPagar.addEventListener('click', () => marcarPago(item.id, card));

            body.appendChild(h2);
            body.appendChild(pEndereco);
            body.appendChild(pEncarregado);
            body.appendChild(pProduto);
            body.appendChild(pPreco);
            body.appendChild(btnPagar);

            card.appendChild(icon);
            card.appendChild(body);
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }

    function fetchPendentes() {
        container.innerHTML = 'Carregando...';
        fetch('/dashboard/pagamentos-pendentes')
            .then(r => r.json())
            .then(render)
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p>Erro ao carregar pagamentos pendentes.</p>';
            });
    }

    function marcarPago(id, cardEl) {
        if (!id) return;
        fetch(`/api/entregas/${id}/pagar`, { method: 'POST' })
            .then(r => r.json())
            .then(resp => {
                if (resp.ok) {
                    cardEl.classList.add('pago');
                    setTimeout(fetchPendentes, 400);
                } else {
                    alert(resp.error || 'Falha ao marcar pago');
                }
            })
            .catch(() => alert('Erro na requisição de pagamento'));
    }

    fetchPendentes();
});
