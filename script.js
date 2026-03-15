// Alternância de tema noite/dia
window.addEventListener('DOMContentLoaded', function() {
    const btnTheme = document.getElementById('toggle-theme');
    let isNight = false;
    btnTheme.addEventListener('click', function() {
        isNight = !isNight;
        if (isNight) {
            document.body.classList.add('night-mode');
            btnTheme.textContent = '☀️ Modo Dia';
                } else {
            document.body.classList.remove('night-mode');
            btnTheme.textContent = '🌙 Modo Noite';
        }
    });
});
// Máscara para permitir apenas 1 inteiro e até 2 decimais (ex: 9.99)
function aplicarMascaraMoeda(input) {
    let valor = input.value.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (valor.length > 3) valor = valor.slice(0, 3); // Limita a 3 dígitos
    if (valor.length === 0) {
        input.value = '';
        return;
    }
    if (valor.length === 1) {
        input.value = valor;
    } else if (valor.length === 2) {
        input.value = valor[0] + '.' + valor[1];
    } else if (valor.length === 3) {
        input.value = valor[0] + '.' + valor.slice(1);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    const gasInput = document.getElementById('gasolina');
    const alcInput = document.getElementById('alcool');
    gasInput.setAttribute('maxlength', '4');
    alcInput.setAttribute('maxlength', '4');
    gasInput.addEventListener('input', function() {
        aplicarMascaraMoeda(this);
        // Se atingiu o limite, passa para o próximo input
        if (this.value.length >= 4) {
            alcInput.focus();
        }
    });
    alcInput.addEventListener('input', function() { aplicarMascaraMoeda(this); });
});
function calcular() {
    const precoGas = parseFloat(document.getElementById('gasolina').value);
    const precoAlc = parseFloat(document.getElementById('alcool').value);
    const resultado = document.getElementById('resultado');


    if (!precoGas || !precoAlc) {
        resultado.innerText = "Preencha os dois valores.";
        resultado.className = "";
        return;
    }

    if (precoGas <= 0 || precoAlc <= 0) {
        resultado.innerText = "Os valores devem ser maiores que zero.";
        resultado.className = "";
        return;
    }

    const proporcao = precoAlc / precoGas;

    if (proporcao >= 0.7) {
        resultado.innerText = "A GASOLINA compensa mais!";
        resultado.className = "res-gas";
    } else {
        resultado.innerText = "O ÁLCOOL compensa mais!";
        resultado.className = "res-alc";
    }

    // Exibe apenas o botão resetar após o cálculo
    document.getElementById('btn-resetar').style.display = 'block';
    document.getElementById('btn-calcular').style.display = 'none';
}

function resetar() {
    document.getElementById('gasolina').value = '';
    document.getElementById('alcool').value = '';
    const resultado = document.getElementById('resultado');
    resultado.innerText = '';
    resultado.className = '';
    // Esconde o botão resetar e mostra o calcular novamente
    document.getElementById('btn-resetar').style.display = 'none';
    document.getElementById('btn-calcular').style.display = 'block';
}