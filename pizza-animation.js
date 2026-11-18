/* Every moving slice is exactly 1/d of a pizza, both before and after moving. */
function pizzaModel(q) {
  const whole = Math.floor(q.n / q.d);
  const remainder = q.n % q.d;
  return {
    n: q.n, d: q.d, whole, remainder,
    packing: q.t === 'toMixed',
    groups: Array.from({ length: Math.ceil(q.n / q.d) }, (_, i) => Math.min(q.d, q.n - i * q.d))
  };
}

function pizzaSector(d) {
  const half = Math.PI / d;
  const x = 50 - 42 * Math.sin(half);
  const y = 50 - 42 * Math.cos(half);
  const right = 100 - x;
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <path d="M50 50 L${x} ${y} A42 42 0 0 1 ${right} ${y} Z" fill="#f7cc58" stroke="#b57934" stroke-width="1.5"/>
    <path d="M${x} ${y} A42 42 0 0 1 ${right} ${y}" fill="none" stroke="#c38b43" stroke-width="6" stroke-linecap="round"/>
    <circle cx="50" cy="23" r="4.5" fill="#d85b3c"/><circle cx="48" cy="34" r="2" fill="#fff0ad"/>
    <path d="M52 13 l3 4 -3 2" fill="none" stroke="#56824c" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

let activePizzaMotion = null;
function closePizzaAnimation() {
  if (!activePizzaMotion) return;
  const motion = activePizzaMotion;
  activePizzaMotion = null;
  motion.destroy();
}

function showPizzaAnimation(q) {
  closePizzaAnimation();
  const model = pizzaModel(q);
  const dialog = document.createElement('dialog');
  dialog.className = 'pizza-motion';
  dialog.setAttribute('aria-labelledby', 'pizza-motion-title');
  dialog.innerHTML = `
    <div class="motion-heading"><span class="eyebrow">★ 答對了！看看分數怎麼變身</span>
      <h2 id="pizza-motion-title" tabindex="-1" autofocus>${model.packing ? '披薩片，裝進盒子！' : '打開盒子，拿出小片！'}</h2>
      <p>每盒裝 ${q.d} 片，就是 1 個完整披薩。每片是 ${f(1, q.d)} 個披薩。</p>
    </div>
    <div class="motion-stage" aria-hidden="true">
      <div class="motion-zone motion-from"><h3>${model.packing ? `${q.n} 片披薩` : '完整的盒子和剩下的小片'}</h3><div class="motion-content"></div></div>
      <div class="motion-arrow">${model.packing ? '裝盒 →' : '拆片 →'}</div>
      <div class="motion-zone motion-to"><h3>${model.packing ? `每 ${q.d} 片裝 1 盒` : `一共有 ${q.n} 片`}</h3><div class="motion-content"></div></div>
      <div class="moving-pizzas"></div>
    </div>
    <div class="motion-status" role="status" aria-live="polite"></div>
    <div class="motion-equation">${model.packing ? f(q.n, q.d) : mixed(q.n, q.d)}<span>＝</span>${model.packing ? mixed(q.n, q.d) : f(q.n, q.d)}</div>
    <div class="motion-actions"><button class="sub motion-replay" disabled>↻ 再看一次</button><button class="sub motion-return">回到題目</button><button class="primary motion-next">${index === 5 ? '看看我的成果 ★' : '下一關 →'}</button></div>`;
  document.body.append(dialog);
  const stage = dialog.querySelector('.motion-stage');
  const from = dialog.querySelector('.motion-from .motion-content');
  const to = dialog.querySelector('.motion-to .motion-content');
  const layer = dialog.querySelector('.moving-pizzas');
  const status = dialog.querySelector('.motion-status');
  const replay = dialog.querySelector('.motion-replay');
  const controllers = new AbortController();
  let generation = 0, animations = [], frame = null, resizeTimer = null;

  const loose = document.createElement('div');
  loose.className = 'loose-pizza-grid';
  const pockets = Array.from({ length: q.n }, () => {
    const pocket = document.createElement('div');
    pocket.className = 'slice-pocket';
    loose.append(pocket);
    return pocket;
  });
  const grouped = document.createElement('div');
  grouped.className = 'pizza-cartons';
  const wheels = model.groups.map((count) => {
    const carton = document.createElement('div');
    carton.className = count === q.d ? 'pizza-carton' : 'pizza-remainder';
    const wheel = document.createElement('div');
    wheel.className = 'carton-pizza';
    // Equal-angle outlines make the size of each slice explicit.
    wheel.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="#fff8de" stroke="#d3b585" stroke-dasharray="3 3"/>${Array.from({ length: q.d }, (_, j) => {
      const angle = (-90 - 180 / q.d + j * 360 / q.d) * Math.PI / 180;
      return `<path d="M50 50 L${50 + 43 * Math.cos(angle)} ${50 + 43 * Math.sin(angle)}" stroke="#d3b585"/>`;
    }).join('')}</svg>`;
    const caption = document.createElement('b');
    caption.textContent = count === q.d ? `1 整盒（${q.d} 片）` : `剩 ${count} 片`;
    carton.append(wheel, caption);
    grouped.append(carton);
    return wheel;
  });
  if (model.packing) { from.append(loose); to.append(grouped); }
  else { from.append(grouped); to.append(loose); }
  const pieces = Array.from({ length: q.n }, (_, i) => {
    const piece = document.createElement('div');
    piece.className = 'moving-pizza-slice';
    piece.dataset.slice = String(i + 1);
    piece.innerHTML = pizzaSector(q.d);
    layer.append(piece);
    return piece;
  });

  function positions(i) {
    const base = stage.getBoundingClientRect();
    const pocket = pockets[i].getBoundingClientRect();
    const wheel = wheels[Math.floor(i / q.d)].getBoundingClientRect();
    const loosePoint = { x: pocket.left + pocket.width / 2 - 40 - base.left, y: pocket.top - base.top, angle: 0 };
    const boxPoint = { x: wheel.left - base.left, y: wheel.top - base.top, angle: (i % q.d) * 360 / q.d };
    return model.packing ? [loosePoint, boxPoint] : [boxPoint, loosePoint];
  }
  const transform = p => `translate(${p.x}px, ${p.y}px) rotate(${p.angle}deg)`;
  function play() {
    const current = ++generation;
    animations.forEach(animation => animation.cancel());
    animations = [];
    replay.disabled = true;
    dialog.classList.remove('motion-finished');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    status.textContent = model.packing ? `每 ${q.d} 片湊成 1 整盒，一起看！` : `每盒有 ${q.d} 片，把它們一片片拿出來！`;
    let arrived = 0;
    const promises = pieces.map((piece, i) => {
      const [start, end] = positions(i);
      piece.style.transform = transform(reduced ? end : start);
      if (reduced) return Promise.resolve();
      const animation = piece.animate([
        { transform: transform(start) },
        { transform: transform({ x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 25, angle: (start.angle + end.angle) / 2 }), offset: 0.5 },
        { transform: transform(end) }
      ], { delay: 550 + i * 125, duration: 850, easing: 'ease-in-out', fill: 'forwards' });
      animations.push(animation);
      return animation.finished.then(() => {
        if (current !== generation) return;
        arrived++;
        status.textContent = `已${model.packing ? '裝入' : '拿出'} ${arrived} / ${q.n} 片`;
      }).catch(() => {});
    });
    Promise.all(promises).then(() => {
      if (current !== generation || !dialog.isConnected) return;
      dialog.classList.add('motion-finished');
      status.textContent = model.packing
        ? `裝好了！${model.whole} 整盒${model.remainder ? `，剩 ${model.remainder} 片。` : '，沒有剩下的小片。'}`
        : `全部拿出來了！${model.whole} × ${q.d} ＋ ${model.remainder} ＝ ${q.n} 片。`;
      replay.disabled = false;
    });
  }
  activePizzaMotion = {
    destroy() {
      generation++;
      animations.forEach(animation => animation.cancel());
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      controllers.abort();
      if (dialog.open) dialog.close();
      dialog.remove();
    }
  };
  replay.onclick = play;
  dialog.querySelector('.motion-return').onclick = () => {
    closePizzaAnimation();
    $('pizzaReplay').focus();
  };
  dialog.querySelector('.motion-next').onclick = () => {
    closePizzaAnimation();
    $('next').click();
  };
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closePizzaAnimation();
    $('pizzaReplay').focus();
  });
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(play, 160);
  }, { signal: controllers.signal });
  dialog.showModal();
  dialog.scrollTop = 0;
  frame = requestAnimationFrame(play);
}
