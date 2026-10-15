/* =========================================================
   杨鹏博 · 个人主页  |  交互与滚动动画
   纯原生 JS，无任何依赖
   ========================================================= */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------------------------------------------------------
     0. 准备：给需要延迟的元素写入 --rv-delay
     --------------------------------------------------------- */
  $$('[data-delay]').forEach(function (el) {
    el.style.setProperty('--rv-delay', el.getAttribute('data-delay') + 'ms');
  });

  /* ---------------------------------------------------------
     1. 加载动画
     --------------------------------------------------------- */
  var preloader = $('#preloader');
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('is-done');
    window.setTimeout(function () {
      if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }, 800);
  }
  window.addEventListener('load', function () { window.setTimeout(hidePreloader, 380); });
  // 兜底：无论如何 2.5s 后关闭
  window.setTimeout(hidePreloader, 2500);

  /* ---------------------------------------------------------
     2. 标题逐字上浮
     --------------------------------------------------------- */
  $$('[data-split]').forEach(function (el) {
    var text = el.textContent.trim();
    el.textContent = '';
    var frag = document.createDocumentFragment();
    var n = text.length || 1;
    Array.prototype.forEach.call(text, function (ch, i) {
      var span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--i', i);
      span.style.setProperty('--n', n);   // 供渐变按字序错位使用
      span.textContent = ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
  });

  /* ---------------------------------------------------------
     3. 打字机
     --------------------------------------------------------- */
  (function typewriter() {
    var el = $('#typed');
    if (!el) return;
    var lines = [
      '计算机科学与技术 · 大一在读',
      '正在认真打基础，不断尝试',
      '喜欢番剧、游戏，还有安静写代码的夜晚',
      '最近在做：一个限时计数小游戏',
      '正在学习，正在探索，持续更新中'
    ];

    if (reduceMotion) { el.textContent = lines[0]; return; }

    var li = 0, ci = 0, deleting = false;
    (function tick() {
      var full = lines[li];
      if (!deleting) {
        ci++;
        el.textContent = full.slice(0, ci);
        if (ci === full.length) {
          deleting = true;
          return window.setTimeout(tick, 1900);
        }
        return window.setTimeout(tick, 95 + Math.random() * 70);
      }
      ci--;
      el.textContent = full.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        return window.setTimeout(tick, 420);
      }
      window.setTimeout(tick, 42);
    })();
  })();

  /* ---------------------------------------------------------
     4b. 技能条进度
     --------------------------------------------------------- */
  var skills = $$('.skill');
  if (skills.length) {
    if (hasIO && !reduceMotion) {
      var sIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); sIO.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      skills.forEach(function (el) { sIO.observe(el); });
    } else {
      skills.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------------------------------------------------------
     4c. 背景音乐：入口门 + 播放控制 + 波形可视化
     --------------------------------------------------------- */
  (function bgm() {
    var audio   = $('#bgm');
    var gate    = $('#gate');
    var enter   = $('#gateEnter');
    var skip    = $('#gateSkip');
    var toggle  = $('#bgmToggle');
    var playBtn = $('#bgmPlay');
    var muteBtn = $('#bgmMute');
    var restart = $('#bgmRestart');
    var vol     = $('#bgmVol');
    var volText = $('#bgmVolText');
    var card    = $('#bgmCard');
    var canvas  = $('#bgmWave');
    if (!audio) return;

    var STORE = 'ypb-bgm';
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { saved = {}; }
    function save() {
      try {
        localStorage.setItem(STORE, JSON.stringify({ muted: audio.muted, vol: audio.volume, gate: gateSkipped }));
      } catch (e) {}
    }
    var gateSkipped = !!saved.gate;

    audio.volume = typeof saved.vol === 'number' ? saved.vol : 0.45;
    audio.muted  = !!saved.muted;
    if (vol) vol.value = Math.round(audio.volume * 100);
    if (volText) volText.textContent = Math.round(audio.volume * 100) + '%';

    function syncUI() {
      var playing = !audio.paused && !audio.ended;
      if (toggle) {
        toggle.classList.toggle('is-playing', playing);
        toggle.setAttribute('aria-pressed', String(playing));
      }
      if (card) card.classList.toggle('is-playing', playing);
      if (playBtn) playBtn.textContent = playing ? '⏸ 暂停' : '▶ 播放';
      if (muteBtn) muteBtn.textContent = audio.muted ? '🔊 取消静音' : '🔇 静音';
    }

    function play() {
      // play() 在个别浏览器/权限策略下会同步抛错，不能让它把整个流程带崩
      try {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
      syncUI();
    }
    function pause() { try { audio.pause(); } catch (e) {} syncUI(); }
    function flip() { if (audio.paused) play(); else pause(); }

    /* 入口门 */
    if (gate) {
      // 关门的动作写死在 finally 里：不管音乐能不能播，都必须能进门
      function closeGate(withMusic) {
        try { gate.classList.add('is-open'); } catch (e) {}
        gateSkipped = true;
        try { document.body.classList.remove('is-locked'); } catch (e) {}
        window.setTimeout(function () { try { gate.hidden = true; } catch (e) {} }, 800);
        if (withMusic) play();
        try { save(); } catch (e) {}
        // 外部脚本万一加载失败，内联兜底也必须知道门已经关了
        window.__gateDone = true;
      }

      if (gateSkipped) {
        gate.hidden = true;
        window.__gateDone = true;
      } else {
        gate.hidden = false;
        try { document.body.classList.add('is-locked'); } catch (e) {}
        if (window.__gateBound) {
          // 内联兜底已经绑过监听器，这里只把逻辑接过来
          window.__closeGate = closeGate;
        } else {
          if (enter) enter.addEventListener('click', function () { closeGate(true); });
          if (skip)  skip.addEventListener('click', function () { closeGate(false); });
          document.addEventListener('keydown', function (e) {
            if ((e.key === 'Escape' || e.key === 'Enter') && !gate.hidden) closeGate(false);
          });
          window.__closeGate = closeGate;
        }
      }
    }

    /* 播放 / 暂停 / 静音 / 音量 */
    if (toggle)  toggle.addEventListener('click', flip);
    if (playBtn) playBtn.addEventListener('click', flip);
    if (muteBtn) muteBtn.addEventListener('click', function () { audio.muted = !audio.muted; syncUI(); save(); });
    if (restart) restart.addEventListener('click', function () { try { audio.currentTime = 0; } catch (e) {} play(); });
    if (vol) vol.addEventListener('input', function () {
      audio.volume = Math.min(Math.max(parseInt(vol.value, 10) / 100 || 0, 0), 1);
      if (volText) volText.textContent = Math.round(audio.volume * 100) + '%';
      if (audio.volume > 0 && audio.muted) audio.muted = false;
      syncUI(); save();
    });
    if (volText && vol) volText.textContent = Math.round(audio.volume * 100) + '%';

    audio.addEventListener('play', syncUI);
    audio.addEventListener('pause', syncUI);
    audio.addEventListener('volumechange', syncUI);
    // 连播偶发失败时继续放
    audio.addEventListener('ended', function () { play(); });
    syncUI();

    /* 波形可视化：AnalyserNode 接入 MediaElementSource。
       若浏览器不支持（或创建失败），退化为一条呼吸的静态波形。 */
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var analyser = null, freq = null, ac = null;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ac = new AC();
        var src = ac.createMediaElementSource(audio);
        analyser = ac.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.82;
        src.connect(analyser);
        analyser.connect(ac.destination);
        freq = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch (e) { analyser = null; }
    if (analyser) {
      audio.addEventListener('play', function () { if (ac && ac.state === 'suspended') ac.resume(); });
    }

    var W = 0, H = 0;
    function fit() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    window.addEventListener('resize', fit, { passive: true });

    var phase = 0;
    (function draw() {
      requestAnimationFrame(draw);
      if (!W || document.hidden) return;
      phase += 0.02;
      var active = !audio.paused && !audio.ended && !audio.muted && audio.volume > 0;
      ctx.clearRect(0, 0, W, H);

      var bars = 56, gap = 3;
      var bw = (W - gap * (bars - 1)) / bars;
      if (bw < 1) { bars = Math.max(8, Math.floor(W / 4)); bw = (W - gap * (bars - 1)) / bars; }
      if (analyser && active) { analyser.getByteFrequencyData(freq); }

      for (var i = 0; i < bars; i++) {
        var v;
        if (analyser && active) {
          var idx = Math.floor(Math.pow(i / bars, 1.35) * (freq.length - 1));
          v = freq[idx] / 255;
        } else {
          var t = i / bars;
          v = 0.10 + 0.07 * Math.abs(Math.sin(t * 5.4 + phase)) + 0.05 * Math.abs(Math.sin(t * 11 + phase * 0.7));
        }
        var bh = Math.max(2, v * (H - 16));
        var x = i * (bw + gap);
        var y = H / 2 - bh / 2;
        var g = ctx.createLinearGradient(0, y, 0, y + bh);
        g.addColorStop(0, 'rgba(255,216,148,.92)');
        g.addColorStop(1, 'rgba(255,122,61,.75)');
        ctx.fillStyle = g;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, bw, bh, bw / 2); ctx.fill(); }
        else ctx.fillRect(x, y, bw, bh);
      }
    })();
  })();

  /* ---------------------------------------------------------
     4. 滚动入场（IntersectionObserver）
     --------------------------------------------------------- */
  var revealTargets = $$('.reveal, [data-split]');
  if (hasIO && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        if (el.classList.contains('timeline__item')) el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 进度条：近况的能力条 */
  if (hasIO) {
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); barIO.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    $$('.bar').forEach(function (el) { barIO.observe(el); });
  } else {
    $$('.bar').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------
     5. 数字滚动
     --------------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);            // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('.count');
  if (hasIO && counters.length) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cIO.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cIO.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  /* ---------------------------------------------------------
     6. 导航：吸顶 / 高亮 / 滑块 / 移动端菜单
     --------------------------------------------------------- */
  var nav        = $('#nav');
  var navLinks   = $('#navLinks');
  var navPill    = $('#navPill');
  var navToggle  = $('#navToggle');
  var toTop      = $('#toTop');
  var progress   = $('#scrollProgress');
  var sections   = $$('main section[id]');
  var links      = $$('#navLinks a');
  var activeLink = null;

  function setActive(link) {
    if (!link || link === activeLink) return;
    activeLink = link;
    links.forEach(function (a) { a.classList.toggle('is-active', a === link); });

    if (!navPill || !link) return;
    if (window.innerWidth <= 760) { navPill.classList.remove('is-on'); return; }
    var lr = link.getBoundingClientRect();
    var pr = navLinks.getBoundingClientRect();
    navPill.style.width = lr.width + 'px';
    navPill.style.transform = 'translate(' + (lr.left - pr.left) + 'px, -50%)';
    navPill.classList.add('is-on');
  }

  /* 移动端菜单 */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    });
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('is-locked');
      });
    });
  }

  /* 平滑滚动（兼容不支持 scroll-behavior 的浏览器） */
  var supportsSmooth = 'scrollBehavior' in document.documentElement.style;
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      ev.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navH - 14;
      window.scrollTo({ top: Math.max(top, 0), behavior: (reduceMotion || !supportsSmooth) ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* 当前区块高亮 */
  function updateActiveByViewport() {
    var navH = nav ? nav.offsetHeight : 68;
    var probe = window.pageYOffset + navH + window.innerHeight * 0.28;
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.offsetTop <= probe) current = s;
    });
    var link = links.filter(function (a) { return a.getAttribute('href') === '#' + current.id; })[0];
    setActive(link || links[0]);
  }

  /* ---------------------------------------------------------
     7. 统一滚动循环（rAF 节流，保证丝滑）
     --------------------------------------------------------- */
  var heroText  = $('.hero__text');
  var heroCard  = $('.hero__card');
  var heroSec   = $('.hero');
  var timelineFill = $('#timelineFill');
  var timelineWrap = $('.timeline');
  var ticking = false;
  var lastY = window.pageYOffset;

  function onFrame() {
    ticking = false;
    var y = window.pageYOffset;
    var vh = window.innerHeight;
    var doc = document.documentElement;
    var max = doc.scrollHeight - vh;
    var p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;

    /* 顶部进度条 */
    if (progress) progress.style.transform = 'scaleX(' + p + ')';

    /* 导航吸顶 + 回到顶部按钮 */
    if (nav) nav.classList.toggle('is-stuck', y > 18);
    if (toTop) toTop.classList.toggle('is-on', y > vh * 0.7);

    /* 首屏视差淡出 */
    if (!reduceMotion && heroSec) {
      var hp = Math.min(y / (vh * 0.95), 1);
      var fade = 1 - hp;
      if (heroText && hp < 1.05) {
        heroText.style.transform = 'translate3d(0,' + (-y * 0.16) + 'px,0) scale(' + (1 - hp * 0.05) + ')';
        heroText.style.opacity = Math.max(fade, 0);
        heroText.style.filter = hp > 0.55 ? 'blur(' + ((hp - 0.55) * 12).toFixed(2) + 'px)' : '';
      }
      if (heroCard && hp < 1.05) {
        heroCard.style.transform = 'translate3d(0,' + (-y * 0.06) + 'px,0)';
        heroCard.style.opacity = Math.max(1 - hp * 0.85, 0);
      }
      /* 背景光斑轻微反向移动 */
      var b1 = $('.backdrop__blob--1'), b2 = $('.backdrop__blob--2');
      if (b1) b1.style.marginTop = (-y * 0.08) + 'px';
      if (b2) b2.style.marginTop = (y * 0.06) + 'px';
    }

    /* 时间线进度 */
    if (timelineFill && timelineWrap) {
      var r = timelineWrap.getBoundingClientRect();
      var seen = (vh * 0.75 - r.top) / Math.max(r.height, 1);
      timelineFill.style.transform = 'scaleY(' + Math.min(Math.max(seen, 0), 1) + ')';
    }

    /* 滚动方向（供后续扩展），并更新导航高亮 */
    if (Math.abs(y - lastY) > 2) {
      updateActiveByViewport();
      lastY = y;
    }
  }

  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', function () {
    requestFrame();
    if (activeLink) { var a = activeLink; activeLink = null; setActive(a); }
  }, { passive: true });

  /* 初始状态 */
  onFrame();
  window.addEventListener('load', function () { onFrame(); updateActiveByViewport(); });
  updateActiveByViewport();

  /* ---------------------------------------------------------
     8. 卡片 3D 倾斜（鼠标跟随）
     --------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-tilt]').forEach(function (card) {
      var raf = null, tx = 0, ty = 0, curX = 0, curY = 0;

      function loop() {
        curX += (tx - curX) * 0.12;
        curY += (ty - curY) * 0.12;
        card.style.transform = 'perspective(900px) rotateY(' + curX.toFixed(3) + 'deg) rotateX(' + curY.toFixed(3) + 'deg) translateY(-6px)';
        if (Math.abs(tx - curX) > 0.01 || Math.abs(ty - curY) > 0.01) {
          raf = requestAnimationFrame(loop);
        } else {
          raf = null;
        }
      }

      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 11;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 11;
        if (!raf) raf = requestAnimationFrame(loop);
      });

      card.addEventListener('mouseleave', function () {
        tx = 0; ty = 0; curX = 0; curY = 0;
        card.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     9. 页脚年份
     --------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
