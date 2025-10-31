document.addEventListener('DOMContentLoaded', function () {
    const list = document.getElementById('lista-clientes');
    if (!list) return;

    list.innerHTML = 'Carregando...';

    fetch('/dashboard/clientes')
        .then(function (res) {
            if (!res.ok) throw new Error('Resposta de rede não OK');
            return res.json();
        })
        .then(function (data) {
            list.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                list.innerHTML = '<li>Nenhum cliente encontrado.</li>';
                return;
            }

            data.forEach(function (item) {
                const li = document.createElement('li');
                li.textContent = item.endereco || 'Endereço não informado';
                list.appendChild(li);
            });

            // scroll controls
            const scrollUp = document.getElementById('scroll-up-clientes');
            const scrollDown = document.getElementById('scroll-down-clientes');
            if (scrollUp && scrollDown) {
                scrollUp.addEventListener('click', function () {
                    list.scrollBy({ top: -200, left: 0, behavior: 'smooth' });
                });
                scrollDown.addEventListener('click', function () {
                    list.scrollBy({ top: 200, left: 0, behavior: 'smooth' });
                });
            }
        })
        .catch(function (err) {
            console.error(err);
            list.innerHTML = '<li>Erro ao carregar clientes.</li>';
        });
});
