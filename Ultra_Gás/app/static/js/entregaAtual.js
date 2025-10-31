document.addEventListener('DOMContentLoaded', () => {
    // Fetch dynamic data for 'Entrega Atual'
    fetch('/dashboard/entrega-atual')
        .then(response => response.json())
        .then(data => {
            document.getElementById('endereco-dinamico').textContent = data.endereco;
            document.getElementById('nome-destinatario').textContent = data.destinatario;
        })
        .catch(error => console.error('Erro ao buscar dados da entrega atual:', error));

    // Button functionalities
    document.querySelector('.confirmar-entrega').addEventListener('click', () => {
        alert('Entrega confirmada!');
    });

    document.querySelector('.consultar-detalhes').addEventListener('click', () => {
        alert('Detalhes do pedido consultados!');
    });

    document.querySelector('.relatar-problema').addEventListener('click', () => {
        alert('Problema relatado!');
    });
});