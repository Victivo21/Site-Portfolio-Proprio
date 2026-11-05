tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            }
        }
    }
}

 document.addEventListener('DOMContentLoaded', function () {
// Cria os ícones do menu (só funciona depois que o HTML existe)
lucide.createIcons();

// GRÁFICO INTERATIVO NO CANVAS
const canvas = document.getElementById('meuCanvas');
if (canvas) {
const ctx = canvas.getContext('2d');
const W = 320, H = 200;
const pad = { l: 28, r: 14, t: 16, b: 24 };
const rotulos = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'];
const pontos = [30, 70, 45, 85, 60, 110, 90, 140];
const maxVal = 160;

// Nitidez em telas de alta densidade (retina)
const dpr = window.devicePixelRatio || 1;
canvas.width = W * dpr;
canvas.height = H * dpr;
ctx.scale(dpr, dpr);

const xDe = i => pad.l + i * ((W - pad.l - pad.r) / (pontos.length - 1));
const yDe = v => H - pad.b - (v / maxVal) * (H - pad.t - pad.b);

let hover = -1;      // índice do ponto sob o mouse
let selecionado = -1; // ponto fixado por clique
let progresso = 1;    // 0..1 (animação de entrada)

function desenhar() {
    ctx.clearRect(0, 0, W, H);
    ctx.font = '10px sans-serif';

    // Grade + eixo Y
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    for (let v = 0; v <= maxVal; v += 40) {
        const y = yDe(v);
        ctx.strokeStyle = '#f0f0f0';
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        ctx.fillStyle = '#999';
        ctx.fillText(v, pad.l - 6, y + 3);
    }

    // Rótulos do eixo X
    ctx.textAlign = 'center';
    ctx.fillStyle = '#999';
    rotulos.forEach((r, i) => ctx.fillText(r, xDe(i), H - 8));

    // Linha guia vertical no ponto ativo
    const ativo = hover >= 0 ? hover : selecionado;
    if (ativo >= 0) {
        ctx.strokeStyle = '#d4d4d4';
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(xDe(ativo), pad.t); ctx.lineTo(xDe(ativo), H - pad.b); ctx.stroke();
        ctx.setLineDash([]);
    }

    // Linha principal (revelada aos poucos na animação)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, pad.l + (W - pad.l) * progresso, H);
    ctx.clip();
    ctx.beginPath();
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    pontos.forEach((v, i) => i ? ctx.lineTo(xDe(i), yDe(v)) : ctx.moveTo(xDe(i), yDe(v)));
    ctx.stroke();
    ctx.restore();

    // Pontos
    pontos.forEach((v, i) => {
        if (xDe(i) > pad.l + (W - pad.l) * progresso) return;
        const destaque = i === ativo;
        ctx.beginPath();
        ctx.arc(xDe(i), yDe(v), destaque ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = destaque ? '#111111' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Tooltip
    if (ativo >= 0) {
        const txt = rotulos[ativo] + ': ' + pontos[ativo];
        const tw = ctx.measureText(txt).width + 14;
        let tx = xDe(ativo) - tw / 2;
        tx = Math.max(2, Math.min(W - tw - 2, tx));
        let ty = yDe(pontos[ativo]) - 32;
        if (ty < 2) ty = yDe(pontos[ativo]) + 12;
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(tx, ty, tw, 20, 4) : ctx.rect(tx, ty, tw, 20);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(txt, tx + tw / 2, ty + 14);
    }
}

// Descobre qual ponto está perto do mouse/toque
function pontoPerto(evento) {
    const r = canvas.getBoundingClientRect();
    const mx = (evento.clientX - r.left) * (W / r.width);
    const my = (evento.clientY - r.top) * (H / r.height);
    let melhor = -1, menor = 18; // raio de captura em px
    pontos.forEach((v, i) => {
        const d = Math.hypot(mx - xDe(i), my - yDe(v));
        if (d < menor) { menor = d; melhor = i; }
    });
    return melhor;
}

canvas.style.cursor = 'default';
canvas.addEventListener('mousemove', e => {
    hover = pontoPerto(e);
    canvas.style.cursor = hover >= 0 ? 'pointer' : 'default';
    desenhar();
});
canvas.addEventListener('mouseleave', () => { hover = -1; desenhar(); });
canvas.addEventListener('click', e => {
    const i = pontoPerto(e);
    selecionado = (i === selecionado) ? -1 : i; // clicar de novo desmarca
    desenhar();
});

// Animação de entrada
progresso = 0;
const inicio = performance.now();
(function animar(t) {
    progresso = Math.min(1, (t - inicio) / 900);
    desenhar();
    if (progresso < 1) requestAnimationFrame(animar);
})(inicio);
}
});


// State Management
let currentStyle = 'wireframe'; // 'wireframe' | 'blueprint'

function setStyle(style) {
    currentStyle = style;
    const canvas = document.getElementById('wireframe-canvas');
    const btnWireframe = document.getElementById('btn-style-wireframe');
    const btnBlueprint = document.getElementById('btn-style-blueprint');

    if (style === 'blueprint') {
        canvas.classList.remove('bg-slate-50', 'wireframe-grid', 'border-slate-300');
        canvas.classList.add('bg-slate-900', 'blueprint-grid', 'border-sky-800');
        
        document.querySelectorAll('#wireframe-canvas section').forEach(sec => {
            sec.classList.remove('bg-white', 'border-slate-400');
            sec.classList.add('bg-slate-800', 'border-sky-500/50', 'text-slate-100');
        });

        document.querySelectorAll('#wireframe-canvas h1, #wireframe-canvas h2').forEach(h => {
            h.classList.remove('text-slate-800');
            h.classList.add('text-sky-300');
        });

        btnBlueprint.className = 'px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm';
        btnWireframe.className = 'px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
    } else {
        canvas.classList.remove('bg-slate-900', 'blueprint-grid', 'border-sky-800');
        canvas.classList.add('bg-slate-50', 'wireframe-grid', 'border-slate-300');

        document.querySelectorAll('#wireframe-canvas section').forEach(sec => {
            sec.classList.remove('bg-slate-800', 'border-sky-500/50', 'text-slate-100');
            sec.classList.add('bg-white', 'border-slate-400');
        });

        document.querySelectorAll('#wireframe-canvas h1, #wireframe-canvas h2').forEach(h => {
            h.classList.remove('text-sky-300');
            h.classList.add('text-slate-800');
        });

        btnWireframe.className = 'px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm';
        btnBlueprint.className = 'px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white';
    }
}

function toggleInfoModal() {
    const modal = document.getElementById('modal-info');
    modal.classList.toggle('hidden');
}

/* =====================================================================
FEATURE 1 — METAS DE ESTUDO (curriculo.html)
Lista interativa salva em localStorage: continua lá após recarregar.
===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
const lista = document.getElementById('meta-lista');
if (!lista) return; // só roda na página do currículo

const CHAVE = 'portfolio:metas';
const form = document.getElementById('form-metas');
const input = document.getElementById('meta-input');
const erro = document.getElementById('meta-erro');
const vazio = document.getElementById('meta-vazio');
const contador = document.getElementById('meta-contador');
const percent = document.getElementById('meta-percent');
const barra = document.getElementById('meta-barra');
const botoesFiltro = document.querySelectorAll('#meta-filtros [data-filtro]');
const btnLimpar = document.getElementById('meta-limpar');

let filtro = 'todas';

function metasIniciais() {
return [
    { id: 'm1', texto: 'Concluir o curso de ADS', feito: false },
    { id: 'm2', texto: 'Praticar JavaScript toda semana', feito: false },
    { id: 'm3', texto: 'Montar este portfólio', feito: true }
];
}

function carregar() {
try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) return metasIniciais(); // primeira visita
    const dados = JSON.parse(bruto);
    return Array.isArray(dados) ? dados : [];
} catch (e) {
    return metasIniciais();
}
}

let metas = carregar();

function mostrarErro(msg) {
erro.textContent = msg;
erro.classList.toggle('hidden', !msg);
input.classList.toggle('border-red-500', !!msg);
input.classList.toggle('border-slate-300', !msg);
input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function salvar() {
try {
    localStorage.setItem(CHAVE, JSON.stringify(metas));
} catch (e) {
    mostrarErro('Não foi possível salvar neste navegador (armazenamento bloqueado).');
}
}

function render() {
lista.innerHTML = '';

const visiveis = metas.filter(m =>
    filtro === 'todas' ? true : filtro === 'concluidas' ? m.feito : !m.feito
);

visiveis.forEach(m => {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = m.feito;
    cb.id = 'meta-' + m.id;
    cb.className = 'w-4 h-4 accent-blue-600 cursor-pointer shrink-0';
    cb.addEventListener('change', () => {
        m.feito = cb.checked;
        salvar();
        render();
    });

    const label = document.createElement('label');
    label.htmlFor = cb.id;
    label.textContent = m.texto; // textContent evita injeção de HTML
    label.className = 'flex-1 text-sm cursor-pointer break-words ' +
        (m.feito ? 'line-through text-slate-400' : 'text-slate-800');

    const del = document.createElement('button');
    del.type = 'button';
    del.setAttribute('aria-label', 'Remover meta: ' + m.texto);
    del.className = 'text-slate-400 hover:text-red-600 transition shrink-0';
    del.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    del.addEventListener('click', () => {
        metas = metas.filter(x => x.id !== m.id);
        salvar();
        render();
    });

    li.append(cb, label, del);
    lista.appendChild(li);
});

// Estado vazio
vazio.classList.toggle('hidden', visiveis.length > 0);

// Contador + barra de progresso
const feitas = metas.filter(m => m.feito).length;
const pct = metas.length ? Math.round((feitas / metas.length) * 100) : 0;
contador.textContent = feitas + ' de ' + metas.length + ' concluídas';
percent.textContent = pct + '%';
barra.style.width = pct + '%';

// Visual dos filtros
botoesFiltro.forEach(b => {
    const ativo = b.dataset.filtro === filtro;
    b.className = 'px-3 py-1 rounded-md text-xs font-semibold border transition ' +
        (ativo ? 'bg-blue-600 text-white border-blue-600'
               : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100');
});

btnLimpar.disabled = feitas === 0;
btnLimpar.classList.toggle('opacity-50', feitas === 0);
btnLimpar.classList.toggle('cursor-not-allowed', feitas === 0);

if (window.lucide) lucide.createIcons();
}

form.addEventListener('submit', e => {
e.preventDefault();
const texto = input.value.trim();

if (!texto) return mostrarErro('Digite uma meta antes de adicionar.');
if (texto.length < 3) return mostrarErro('A meta precisa ter pelo menos 3 caracteres.');
if (metas.some(m => m.texto.toLowerCase() === texto.toLowerCase())) {
    return mostrarErro('Você já tem uma meta com esse nome.');
}

mostrarErro('');
metas.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), texto, feito: false });
salvar();
input.value = '';
filtro = 'todas';
render();
input.focus();
});

input.addEventListener('input', () => mostrarErro(''));

botoesFiltro.forEach(b => b.addEventListener('click', () => {
filtro = b.dataset.filtro;
render();
}));

btnLimpar.addEventListener('click', () => {
metas = metas.filter(m => !m.feito);
salvar();
render();
});

render();
});


/* =====================================================================
FEATURE 2 — VALIDAÇÃO DO FORMULÁRIO DE CONTATO (formulario.html)
Mensagens de erro embaixo de cada campo + banner de sucesso/erro.
===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
const form = document.getElementById('form-contato');
if (!form) return; // só roda na página do formulário

const feedback = document.getElementById('form-feedback');
const campos = ['nome', 'nascimento', 'email', 'assunto', 'contato', 'mensagem', 'musica'];
const tocados = new Set(); // campos que o usuário já visitou

// Data de hoje no formato yyyy-mm-dd (fuso local)
const d = new Date();
const hoje = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
document.getElementById('nascimento').max = hoje;

// Cada regra devolve uma mensagem de erro ('' = válido)
const regras = {
nome(v) {
    if (!v) return 'Informe seu nome.';
    if (v.length < 3) return 'O nome precisa ter pelo menos 3 caracteres.';
    if (!/^[A-Za-zÀ-ÿ' -]+$/.test(v)) return 'Use apenas letras no nome.';
    return '';
},
nascimento(v) {
    if (!v) return 'Informe sua data de nascimento.';
    if (v > hoje) return 'A data de nascimento não pode estar no futuro.';
    if (v < '1900-01-01') return 'Data de nascimento inválida.';
    return '';
},
email(v) {
    if (!v) return 'Informe seu e-mail.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Digite um e-mail válido, como nome@exemplo.com.';
    return '';
},
assunto(v) {
    if (!v) return 'Informe o assunto.';
    if (v.length < 3) return 'O assunto precisa ter pelo menos 3 caracteres.';
    return '';
},
contato(v) { // opcional, mas se preenchido precisa ser telefone válido
    if (!v) return '';
    const digitos = v.replace(/\D/g, '');
    if (!/^[\d\s()+-]+$/.test(v) || digitos.length < 10 || digitos.length > 13) {
        return 'Telefone inválido. Exemplo: (11) 99999-9999.';
    }
    return '';
},
mensagem(v) {
    if (!v) return 'Escreva sua mensagem.';
    if (v.length < 10) return 'A mensagem precisa ter pelo menos 10 caracteres (faltam ' + (10 - v.length) + ').';
    if (v.length > 500) return 'A mensagem pode ter no máximo 500 caracteres.';
    return '';
},
musica() { return ''; } // opcional
};

function validarCampo(id) {
const el = document.getElementById(id);
const msg = regras[id](el.value.trim());
const p = document.getElementById('erro-' + id);

p.textContent = msg;
p.classList.toggle('hidden', !msg);
el.setAttribute('aria-invalid', msg ? 'true' : 'false');

const preenchidoOk = !msg && el.value.trim() !== '';
el.classList.toggle('border-red-500', !!msg);
el.classList.toggle('focus:ring-red-500', !!msg);
el.classList.toggle('border-green-500', preenchidoOk);
el.classList.toggle('border-slate-300', !msg && !preenchidoOk);
return msg === '';
}

function mostrarFeedback(tipo, texto) {
const base = 'rounded-lg border px-4 py-3 text-sm font-medium ';
const estilo = tipo === 'sucesso'
    ? 'bg-green-50 border-green-300 text-green-800'
    : 'bg-red-50 border-red-300 text-red-800';
feedback.className = base + estilo;
feedback.textContent = (tipo === 'sucesso' ? '✔ ' : '⚠ ') + texto;
feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function esconderFeedback() {
feedback.className = 'hidden';
feedback.textContent = '';
}

// Validação em tempo real: ao sair do campo, e depois a cada digitação
campos.forEach(id => {
const el = document.getElementById(id);
el.addEventListener('blur', () => { tocados.add(id); validarCampo(id); });
el.addEventListener('input', () => {
    if (tocados.has(id)) validarCampo(id);
    if (id === 'mensagem') {
        document.getElementById('contador-mensagem').textContent = el.value.length + '/500';
    }
});
});

// ---------- HISTÓRICO DE MENSAGENS ENVIADAS (localStorage) ----------
const CHAVE_HIST = 'portfolio:mensagens-enviadas';
const MAX_HIST = 50;
const listaHist = document.getElementById('historico-lista');
const vazioHist = document.getElementById('historico-vazio');
const contHist = document.getElementById('historico-contador');
const btnLimparHist = document.getElementById('historico-limpar');
let timerConfirmar = null;

function lerHistorico() {
try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_HIST));
    return Array.isArray(dados) ? dados : [];
} catch (e) { return []; }
}
function gravarHistorico(lista) {
try { localStorage.setItem(CHAVE_HIST, JSON.stringify(lista)); return true; }
catch (e) { return false; }
}

function renderHistorico() {
const itens = lerHistorico();
listaHist.innerHTML = '';

itens.forEach(m => {
    const li = document.createElement('li');
    li.className = 'bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800';

    const topo = document.createElement('div');
    topo.className = 'flex items-start justify-between gap-2';

    const info = document.createElement('div');
    info.className = 'min-w-0';
    const assunto = document.createElement('p');
    assunto.className = 'font-semibold text-sm break-words';
    assunto.textContent = m.assunto;
    const meta = document.createElement('p');
    meta.className = 'text-xs text-slate-500';
    meta.textContent = new Date(m.data).toLocaleString('pt-BR') + ' · ' + m.nome + ' · ' + m.email;
    info.append(assunto, meta);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'text-slate-400 hover:text-red-600 transition shrink-0';
    del.setAttribute('aria-label', 'Apagar mensagem: ' + m.assunto);
    del.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    del.addEventListener('click', () => {
        gravarHistorico(lerHistorico().filter(x => x.id !== m.id));
        renderHistorico();
    });

    topo.append(info, del);

    const corpo = document.createElement('p');
    corpo.className = 'text-sm text-slate-700 mt-2 whitespace-pre-wrap break-words';
    corpo.textContent = m.mensagem;

    li.append(topo, corpo);
    if (Array.isArray(m.perguntas) && m.perguntas.length) {
        const bloco = document.createElement('div');
        bloco.className = 'mt-2 pt-2 border-t border-slate-200';
        const tit = document.createElement('p');
        tit.className = 'text-xs font-semibold text-slate-600';
        tit.textContent = 'Perguntas enviadas junto (' + m.perguntas.length + '):';
        const ol = document.createElement('ol');
        ol.className = 'list-decimal pl-5 mt-1 space-y-0.5 text-sm text-slate-700';
        m.perguntas.forEach(q => {
            const it = document.createElement('li');
            it.textContent = q.texto + ' (' + (ROT_PERG[q.assunto] || 'Geral') + ')';
            ol.appendChild(it);
        });
        bloco.append(tit, ol);
        li.appendChild(bloco);
    }
    if (m.musica) {
        const mus = document.createElement('p');
        mus.className = 'text-xs text-slate-500 mt-2';
        mus.textContent = '🎵 ' + m.musica;
        li.appendChild(mus);
    }
    listaHist.appendChild(li);
});

vazioHist.classList.toggle('hidden', itens.length > 0);
btnLimparHist.classList.toggle('hidden', itens.length === 0);
contHist.textContent = itens.length ? itens.length + (itens.length === 1 ? ' mensagem' : ' mensagens') : '';
if (window.lucide) lucide.createIcons();
}

// Perguntas criadas na seção "Perguntas para mim" (ainda não enviadas)
const ROT_PERG = {
geral: 'Geral', formacao: 'Formação', experiencia: 'Experiência',
objetivos: 'Objetivos', tecnologias: 'Tecnologias', pessoal: 'Lado pessoal'
};
function lerPerguntasPendentes() {
try {
    const d = JSON.parse(localStorage.getItem('portfolio:perguntas'));
    return Array.isArray(d) ? d : [];
} catch (e) { return []; }
}
function limparPerguntasPendentes() {
try { localStorage.setItem('portfolio:perguntas', '[]'); } catch (e) {}
window.dispatchEvent(new Event('perguntas:atualizar')); // a seção de perguntas se redesenha
}

function guardarMensagem() {
const v = id => document.getElementById(id).value.trim();
const nova = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    data: new Date().toISOString(),
    nome: v('nome'), email: v('email'), assunto: v('assunto'),
    mensagem: v('mensagem'), musica: v('musica'),
    perguntas: lerPerguntasPendentes().map(p => ({ assunto: p.assunto, texto: p.texto }))
};
// mais recente primeiro, limitado a MAX_HIST itens
return gravarHistorico([nova].concat(lerHistorico()).slice(0, MAX_HIST));
}

// "Apagar tudo" pede um segundo clique para confirmar (sem usar alert/confirm)
btnLimparHist.addEventListener('click', () => {
if (btnLimparHist.dataset.confirmar === '1') {
    clearTimeout(timerConfirmar);
    btnLimparHist.dataset.confirmar = '';
    btnLimparHist.textContent = 'Apagar tudo';
    gravarHistorico([]);
    renderHistorico();
} else {
    btnLimparHist.dataset.confirmar = '1';
    btnLimparHist.textContent = 'Tem certeza? Clique de novo';
    timerConfirmar = setTimeout(() => {
        btnLimparHist.dataset.confirmar = '';
        btnLimparHist.textContent = 'Apagar tudo';
    }, 3000);
}
});

renderHistorico();

// ---------- RASCUNHO AUTOMÁTICO (localStorage) ----------
const CHAVE_RASCUNHO = 'portfolio:rascunho-contato';
const status = document.getElementById('rascunho-status');
const btnDescartar = document.getElementById('rascunho-descartar');
let timerRascunho = null;

function hora() {
const a = new Date();
return String(a.getHours()).padStart(2, '0') + ':' + String(a.getMinutes()).padStart(2, '0');
}

function mostrarStatus(texto, comBotao) {
status.textContent = texto;
btnDescartar.classList.toggle('hidden', !comBotao);
}

function salvarRascunho() {
const dados = {};
campos.forEach(id => { dados[id] = document.getElementById(id).value; });
const vazio = Object.values(dados).every(v => v.trim() === '');
try {
    if (vazio) {
        localStorage.removeItem(CHAVE_RASCUNHO);
        mostrarStatus('', false);
    } else {
        localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados));
        mostrarStatus('Rascunho salvo automaticamente às ' + hora() + '.', true);
    }
} catch (e) {
    mostrarStatus('Não foi possível salvar o rascunho neste navegador.', false);
}
}

function limparRascunho() {
try { localStorage.removeItem(CHAVE_RASCUNHO); } catch (e) {}
mostrarStatus('', false);
}

function restaurarRascunho() {
try {
    const bruto = localStorage.getItem(CHAVE_RASCUNHO);
    if (!bruto) return;
    const dados = JSON.parse(bruto);
    let algum = false;
    campos.forEach(id => {
        if (typeof dados[id] === 'string' && dados[id] !== '') {
            document.getElementById(id).value = dados[id];
            algum = true;
        }
    });
    if (algum) {
        document.getElementById('contador-mensagem').textContent =
            document.getElementById('mensagem').value.length + '/500';
        mostrarStatus('Rascunho anterior restaurado.', true);
    }
} catch (e) { /* rascunho corrompido: ignora */ }
}

campos.forEach(id => {
document.getElementById(id).addEventListener('input', () => {
    clearTimeout(timerRascunho);
    timerRascunho = setTimeout(salvarRascunho, 400); // espera parar de digitar
});
});
// Garante o salvamento se a aba fechar antes do atraso acabar
window.addEventListener('pagehide', () => { clearTimeout(timerRascunho); salvarRascunho(); });

btnDescartar.addEventListener('click', () => {
form.reset();
tocados.clear();
campos.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('border-red-500', 'border-green-500', 'focus:ring-red-500');
    el.classList.add('border-slate-300');
    el.removeAttribute('aria-invalid');
    const p = document.getElementById('erro-' + id);
    p.textContent = ''; p.classList.add('hidden');
});
document.getElementById('contador-mensagem').textContent = '0/500';
limparRascunho();
});

restaurarRascunho();

form.addEventListener('submit', e => {
e.preventDefault();
campos.forEach(id => tocados.add(id));

const invalidos = campos.filter(id => !validarCampo(id));

if (invalidos.length) {
    const n = invalidos.length;
    mostrarFeedback('erro', 'Corrija ' + n + (n === 1 ? ' campo' : ' campos') + ' destacado' + (n === 1 ? '' : 's') + ' abaixo e tente novamente.');
    document.getElementById(invalidos[0]).focus();
    return;
}

// Pergunta digitada mas ainda não adicionada: avisa para não perdê-la
const campoPergunta = document.getElementById('pergunta-texto');
if (campoPergunta && campoPergunta.value.trim()) {
    const aviso = 'Clique em "Adicionar pergunta" para incluir esta pergunta no envio, ou apague o texto.';
    const pErro = document.getElementById('erro-pergunta');
    if (pErro) { pErro.textContent = aviso; pErro.classList.remove('hidden'); }
    campoPergunta.classList.add('border-red-500');
    mostrarFeedback('erro', 'Você escreveu uma pergunta que ainda não foi adicionada. ' + aviso);
    campoPergunta.focus();
    return;
}

const nome = document.getElementById('nome').value.trim().split(' ')[0];
const qtdPerguntas = lerPerguntasPendentes().length;
const guardou = guardarMensagem();
if (guardou && qtdPerguntas) limparPerguntasPendentes(); // já foram enviadas // antes do reset, enquanto os campos ainda têm valor
form.reset();
clearTimeout(timerRascunho);
limparRascunho(); // enviado: o rascunho não é mais necessário
tocados.clear();
campos.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('border-red-500', 'border-green-500', 'focus:ring-red-500');
    el.classList.add('border-slate-300');
    el.removeAttribute('aria-invalid');
});
document.getElementById('contador-mensagem').textContent = '0/500';
renderHistorico();
mostrarFeedback('sucesso', 'Obrigado, ' + nome + '! Sua mensagem foi enviada com sucesso.' +
    (qtdPerguntas && guardou ? ' ' + qtdPerguntas + (qtdPerguntas === 1 ? ' pergunta foi enviada junto.' : ' perguntas foram enviadas junto.') : '') +
    (guardou ? ' Ela aparece no histórico abaixo.' : ' (Não foi possível guardá-la no histórico deste navegador.)'));
});

// Botão "reset"/edição esconde o banner antigo quando o usuário volta a digitar
form.addEventListener('input', () => {
if (feedback.classList.contains('bg-green-50')) esconderFeedback();
});
});



/* =====================================================================
FEATURE 3 — BOAS-VINDAS (todas as páginas)
1ª visita: pergunta o nome. Próximas: "Olá, [nome]". Salvo em localStorage.
===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
const nav = document.querySelector('header nav');
if (!nav) return;

const CHAVE_NOME = 'portfolio:nome';
const CHAVE_ADIADO = 'portfolio:boas-vindas-adiado'; // sessionStorage: não insistir na mesma sessão

function lerNome() {
try { return localStorage.getItem(CHAVE_NOME) || ''; } catch (e) { return ''; }
}
function gravarNome(n) {
try { localStorage.setItem(CHAVE_NOME, n); return true; } catch (e) { return false; }
}

// Área da saudação, à direita do menu
nav.classList.add('flex', 'flex-wrap', 'items-center', 'justify-between', 'gap-2');
const area = document.createElement('div');
area.id = 'boas-vindas';
area.className = 'text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2';
area.setAttribute('aria-live', 'polite');
nav.appendChild(area);

function renderSaudacao() {
const nome = lerNome();
area.innerHTML = '';
const txt = document.createElement('span');
txt.className = 'font-medium';
txt.textContent = nome ? 'Olá, ' + nome + ' 👋' : 'Olá, visitante 👋';
const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'text-xs underline text-blue-600 hover:text-blue-800 dark:text-sky-400';
btn.textContent = nome ? 'Não é você?' : 'Informar nome';
btn.addEventListener('click', abrirModal);
area.append(txt, btn);
}

function abrirModal() {
if (document.getElementById('modal-boas-vindas')) return;
const atual = lerNome();

const overlay = document.createElement('div');
overlay.id = 'modal-boas-vindas';
overlay.style.zIndex = '100';
overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4';
overlay.innerHTML =
    '<form class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200" role="dialog" aria-modal="true" aria-labelledby="bv-titulo" novalidate>' +
      '<h3 id="bv-titulo" class="font-bold text-lg text-slate-800 font-mono">Bem-vindo(a)! 👋</h3>' +
      '<p class="text-sm text-slate-600">Como você gostaria de ser chamado(a)? Vou lembrar do seu nome nas próximas visitas.</p>' +
      '<div class="flex flex-col gap-1">' +
        '<label for="bv-nome" class="text-sm font-medium text-slate-700">Seu nome</label>' +
        '<input id="bv-nome" type="text" maxlength="30" autocomplete="given-name" class="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">' +
        '<p id="bv-erro" class="hidden text-xs text-red-600 font-medium" role="alert"></p>' +
      '</div>' +
      '<div class="flex gap-2">' +
        '<button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 text-sm transition">Salvar</button>' +
        '<button type="button" id="bv-pular" class="px-4 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition">Agora não</button>' +
      '</div>' +
    '</form>';
document.body.appendChild(overlay);

const f = overlay.querySelector('form');
const input = overlay.querySelector('#bv-nome');
const erro = overlay.querySelector('#bv-erro');
input.value = atual;
input.focus();
input.select();

function fechar() { overlay.remove(); document.removeEventListener('keydown', aoTeclar); }
function adiar() {
    try { sessionStorage.setItem(CHAVE_ADIADO, '1'); } catch (e) {}
    fechar();
}
function aoTeclar(e) { if (e.key === 'Escape') adiar(); }
document.addEventListener('keydown', aoTeclar);

overlay.querySelector('#bv-pular').addEventListener('click', adiar);
input.addEventListener('input', () => { erro.classList.add('hidden'); input.classList.remove('border-red-500'); });

f.addEventListener('submit', e => {
    e.preventDefault();
    const n = input.value.trim().replace(/\s+/g, ' ');
    let msg = '';
    if (n.length < 2) msg = 'Digite pelo menos 2 letras.';
    else if (!/^[A-Za-zÀ-ÿ' -]+$/.test(n)) msg = 'Use apenas letras no nome.';
    if (msg) {
        erro.textContent = msg;
        erro.classList.remove('hidden');
        input.classList.add('border-red-500');
        input.focus();
        return;
    }
    const nomeFormatado = n.charAt(0).toUpperCase() + n.slice(1);
    if (!gravarNome(nomeFormatado)) {
        erro.textContent = 'Não foi possível salvar o nome neste navegador.';
        erro.classList.remove('hidden');
        return;
    }
    fechar();
    renderSaudacao();
});
}

renderSaudacao();

// Primeira visita (sem nome salvo e sem ter dispensado nesta sessão) -> pergunta
let adiado = false;
try { adiado = sessionStorage.getItem(CHAVE_ADIADO) === '1'; } catch (e) {}
if (!lerNome() && !adiado) abrirModal();
});



/* =====================================================================
FEATURE 4 — "QUER SABER MAIS SOBRE MIM?" (index.html)
Formulário de interesse. A resposta fica salva em localStorage
(chave portfolio:interesse) e continua lá após recarregar a página.
===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
const form = document.getElementById('form-interesse');
if (!form) return; // só roda no index.html

const CHAVE = 'portfolio:interesse';

// Conteúdo mostrado para cada assunto escolhido
const TOPICOS = {
formacao: {
    titulo: 'Formação',
    itens: [
        'Tecnólogo em Análise e Desenvolvimento de Sistemas — Centro Universitário de Braz Cubas (cursando)',
        'Técnico em Administração — IFSP Campus Suzano (2024)',
        'Ensino Médio completo — E.E. Prof. Luiza Hidaka (2024)'
    ]
},
experiencia: {
    titulo: 'Experiência profissional',
    itens: [
        'Auxiliar de Escritório — Leão & Jetex Industrial Têxtil (desde junho de 2026)',
        'Jovem Aprendiz, alimentador da linha de produção — Guarda Mirim de Suzano (maio de 2025 a junho de 2026)'
    ]
},
objetivos: {
    titulo: 'Objetivos de carreira',
    itens: [
        'Começar na tecnologia como Desenvolvedor Júnior ou Estagiário em Programação',
        'Me tornar um desenvolvedor Full Stack (Front-End e Back-End)'
    ]
},
tecnologias: {
    titulo: 'Tecnologias e interesses',
    itens: [
        'Linguagens: Java, Python, JavaScript, SQL, HTML e CSS',
        'Áreas: Back-End, Front-End, Inteligência Artificial e desenvolvimento de sistemas'
    ]
},
pessoal: {
    titulo: 'Lado pessoal',
    itens: [
        'Apaixonado por tecnologia, música e pelo universo da ficção',
        'Curioso por natureza: gosto de entender como as coisas funcionam'
    ]
},
contato: {
    titulo: 'Como falar comigo',
    itens: ['Use a página de contato para me mandar uma mensagem.'],
    link: { href: 'formulario.html', texto: 'Ir para o formulário de contato →' }
}
};

const el = id => document.getElementById(id);
const feedback = el('interesse-feedback');
const resultado = el('interesse-resultado');
const boxTopicos = el('interesse-topicos');
const comentario = el('interesse-comentario');
const btnCancelar = el('interesse-cancelar');
const btnApagar = el('interesse-apagar');
const radios = form.querySelectorAll('input[name="resposta"]');
const checks = form.querySelectorAll('input[name="topicos"]');
let timerApagar = null;

// ---------- localStorage ----------
function ler() {
try {
    const d = JSON.parse(localStorage.getItem(CHAVE));
    return d && typeof d === 'object' && d.resposta ? d : null;
} catch (e) { return null; }
}
function gravar(d) {
try { localStorage.setItem(CHAVE, JSON.stringify(d)); return true; }
catch (e) { return false; }
}

// ---------- UI ----------
function mostrarFeedback(tipo, texto) {
const base = 'rounded-lg border px-4 py-3 text-sm font-medium ';
feedback.className = base + (tipo === 'sucesso'
    ? 'bg-green-50 border-green-300 text-green-800'
    : 'bg-red-50 border-red-300 text-red-800');
feedback.textContent = (tipo === 'sucesso' ? '✔ ' : '⚠ ') + texto;
}
function esconderFeedback() { feedback.className = 'hidden'; feedback.textContent = ''; }

function erroCampo(id, msg) {
const p = el(id);
p.textContent = msg;
p.classList.toggle('hidden', !msg);
}

function respostaAtual() {
const r = form.querySelector('input[name="resposta"]:checked');
return r ? r.value : '';
}

function atualizarVisibilidade() {
boxTopicos.classList.toggle('hidden', respostaAtual() !== 'sim');
}

function preencherForm(d) {
radios.forEach(r => { r.checked = !!d && r.value === d.resposta; });
checks.forEach(c => { c.checked = !!d && d.topicos.indexOf(c.value) !== -1; });
comentario.value = d ? (d.comentario || '') : '';
el('interesse-contador').textContent = comentario.value.length + '/200';
erroCampo('erro-resposta', '');
erroCampo('erro-topicos', '');
atualizarVisibilidade();
}

function mostrarFormulario(dadosParaEditar) {
preencherForm(dadosParaEditar || null);
btnCancelar.classList.toggle('hidden', !dadosParaEditar);
resultado.classList.add('hidden');
form.classList.remove('hidden');
}

function mostrarResultado(d, avisoSemSalvar) {
const nome = (function () { try { return localStorage.getItem('portfolio:nome') || ''; } catch (e) { return ''; } })();
const prefixo = nome ? nome + ', ' : '';
const titulos = {
    sim: prefixo + 'que bom que você quer saber mais! Aqui está o que você pediu 😄',
    talvez: 'Sem pressa! Se mudar de ideia, é só alterar sua resposta.',
    nao: 'Tudo bem, obrigado por responder!'
};
el('resultado-titulo').textContent = titulos[d.resposta] || 'Obrigado por responder!';
el('resultado-data').textContent = 'Respondido em ' + new Date(d.data).toLocaleString('pt-BR') +
    (avisoSemSalvar ? ' (não foi possível salvar neste navegador)' : '');

// Cards dos assuntos escolhidos
const cards = el('resultado-cards');
cards.innerHTML = '';
d.topicos.forEach(chave => {
    const t = TOPICOS[chave];
    if (!t) return;
    const card = document.createElement('div');
    card.className = 'bg-white border border-slate-200 rounded-lg p-3 text-slate-800';
    const h = document.createElement('p');
    h.className = 'font-semibold text-sm mb-1';
    h.textContent = t.titulo;
    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5 text-sm text-slate-600 space-y-0.5';
    t.itens.forEach(txt => { const li = document.createElement('li'); li.textContent = txt; ul.appendChild(li); });
    card.append(h, ul);
    if (t.link) {
        const a = document.createElement('a');
        a.href = t.link.href;
        a.textContent = t.link.texto;
        a.className = 'inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline';
        card.appendChild(a);
    }
    cards.appendChild(card);
});

const c = el('resultado-comentario');
c.textContent = d.comentario ? 'Seu comentário: “' + d.comentario + '”' : '';
c.classList.toggle('hidden', !d.comentario);

form.classList.add('hidden');
resultado.classList.remove('hidden');
}

// ---------- eventos ----------
radios.forEach(r => r.addEventListener('change', () => {
atualizarVisibilidade();
erroCampo('erro-resposta', '');
esconderFeedback();
}));
checks.forEach(c => c.addEventListener('change', () => { erroCampo('erro-topicos', ''); esconderFeedback(); }));
comentario.addEventListener('input', () => {
el('interesse-contador').textContent = comentario.value.length + '/200';
});

form.addEventListener('submit', e => {
e.preventDefault();
const resposta = respostaAtual();
const escolhidos = Array.from(checks).filter(c => c.checked).map(c => c.value);

const erroResp = resposta ? '' : 'Escolha uma das opções.';
const erroTop = (resposta === 'sim' && escolhidos.length === 0) ? 'Escolha pelo menos um assunto.' : '';
erroCampo('erro-resposta', erroResp);
erroCampo('erro-topicos', erroTop);

if (erroResp || erroTop) {
    mostrarFeedback('erro', 'Faltam informações: ' + (erroResp ? 'escolha uma opção.' : 'escolha pelo menos um assunto.'));
    (erroResp ? radios[0] : checks[0]).focus();
    return;
}

const dados = {
    resposta: resposta,
    topicos: resposta === 'sim' ? escolhidos : [],
    comentario: resposta === 'sim' ? comentario.value.trim() : '',
    data: new Date().toISOString()
};
const salvou = gravar(dados);
esconderFeedback();
mostrarResultado(dados, !salvou);
});

btnCancelar.addEventListener('click', () => {
const d = ler();
esconderFeedback();
if (d) mostrarResultado(d); else mostrarFormulario(null);
});

el('interesse-alterar').addEventListener('click', () => {
esconderFeedback();
mostrarFormulario(ler());
});

// "Apagar resposta" pede um segundo clique para confirmar
btnApagar.addEventListener('click', () => {
if (btnApagar.dataset.confirmar === '1') {
    clearTimeout(timerApagar);
    btnApagar.dataset.confirmar = '';
    btnApagar.textContent = 'Apagar resposta';
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    mostrarFormulario(null);
    mostrarFeedback('sucesso', 'Resposta apagada. Você pode responder de novo quando quiser.');
} else {
    btnApagar.dataset.confirmar = '1';
    btnApagar.textContent = 'Tem certeza? Clique de novo';
    timerApagar = setTimeout(() => {
        btnApagar.dataset.confirmar = '';
        btnApagar.textContent = 'Apagar resposta';
    }, 3000);
}
});

// ---------- início: já existe resposta salva? ----------
const salvo = ler();
if (salvo) mostrarResultado(salvo); else mostrarFormulario(null);
});


/* =====================================================================
FEATURE 5 — PERGUNTAS CRIADAS PELO VISITANTE (formulario.html)
Adicionar / editar / apagar perguntas, salvas em localStorage
(chave portfolio:perguntas). Ao clicar em "Enviar" no formulário de
contato, as perguntas vão junto e a lista é esvaziada (veja o bloco do
formulário de contato, acima).
===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
const form = document.getElementById('form-perguntas');
if (!form) return; // só roda no formulario.html

const CHAVE = 'portfolio:perguntas';
const MAX = 10, MIN_CHARS = 10, MAX_CHARS = 120;
const ROTULOS = {
geral: 'Geral', formacao: 'Formação', experiencia: 'Experiência',
objetivos: 'Objetivos', tecnologias: 'Tecnologias', pessoal: 'Lado pessoal'
};

const el = id => document.getElementById(id);
const selAssunto = el('pergunta-assunto');
const txt = el('pergunta-texto');
const erro = el('erro-pergunta');
const contador = el('pergunta-contador');
const btnSalvar = el('pergunta-salvar');
const btnCancelar = el('pergunta-cancelar');
const lista = el('perguntas-lista');
const vazio = el('perguntas-vazio');
const acoes = el('perguntas-acoes');
const feedback = el('perguntas-feedback');
const anexo = el('perguntas-anexo');
const btnLimpar = el('perguntas-limpar');

let editandoId = null;
let timerLimpar = null;

// ---------- localStorage ----------
function ler() {
try {
    const d = JSON.parse(localStorage.getItem(CHAVE));
    return Array.isArray(d) ? d : [];
} catch (e) { return []; }
}
function gravar(itens) {
try { localStorage.setItem(CHAVE, JSON.stringify(itens)); return true; }
catch (e) {
    mostrarFeedback('erro', 'Não foi possível salvar neste navegador (armazenamento bloqueado).');
    return false;
}
}

// ---------- feedback ----------
function mostrarFeedback(tipo, texto) {
feedback.className = 'rounded-lg border px-4 py-3 text-sm font-medium ' + (tipo === 'sucesso'
    ? 'bg-green-50 border-green-300 text-green-800'
    : 'bg-red-50 border-red-300 text-red-800');
feedback.textContent = (tipo === 'sucesso' ? '✔ ' : '⚠ ') + texto;
}
function esconderFeedback() { feedback.className = 'hidden'; feedback.textContent = ''; }
function mostrarErroCampo(msg) {
erro.textContent = msg;
erro.classList.toggle('hidden', !msg);
txt.classList.toggle('border-red-500', !!msg);
txt.classList.toggle('border-slate-300', !msg);
txt.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

// ---------- lista ----------
// Aviso junto ao botão Enviar: quantas perguntas vão com a mensagem
function atualizarAnexo() {
const n = ler().length;
anexo.textContent = n
    ? '📎 ' + n + (n === 1 ? ' pergunta será enviada' : ' perguntas serão enviadas') + ' junto com a mensagem.'
    : '';
anexo.classList.toggle('hidden', n === 0);
}

function render() {
const itens = ler();
lista.innerHTML = '';

itens.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'bg-white border border-slate-200 rounded-lg p-3 text-slate-800 flex items-start gap-3';

    const num = document.createElement('span');
    num.className = 'text-xs font-mono text-slate-400 mt-0.5 shrink-0';
    num.textContent = (i + 1) + '.';

    const corpo = document.createElement('div');
    corpo.className = 'flex-1 min-w-0';
    const t = document.createElement('p');
    t.className = 'text-sm break-words';
    t.textContent = p.texto; // textContent evita injeção de HTML
    const meta = document.createElement('p');
    meta.className = 'text-xs text-slate-500 mt-1';
    meta.textContent = (ROTULOS[p.assunto] || 'Geral') + ' · ' + new Date(p.data).toLocaleString('pt-BR');
    corpo.append(t, meta);

    const btns = document.createElement('div');
    btns.className = 'flex gap-2 shrink-0';
    const ed = document.createElement('button');
    ed.type = 'button';
    ed.className = 'text-xs text-blue-600 hover:text-blue-800 underline';
    ed.textContent = 'Editar';
    ed.setAttribute('aria-label', 'Editar pergunta ' + (i + 1));
    ed.addEventListener('click', () => iniciarEdicao(p));
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'text-xs text-slate-500 hover:text-red-600 underline';
    del.textContent = 'Apagar';
    del.setAttribute('aria-label', 'Apagar pergunta ' + (i + 1));
    del.addEventListener('click', () => {
        if (editandoId === p.id) sairEdicao();
        gravar(ler().filter(x => x.id !== p.id));
        esconderFeedback();
        render();
    });
    btns.append(ed, del);

    li.append(num, corpo, btns);
    lista.appendChild(li);
});

vazio.classList.toggle('hidden', itens.length > 0);
acoes.classList.toggle('hidden', itens.length === 0);
el('perguntas-contador').textContent = itens.length ? itens.length + '/' + MAX + ' perguntas' : '';
atualizarAnexo();
}

// ---------- edição ----------
function iniciarEdicao(p) {
editandoId = p.id;
selAssunto.value = p.assunto in ROTULOS ? p.assunto : 'geral';
txt.value = p.texto;
contador.textContent = txt.value.length + '/' + MAX_CHARS;
btnSalvar.textContent = 'Salvar alteração';
btnCancelar.classList.remove('hidden');
mostrarErroCampo('');
esconderFeedback();
txt.focus();
}
function sairEdicao() {
editandoId = null;
btnSalvar.textContent = 'Adicionar pergunta';
btnCancelar.classList.add('hidden');
txt.value = '';
contador.textContent = '0/' + MAX_CHARS;
selAssunto.value = 'geral';
mostrarErroCampo('');
}

// ---------- validação ----------
function validar(texto, itens) {
if (!texto) return 'Escreva sua pergunta.';
if (texto.length < MIN_CHARS) return 'A pergunta precisa ter pelo menos ' + MIN_CHARS + ' caracteres (faltam ' + (MIN_CHARS - texto.length) + ').';
if (texto.length > MAX_CHARS) return 'A pergunta pode ter no máximo ' + MAX_CHARS + ' caracteres.';
if (!/[A-Za-zÀ-ÿ]{2,}/.test(texto)) return 'Escreva uma pergunta com palavras.';
if (itens.some(p => p.id !== editandoId && p.texto.toLowerCase() === texto.toLowerCase())) {
    return 'Você já criou essa pergunta.';
}
if (!editandoId && itens.length >= MAX) return 'Você chegou ao limite de ' + MAX + ' perguntas. Apague alguma para criar outra.';
return '';
}

txt.addEventListener('input', () => {
contador.textContent = txt.value.length + '/' + MAX_CHARS;
if (!erro.classList.contains('hidden')) mostrarErroCampo('');
});

// Salva (ou atualiza) a pergunta digitada. Não usa "submit" porque este
// bloco fica DENTRO do formulário de contato (formulários não se aninham).
function salvarPergunta() {
const texto = txt.value.trim().replace(/\s+/g, ' ');
const itens = ler();
const msg = validar(texto, itens);
if (msg) {
    mostrarErroCampo(msg);
    mostrarFeedback('erro', 'Corrija a pergunta e tente de novo.');
    txt.focus();
    return;
}
mostrarErroCampo('');

if (editandoId) {
    const alvo = itens.find(p => p.id === editandoId);
    if (alvo) { alvo.texto = texto; alvo.assunto = selAssunto.value; }
    if (gravar(itens)) mostrarFeedback('sucesso', 'Pergunta atualizada.');
    sairEdicao();
} else {
    itens.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        assunto: selAssunto.value,
        texto: texto,
        data: new Date().toISOString()
    });
    if (gravar(itens)) mostrarFeedback('sucesso', 'Pergunta adicionada! Ela fica salva mesmo se você recarregar a página.');
    txt.value = '';
    contador.textContent = '0/' + MAX_CHARS;
    selAssunto.value = 'geral';
}
render();
txt.focus();
}

btnSalvar.addEventListener('click', salvarPergunta);

// Enter adiciona a pergunta (Shift+Enter não é necessário: o limite é curto)
txt.addEventListener('keydown', e => {
if (e.key === 'Enter') { e.preventDefault(); salvarPergunta(); }
});

btnCancelar.addEventListener('click', () => { sairEdicao(); esconderFeedback(); });

// ---------- apagar todas (2 cliques) ----------
btnLimpar.addEventListener('click', () => {
if (btnLimpar.dataset.confirmar === '1') {
    clearTimeout(timerLimpar);
    btnLimpar.dataset.confirmar = '';
    btnLimpar.textContent = 'Apagar todas';
    sairEdicao();
    gravar([]);
    render();
    mostrarFeedback('sucesso', 'Todas as perguntas foram apagadas.');
} else {
    btnLimpar.dataset.confirmar = '1';
    btnLimpar.textContent = 'Tem certeza? Clique de novo';
    timerLimpar = setTimeout(() => {
        btnLimpar.dataset.confirmar = '';
        btnLimpar.textContent = 'Apagar todas';
    }, 3000);
}
});

// O formulário de contato avisa quando enviou (e esvaziou) as perguntas
window.addEventListener('perguntas:atualizar', () => { sairEdicao(); render(); });

render();
});