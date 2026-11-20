'use strict';

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var header = document.getElementById('site-header');
  var progressBar = document.getElementById('scroll-progress-bar');
  var backTop = document.getElementById('back-top');
  var year = document.getElementById('year');
  var processTrack = document.getElementById('process-track');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateChrome() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollHeight > 0 ? clamp(scrollTop / scrollHeight, 0, 1) : 0;

    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 12);
    }

    if (progressBar) {
      progressBar.style.width = (progress * 100).toFixed(2) + '%';
    }
  }

  var chromeTicking = false;
  window.addEventListener('scroll', function () {
    if (chromeTicking) {
      return;
    }

    chromeTicking = true;
    window.requestAnimationFrame(function () {
      updateChrome();
      chromeTicking = false;
    });
  }, { passive: true });

  updateChrome();

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    });
  }

  /* Reveal on scroll */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var serviceCards = Array.prototype.slice.call(document.querySelectorAll('.service-card'));
  var bentoCards = Array.prototype.slice.call(document.querySelectorAll('.bento-card'));

  serviceCards.forEach(function (card, index) {
    card.style.setProperty('--reveal-delay', (index % 3) * 65 + 'ms');
  });

  bentoCards.forEach(function (card, index) {
    card.style.setProperty('--reveal-delay', (index % 2) * 75 + 'ms');
  });

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px'
    });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* Service card spotlight */
  if (finePointer.matches && !reduceMotion.matches) {
    serviceCards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var mx = ((event.clientX - rect.left) / rect.width) * 100;
        var my = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', mx.toFixed(1) + '%');
        card.style.setProperty('--my', my.toFixed(1) + '%');
      });

      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
  }

  /* Magnetic hero button */
  var magneticButton = document.querySelector('.magnetic');

  if (magneticButton && finePointer.matches && !reduceMotion.matches) {
    magneticButton.addEventListener('pointermove', function (event) {
      var rect = magneticButton.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      var y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
      magneticButton.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    });

    magneticButton.addEventListener('pointerleave', function () {
      magneticButton.style.translate = '0px 0px';
    });
  }

  /* Process beam trigger */
  if (processTrack && 'IntersectionObserver' in window) {
    var processObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    processObserver.observe(processTrack);
  } else if (processTrack) {
    processTrack.classList.add('is-active');
  }

  /* FAQ accordion */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));

  faqItems.forEach(function (item) {
    var button = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');

    if (!button || !answer) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        var otherButton = other.querySelector('.faq-question');
        if (otherButton) {
          otherButton.setAttribute('aria-expanded', 'false');
        }
      });

      if (!isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Contact form */
  var leadForm = document.getElementById('lead-form');
  var nameField = document.getElementById('lead-name');
  var contactField = document.getElementById('lead-contact');
  var serviceField = document.getElementById('lead-service');
  var statusBox = document.getElementById('form-status');
  var fallbackBox = document.getElementById('form-fallback');
  var telegramLink = document.getElementById('form-telegram-link');
  var copyButton = document.getElementById('copy-request');
  var generatedMessage = '';

  function setFieldError(input, message) {
    if (!input) {
      return;
    }

    var field = input.closest('.field');
    var error = document.getElementById(input.id + '-error');

    if (field) {
      field.classList.toggle('has-error', Boolean(message));
    }

    if (error) {
      error.textContent = message || '';
    }

    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateForm() {
    var errors = [];
    var nameValue = nameField ? nameField.value.trim() : '';
    var contactValue = contactField ? contactField.value.trim() : '';
    var serviceValue = serviceField ? serviceField.value : '';

    setFieldError(nameField, '');
    setFieldError(contactField, '');
    setFieldError(serviceField, '');

    if (nameValue.length < 2) {
      setFieldError(nameField, 'Укажите имя, минимум 2 символа.');
      errors.push(nameField);
    }

    if (contactValue.length < 3) {
      setFieldError(contactField, 'Укажите Telegram или телефон для связи.');
      errors.push(contactField);
    }

    if (!serviceValue) {
      setFieldError(serviceField, 'Выберите услугу из списка.');
      errors.push(serviceField);
    }

    if (errors.length > 0) {
      errors[0].focus();
      return false;
    }

    return true;
  }

  function buildMessage() {
    return [
      'Здравствуйте! Хочу обсудить проект.',
      'Имя: ' + nameField.value.trim(),
      'Контакт: ' + contactField.value.trim(),
      'Услуга: ' + serviceField.value
    ].join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        document.execCommand('copy');
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!validateForm()) {
        if (statusBox) {
          statusBox.hidden = true;
        }
        return;
      }

      generatedMessage = buildMessage();
      var telegramUrl = 'https://t.me/samola13?text=' + encodeURIComponent(generatedMessage);

      if (telegramLink) {
        telegramLink.href = telegramUrl;
      }

      if (fallbackBox) {
        fallbackBox.hidden = false;
      }

      if (statusBox) {
        statusBox.hidden = false;
        statusBox.textContent = 'Заявка сформирована. Откройте Telegram и отправьте готовое сообщение. Если окно не открылось, используйте кнопку ниже.';
      }

      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    });

    [nameField, contactField, serviceField].forEach(function (field) {
      if (!field) {
        return;
      }

      field.addEventListener('input', function () {
        setFieldError(field, '');
      });

      field.addEventListener('change', function () {
        setFieldError(field, '');
      });
    });
  }

  if (copyButton) {
    copyButton.addEventListener('click', function () {
      if (!generatedMessage) {
        return;
      }

      copyText(generatedMessage).then(function () {
        copyButton.textContent = 'Текст скопирован';
        window.setTimeout(function () {
          copyButton.textContent = 'Скопировать текст заявки';
        }, 2200);
      }).catch(function () {
        copyButton.textContent = 'Не удалось скопировать';
      });
    });
  }

  /* Request buttons send service to form */
  var requestButtons = Array.prototype.slice.call(document.querySelectorAll('.card-request'));
  var contactSection = document.getElementById('contacts');

  requestButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var service = button.getAttribute('data-service');

      if (serviceField && service) {
        serviceField.value = service;
        setFieldError(serviceField, '');
      }

      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
          block: 'center'
        });
      }

      if (nameField) {
        window.setTimeout(function () {
          nameField.focus({ preventScroll: true });
        }, reduceMotion.matches ? 0 : 520);
      }
    });
  });

  /* Phone-friendly formatting for local numbers */
  if (contactField) {
    contactField.addEventListener('input', function () {
      var value = contactField.value;

      if (!/^[+]?[\d\s()-]+$/.test(value) || value.trim().length < 3) {
        return;
      }

      var digits = value.replace(/\D/g, '');
      if (digits.indexOf('375') !== 0) {
        return;
      }

      var local = digits.slice(3, 12);
      var formatted = '+375';
      if (local.length > 0) {
        formatted += ' (' + local.slice(0, 2);
      }
      if (local.length >= 2) {
        formatted += ') ' + local.slice(2, 5);
      }
      if (local.length >= 5) {
        formatted += '-' + local.slice(5, 7);
      }
      if (local.length >= 7) {
        formatted += '-' + local.slice(7, 9);
      }

      contactField.value = formatted;
    });
  }

  /* 3D polyhedral gyroscope core */
  var canvas = document.getElementById('gyro-canvas');
  var frame = document.getElementById('core-frame');

  if (canvas && frame && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var dpr = 1;
    var centerX = 0;
    var centerY = 0;
    var coreRadius = 1;
    var lastFrame = 0;
    var rafId = 0;
    var isVisible = true;
    var pageVisible = !document.hidden;
    var tiltX = 0.18;
    var tiltY = 0;
    var targetTiltX = 0.18;
    var targetTiltY = 0;
    var rippleStart = 0;
    var scanUntil = 0;
    var animationClock = 0;

    var phi = (1 + Math.sqrt(5)) / 2;
    var rawVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    var vertices = rawVertices.map(function (point) {
      var length = Math.sqrt(point[0] * point[0] + point[1] * point[1] + point[2] * point[2]);
      return [point[0] / length, point[1] / length, point[2] / length];
    });

    var edges = [];
    for (var i = 0; i < rawVertices.length; i += 1) {
      for (var j = i + 1; j < rawVertices.length; j += 1) {
        var dx = rawVertices[i][0] - rawVertices[j][0];
        var dy = rawVertices[i][1] - rawVertices[j][1];
        var dz = rawVertices[i][2] - rawVertices[j][2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 2.05) {
          edges.push([i, j]);
        }
      }
    }

    var rings = [
      { radius: 1.42, tiltX: 1.16, tiltZ: 0.16, speed: 0.00042, phase: 0.4, color: 'cyan', size: 2.8 },
      { radius: 1.68, tiltX: -0.62, tiltZ: 0.84, speed: -0.00031, phase: 2.4, color: 'blue', size: 2.3 },
      { radius: 1.9, tiltX: 0.38, tiltZ: -1.02, speed: 0.00024, phase: 4.1, color: 'cyan', size: 2.1 }
    ];

    function rotateX(point, angle) {
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      return [point[0], point[1] * cos - point[2] * sin, point[1] * sin + point[2] * cos];
    }

    function rotateY(point, angle) {
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      return [point[0] * cos + point[2] * sin, point[1], -point[0] * sin + point[2] * cos];
    }

    function rotateZ(point, angle) {
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      return [point[0] * cos - point[1] * sin, point[0] * sin + point[1] * cos, point[2]];
    }

    function resizeCanvas() {
      var rect = frame.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width / 2;
      centerY = height / 2;
      coreRadius = Math.min(width, height) * 0.205;

      if (reduceMotion.matches) {
        drawScene(1200, true);
      }
    }

    function project(point) {
      var focal = Math.min(width, height) * 1.62;
      var scale = focal / (focal + point[2] * coreRadius * 1.25);
      return {
        x: centerX + point[0] * coreRadius * scale,
        y: centerY + point[1] * coreRadius * scale,
        z: point[2],
        scale: scale
      };
    }

    function depthT(point) {
      return clamp((point[2] + 1.05) / 2.1, 0, 1);
    }

    function ringPoint(ring, angle, time) {
      var point = [Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0];
      point = rotateX(point, ring.tiltX);
      point = rotateZ(point, ring.tiltZ);
      point = rotateY(point, time * 0.00008 + ring.tiltZ * 0.25);
      point = rotateX(point, tiltX * 0.7);
      point = rotateY(point, tiltY + time * 0.0001);
      return point;
    }

    function drawRing(ring, time, now, staticMode) {
      var segments = 72;
      var points = [];
      var isBlue = ring.color === 'blue';
      var lineRgb = isBlue ? '37, 99, 235' : '56, 189, 248';

      for (var a = 0; a <= segments; a += 1) {
        var angle = (a / segments) * Math.PI * 2;
        var point = ringPoint(ring, angle, time);
        points.push(point);
      }

      for (var b = 1; b < points.length; b += 1) {
        var p1 = project(points[b - 1]);
        var p2 = project(points[b]);
        var depth = depthT(points[b]);
        var alpha = 0.14 + depth * 0.56;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(' + lineRgb + ', ' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 0.9 + depth * 0.5;
        ctx.stroke();
      }

      var nodeCount = 3;
      for (var n = 0; n < nodeCount; n += 1) {
        var nodeAngle = (staticMode ? ring.phase : time * ring.speed) + ring.phase + n * (Math.PI * 2 / nodeCount);
        var node3d = ringPoint(ring, nodeAngle, time);
        var node = project(node3d);
        var nodeDepth = depthT(node3d);
        var scanActive = !staticMode && now < scanUntil;
        var size = ring.size * (0.72 + nodeDepth * 0.62) * (scanActive && n === 0 ? 1.55 : 1);
        var nodeColor = n === 1 ? '#FFFFFF' : (isBlue ? '#2563EB' : '#38BDF8');

        ctx.beginPath();
        ctx.fillStyle = nodeColor;
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (scanActive && n === 0) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.lineWidth = 1;
          ctx.arc(node.x, node.y, size * 3.4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    function drawScene(now, staticMode) {
      ctx.clearRect(0, 0, width, height);

      var time = staticMode ? 1200 : now;
      var rotationY = tiltY + Math.sin(time * 0.00011) * 0.05;
      var rotationX = tiltX + Math.cos(time * 0.00009) * 0.04;
      var rotationZ = time * 0.00006;

      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.strokeStyle = 'rgba(54, 67, 89, 0.72)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius * 1.52, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(40, 50, 68, 0.82)';
      ctx.beginPath();
      ctx.moveTo(-coreRadius * 2.1, 0);
      ctx.lineTo(coreRadius * 2.1, 0);
      ctx.moveTo(0, -coreRadius * 2.1);
      ctx.lineTo(0, coreRadius * 2.1);
      ctx.stroke();
      ctx.restore();

      rings.forEach(function (ring) {
        drawRing(ring, time, now, staticMode);
      });

      var transformed = vertices.map(function (point) {
        var rotated = rotateX(point, rotationX);
        rotated = rotateY(rotated, rotationY);
        rotated = rotateZ(rotated, rotationZ);
        return rotated;
      });

      var projected = transformed.map(project);
      var edgeData = edges.map(function (edge) {
        var a = transformed[edge[0]];
        var b = transformed[edge[1]];
        return {
          a: projected[edge[0]],
          b: projected[edge[1]],
          z: (a[2] + b[2]) / 2,
          index: edge[0] + edge[1]
        };
      }).sort(function (a, b) {
        return a.z - b.z;
      });

      edgeData.forEach(function (edge) {
        var depth = clamp((edge.z + 1.05) / 2.1, 0, 1);
        var isFront = depth > 0.5;
        ctx.beginPath();
        ctx.moveTo(edge.a.x, edge.a.y);
        ctx.lineTo(edge.b.x, edge.b.y);
        ctx.strokeStyle = isFront
          ? 'rgba(248, 250, 252, 0.6)'
          : 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = isFront ? 1.15 : 0.7;
        ctx.stroke();
      });

      var vertexData = transformed.map(function (point, index) {
        return {
          point: point,
          screen: projected[index],
          depth: clamp((point[2] + 1.05) / 2.1, 0, 1),
          index: index
        };
      }).sort(function (a, b) {
        return a.point[2] - b.point[2];
      });

      vertexData.forEach(function (vertex) {
        var radius = 1.2 + vertex.depth * 1.9;
        ctx.beginPath();
        ctx.globalAlpha = 0.48 + vertex.depth * 0.52;
        ctx.fillStyle = vertex.index % 3 === 0 ? '#38BDF8' : '#2563EB';
        ctx.arc(vertex.screen.x, vertex.screen.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      if (!staticMode && rippleStart > 0) {
        var progress = (now - rippleStart) / 950;
        if (progress <= 1) {
          var rippleRadius = (0.15 + progress * 0.8) * Math.min(width, height);
          var alpha = (1 - progress) * 0.55;

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(56, 189, 248, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1.4;
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(248, 250, 252, ' + (alpha * 0.22).toFixed(3) + ')';
          ctx.lineWidth = 0.8;
          ctx.arc(centerX, centerY, rippleRadius * 0.78, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          rippleStart = 0;
        }
      }
    }

    function animate(now) {
      if (!isVisible || !pageVisible || reduceMotion.matches) {
        rafId = 0;
        return;
      }

      if (!lastFrame) {
        lastFrame = now;
      }

      var delta = Math.min(now - lastFrame, 42);
      lastFrame = now;
      animationClock += delta;

      tiltX += (targetTiltX - tiltX) * 0.035;
      tiltY += (targetTiltY - tiltY) * 0.035;

      drawScene(now, false);
      rafId = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (reduceMotion.matches || rafId) {
        return;
      }

      lastFrame = 0;
      rafId = window.requestAnimationFrame(animate);
    }

    function stopAnimation() {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    frame.addEventListener('pointermove', function (event) {
      if (reduceMotion.matches) {
        return;
      }

      var rect = canvas.getBoundingClientRect();
      targetTiltY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.55;
      targetTiltX = 0.18 + ((event.clientY - rect.top) / rect.height - 0.5) * 0.45;
    });

    frame.addEventListener('pointerleave', function () {
      targetTiltX = 0.18;
      targetTiltY = 0;
    });

    frame.addEventListener('pointerdown', function () {
      if (reduceMotion.matches) {
        return;
      }

      rippleStart = performance.now();
      scanUntil = performance.now() + 1000;
    });

    if ('IntersectionObserver' in window) {
      var canvasObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      }, { threshold: 0.08 });

      canvasObserver.observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      pageVisible = !document.hidden;
      if (pageVisible && isVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });

    if ('ResizeObserver' in window) {
      var resizeObserver = new ResizeObserver(function () {
        resizeCanvas();
      });
      resizeObserver.observe(frame);
    } else {
      window.addEventListener('resize', resizeCanvas);
    }

    resizeCanvas();

    if (reduceMotion.matches) {
      drawScene(1200, true);
    } else {
      startAnimation();
    }

    reduceMotion.addEventListener('change', function (event) {
      if (event.matches) {
        stopAnimation();
        drawScene(1200, true);
      } else {
        startAnimation();
      }
    });
  }
})();


