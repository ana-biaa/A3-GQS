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
    });
});
