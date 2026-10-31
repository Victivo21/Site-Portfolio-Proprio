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