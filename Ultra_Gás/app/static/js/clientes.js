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

// --- Modal + fluxo de cadastro de cliente (reutiliza estilo dos modals de pedido) ---
(function () {
    const btn = document.getElementById('btn-cadastrar-cliente');
    if (!btn) return;

    function showClienteModalMessage(message, title = 'Aviso', type = 'info', autoClose = false) {
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

    function openCadastroModal() {
        const overlay = document.createElement('div');
        overlay.className = 'pedido-modal-overlay';

        const card = document.createElement('div');
        card.className = 'pedido-modal-card info';
        card.setAttribute('role', 'dialog');

        const close = document.createElement('button');
        close.className = 'modal-close';
        close.innerHTML = '&times;';
        close.addEventListener('click', () => document.body.removeChild(overlay));

        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.textContent = 'Cadastrar Cliente';

        const content = document.createElement('div');
        content.className = 'modal-content';

        // form fields
        const fRua = document.createElement('input');
        fRua.type = 'text';
        fRua.placeholder = 'Rua das Tâmaras';
        fRua.id = 'cad-rua';
        fRua.style.width = '100%';
        fRua.style.padding = '8px';
        fRua.style.marginBottom = '8px';
        fRua.style.borderRadius = '8px';
        fRua.style.border = '1px solid rgba(0,0,0,0.08)';

        const fNumero = document.createElement('input');
        // usar tipo number para teclado numérico, mas também sanitizar a entrada
        fNumero.type = 'number';
        fNumero.placeholder = '13';
        fNumero.id = 'cad-numero';
        fNumero.style.width = '100%';
        fNumero.style.padding = '8px';
        fNumero.style.marginBottom = '8px';
        fNumero.style.borderRadius = '8px';
        fNumero.style.border = '1px solid rgba(0,0,0,0.08)';
        fNumero.setAttribute('inputmode', 'numeric');
        fNumero.setAttribute('pattern', '\\d*');
        fNumero.setAttribute('min', '0');
        // evitar inserção de caracteres não numéricos via teclado
        fNumero.addEventListener('keydown', function (e) {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
            if (e.ctrlKey || e.metaKey) return; // permitir atalhos
            if (allowed.includes(e.key)) return;
            // permitir apenas dígitos
            if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
            }
        });
        // sanitizar colagens/inputs para remover qualquer caractere não numérico
        fNumero.addEventListener('input', function () {
            if (this.value == null) return;
            const sanitized = String(this.value).replace(/\D+/g, '');
            if (this.value !== sanitized) this.value = sanitized;
        });

        const fBairro = document.createElement('input');
        fBairro.type = 'text';
        fBairro.placeholder = 'Bairro Savassi';
        fBairro.id = 'cad-bairro';
        fBairro.style.width = '100%';
        fBairro.style.padding = '8px';
        fBairro.style.marginBottom = '12px';
        fBairro.style.borderRadius = '8px';
        fBairro.style.border = '1px solid rgba(0,0,0,0.08)';

        const btnSubmit = document.createElement('button');
        btnSubmit.type = 'button';
        btnSubmit.className = 'btn-submit';
        btnSubmit.textContent = 'Salvar Cliente';
        btnSubmit.style.marginTop = '6px';

        content.appendChild(fRua);
        content.appendChild(fNumero);
        content.appendChild(fBairro);
        content.appendChild(btnSubmit);

        card.appendChild(close);
        card.appendChild(title);
        card.appendChild(content);
        overlay.appendChild(card);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) document.body.removeChild(overlay); });

        document.body.appendChild(overlay);

        btnSubmit.addEventListener('click', async () => {
            const rua = (document.getElementById('cad-rua')?.value || '').trim();
            const numero = (document.getElementById('cad-numero')?.value || '').trim();
            const bairro = (document.getElementById('cad-bairro')?.value || '').trim();

            if (!rua) { showClienteModalMessage('Campo Rua é obrigatório', 'Erro', 'error'); return; }
            if (!numero) { showClienteModalMessage('Campo Número é obrigatório', 'Erro', 'error'); return; }

            let endereco = `${rua}, ${numero}`;
            if (bairro) endereco = `${endereco}, ${bairro}`;

            try {
                const res = await fetch('/api/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endereco })
                });
                const body = await res.json().catch(() => ({}));
                if (res.ok) {
                    // fechar modal
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    showClienteModalMessage('Cliente cadastrado com sucesso!', 'Sucesso', 'success', true);

                    // atualizar lista na UI se presente
                    const lista = document.getElementById('lista-clientes');
                    if (lista) {
                        const li = document.createElement('li');
                        li.textContent = endereco;
                        lista.appendChild(li);
                    }

                    // atualizar datalist de endereços caso exista
                    const dl = document.getElementById('datalist-clientes-enderecos');
                    if (dl) {
                        const opt = document.createElement('option');
                        opt.value = endereco;
                        dl.appendChild(opt);
                    }
                } else {
                    const msg = body?.error || 'Erro ao cadastrar cliente';
                    showClienteModalMessage(`Erro ao cadastrar, verifique os dados: ${msg}`, 'Erro', 'error');
                }
            } catch (err) {
                console.error('Erro ao criar cliente', err);
                showClienteModalMessage('Erro de rede ao cadastrar cliente', 'Erro', 'error');
            }
        });
    }

    btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        openCadastroModal();
    });
})();
