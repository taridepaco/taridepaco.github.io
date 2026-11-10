/* La isla: una escena three.js dibujada a baja resolución y pasada por un tramado ordenado.
   Uso: var isla = Island.create(screenEl, projects, onPick); isla.face(i) gira hasta el habitante i.
   Cada proyecto con un constructor en BUILD (por id) tiene su figura; el resto recibe un cartel. */
(function () {
  "use strict";
  var PIXEL = 2; // píxeles de pantalla por píxel de la isla

  function create(screen, projects, onPick) {
    if (typeof THREE === "undefined") return null;
    var canvas = screen.querySelector("canvas"), renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false }); } catch (e) { return null; }
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene(), world = new THREE.Group();
    scene.add(world);
    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 80);
    cam.position.set(0, 9, 13);
    cam.lookAt(0, 1.7, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5a66, 0.72));
    var sun = new THREE.DirectionalLight(0xffffff, 0.75);
    sun.position.set(-5, 8, 4);
    scene.add(sun);

    /* ---------- utilidades ---------- */
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function sstep(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    // altura del terreno: prado ondulado, una montaña y una loma
    function hAt(x, z) {
      var r = Math.sqrt(x * x + z * z), m = sstep(5.0, 3.3, r);
      var n = Math.sin(x * 1.7 + 1.3) * Math.cos(z * 1.3 - 0.7) * 0.5 + Math.sin(x * 3.1 - z * 2.3) * 0.25;
      var h = 0.42 + 0.22 * n +
        3.5 * Math.exp(-((x + 1.6) * (x + 1.6) + (z + 1.2) * (z + 1.2)) / 1.5) +
        0.9 * Math.exp(-((x - 2.4) * (x - 2.4) + (z + 1.8) * (z + 1.8)) / 1.3);
      return m * h - (1 - m) * 0.5;
    }
    var mats = {};
    function mat(c) { return mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c })); }
    function box(w, h, d, c) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); }
    function facet(g) { g = g.toNonIndexed(); g.computeVertexNormals(); return g; }
    function put(o, x, z, dy) { o.position.set(x, hAt(x, z) + (dy || 0), z); world.add(o); return o; }

    /* ---------- terreno ---------- */
    (function () {
      var g = new THREE.PlaneGeometry(12, 12, 44, 44);
      g.rotateX(-Math.PI / 2);
      var p = g.attributes.position, i, x, z, r;
      for (i = 0; i < p.count; i++) {
        x = p.getX(i); z = p.getZ(i); r = Math.sqrt(x * x + z * z);
        if (r > 5.7) { x *= 5.7 / r; z *= 5.7 / r; p.setX(i, x); p.setZ(i, z); }
        p.setY(i, hAt(x, z));
      }
      g = g.toNonIndexed();
      p = g.attributes.position;
      var col = new Float32Array(p.count * 3), c = new THREE.Color();
      for (i = 0; i < p.count; i += 3) {
        var y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3;
        c.set(y < 0.2 ? 0xe8d69a : y < 1.05 ? 0x74b34e : y < 1.7 ? 0x4f8f47 : y < 2.9 ? 0x8d8f86 : 0xf4f6f2);
        for (var k = 0; k < 3; k++) { col[(i + k) * 3] = c.r; col[(i + k) * 3 + 1] = c.g; col[(i + k) * 3 + 2] = c.b; }
      }
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      g.computeVertexNormals();
      world.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })));
      var sea = new THREE.Mesh(new THREE.CircleGeometry(6, 28), mat(0x2f7e96));
      sea.rotation.x = -Math.PI / 2;
      world.add(sea);
      var base = new THREE.Mesh(facet(new THREE.CylinderGeometry(6, 5.1, 1.5, 28)), mat(0x6a4a33));
      base.position.y = -0.76;
      world.add(base);
    })();

    /* ---------- habitantes ---------- */
    var steps = []; // funciones (t, dt) que animan cada habitante
    var Z = new THREE.Vector3(0, 0, 1);
    var BUILD = {
      boider: function () {
        var boids = [], C = new THREE.Vector3(0.5, 3.6, 0.5), g = new THREE.ConeGeometry(0.07, 0.24, 4);
        g.rotateX(Math.PI / 2);
        for (var i = 0; i < 34; i++) {
          var m = new THREE.Mesh(g, mat(0x24313a));
          m.position.set(C.x + (rnd() - 0.5) * 3, C.y + (rnd() - 0.5) * 1.2, C.z + (rnd() - 0.5) * 3);
          m.userData.v = new THREE.Vector3(rnd() - 0.5, 0, rnd() - 0.5).normalize();
          world.add(m); boids.push(m);
        }
        var tv = new THREE.Vector3(), ta = new THREE.Vector3(), tc = new THREE.Vector3(), ts = new THREE.Vector3();
        steps.push(function (t, dt) {
          for (var i = 0; i < boids.length; i++) {
            var b = boids[i], p = b.position, v = b.userData.v, n = 0;
            ta.set(0, 0, 0); tc.set(0, 0, 0); ts.set(0, 0, 0);
            for (var j = 0; j < boids.length; j++) {
              if (i === j) continue;
              var q = boids[j].position, d = p.distanceTo(q);
              if (d < 1.1) {
                n++; ta.add(boids[j].userData.v); tc.add(q);
                if (d < 0.35) ts.add(tv.copy(p).sub(q).multiplyScalar(1 / (d + 0.01)));
              }
            }
            if (n) {
              v.addScaledVector(ta.multiplyScalar(1 / n).sub(v), 0.9 * dt);   // alineación
              v.addScaledVector(tc.multiplyScalar(1 / n).sub(p), 0.5 * dt);   // cohesión
              v.addScaledVector(ts, 0.9 * dt);                                // separación
            }
            tv.copy(C).sub(p); tv.y *= 3;
            var far = tv.length();
            if (far > 2.3) v.addScaledVector(tv, 0.5 * dt * (far - 2.3));
            v.normalize(); p.addScaledVector(v, 1.5 * dt);
            b.quaternion.setFromUnitVectors(Z, v);
          }
        });
      },

      life: function () {
        var N = 7, cells = [], grid = [], acc = 0, same = 0, i;
        for (i = 0; i < N * N; i++) {
          var c = box(0.15, 0.1, 0.15, 0xfff3b0);
          put(c, 0.4 + (i % N - 3) * 0.2, 1.9 + (Math.floor(i / N) - 3) * 0.2, 0.06);
          cells.push(c); grid.push(rnd() < 0.4 ? 1 : 0);
        }
        function gen() {
          var nx = [], pop = 0, chg = 0, i;
          for (i = 0; i < N * N; i++) {
            var x = i % N, y = Math.floor(i / N), n = 0;
            for (var a = -1; a < 2; a++) for (var b = -1; b < 2; b++) if (a || b) n += grid[((y + a + N) % N) * N + (x + b + N) % N];
            var v = (n === 3 || (n === 2 && grid[i])) ? 1 : 0;
            nx.push(v); pop += v; if (v !== grid[i]) chg++;
          }
          same = chg ? 0 : same + 1;
          if (!pop || same > 1) { for (i = 0; i < nx.length; i++) nx[i] = Math.random() < 0.4 ? 1 : 0; same = 0; }
          grid = nx;
          for (i = 0; i < nx.length; i++) cells[i].visible = !!nx[i];
        }
        gen();
        steps.push(function (t, dt) { acc += dt; if (acc > 0.7) { acc = 0; gen(); } });
      },

      ants: function () {
        var ants = [], path = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-2.9, 0, 1.6), new THREE.Vector3(-1.9, 0, 1.7),
          new THREE.Vector3(-1.9, 0, 2.6), new THREE.Vector3(-0.9, 0, 3.2)]);
        put(new THREE.Mesh(facet(new THREE.ConeGeometry(0.32, 0.34, 6)), mat(0x8a5a36)), -2.9, 1.6, 0.14);
        put(box(0.2, 0.2, 0.2, 0xd9442e), -0.9, 3.2, 0.1);
        for (var i = 0; i < 14; i++) { var a = box(0.07, 0.06, 0.07, 0x1c1a1a); world.add(a); ants.push(a); }
        steps.push(function (t) {
          for (var i = 0; i < ants.length; i++) {
            var u = (t * 0.07 + i / ants.length) % 1;
            if (i % 2) u = 1 - u;
            var p = path.getPoint(u), o = (i % 2 ? 0.06 : -0.06);
            ants[i].position.set(p.x + o, hAt(p.x + o, p.z) + 0.04, p.z);
          }
        });
      },

      prey: function () {
        var C = [2.0, 2.6], rabbits = [];
        function spot() { var a = rnd() * 6.283, r = rnd() * 0.9; return [C[0] + Math.cos(a) * r, C[1] + Math.sin(a) * r]; }
        for (var i = 0; i < 5; i++) {
          var r = box(0.13, 0.13, 0.17, 0xf6f2ea), s = spot();
          r.userData = { x: s[0], z: s[1], t: spot(), ph: rnd() * 6 };
          world.add(r); rabbits.push(r);
        }
        var fox = box(0.15, 0.15, 0.3, 0xe0622a);
        fox.userData = { x: C[0] + 1, z: C[1] };
        world.add(fox);
        steps.push(function (t, dt) {
          var f = fox.userData, best = null, bd = 9;
          rabbits.forEach(function (r) {
            var u = r.userData, dx = u.t[0] - u.x, dz = u.t[1] - u.z, d = Math.hypot(dx, dz);
            var fd = Math.hypot(u.x - f.x, u.z - f.z);
            if (fd < bd) { bd = fd; best = u; }
            if (fd < 0.12) { var s = spot(); u.x = s[0]; u.z = s[1]; u.t = spot(); return; } // cazado: nace otro
            if (d < 0.08 || (fd < 0.6 && dt && Math.random() < 0.05)) u.t = spot();
            else { u.x += dx / d * 0.55 * dt; u.z += dz / d * 0.55 * dt; }
            r.position.set(u.x, hAt(u.x, u.z) + 0.07 + Math.abs(Math.sin(t * 7 + u.ph)) * 0.12, u.z);
          });
          if (best && bd > 0.01) {
            f.x += (best.x - f.x) / bd * 0.42 * dt; f.z += (best.z - f.z) / bd * 0.42 * dt;
            fox.rotation.y = Math.atan2(best.x - f.x, best.z - f.z);
          }
          fox.position.set(f.x, hAt(f.x, f.z) + 0.08, f.z);
        });
      },

      fractal: function () {
        function grow(parent, len, depth) {
          var b = box(len * 0.14, len, len * 0.14, 0x6b4a2f);
          b.position.y = len / 2; parent.add(b);
          if (!depth) { var l = box(len * 0.9, len * 0.9, len * 0.9, 0xe9879a); l.position.y = len; parent.add(l); return; }
          for (var k = 0; k < 3; k++) {
            var g = new THREE.Group();
            g.position.y = len; g.rotation.y = k * 2.094 + depth; g.rotation.z = 0.62;
            parent.add(g); grow(g, len * 0.66, depth - 1);
          }
        }
        var t = new THREE.Group();
        grow(t, 0.75, 3);
        put(t, 3.0, 0.6, 0);
      },

      sudoker: function () {
        for (var i = 0; i < 9; i++) {
          var h = 0.1 + ((i * 5) % 9) * 0.035;
          put(box(0.2, h, 0.2, i % 2 ? 0xb8bcb4 : 0x9ea39b), 0.9 + (i % 3 - 1) * 0.25, -3.0 + (Math.floor(i / 3) - 1) * 0.25, h / 2);
        }
      },

      datos: function () {
        var g = new THREE.Group();
        var w = box(0.7, 0.42, 0.55, 0xc98d4f); w.position.y = 0.21; g.add(w);
        var roofG = new THREE.ConeGeometry(0.6, 0.34, 4); roofG.rotateY(Math.PI / 4);
        var roof = new THREE.Mesh(facet(roofG), mat(0x8c3a2f)); roof.position.y = 0.59; g.add(roof);
        var mast = box(0.04, 0.9, 0.04, 0x2b2f33); mast.position.set(0.5, 0.45, 0); g.add(mast);
        var lamp = box(0.11, 0.11, 0.11, 0xd9442e); lamp.position.set(0.5, 0.95, 0); g.add(lamp);
        put(g, 2.4, -1.8, 0);
        steps.push(function (t) { lamp.visible = (t % 1.4) < 0.9; });
      },

      yo: function () {
        put(box(0.04, 0.55, 0.04, 0x2b2f33), -1.6, -1.2, 0.25);
        put(box(0.26, 0.16, 0.03, 0xd9442e), -1.46, -1.2, 0.44);
        var cols = [0xf2b63d, 0xd9442e, 0x3a7bd5]; // presas de la vía
        for (var i = 0; i < 9; i++) {
          var u = i / 9;
          put(box(0.08, 0.08, 0.08, cols[i % 3]), -1.15 - 0.42 * u + Math.sin(i * 1.3) * 0.1, 0.25 - 1.35 * u, 0.03);
        }
        var g = new THREE.ConeGeometry(0.2, 0.5, 3); g.rotateX(Math.PI / 2); g.scale(1.6, 0.25, 1);
        var glider = new THREE.Mesh(facet(g), mat(0xfaf6ea));
        world.add(glider);
        steps.push(function (t) {
          var a = t * 0.5;
          glider.position.set(-1.6 + Math.cos(a) * 2.4, 4.9 + Math.sin(a * 2) * 0.2, -1.2 + Math.sin(a) * 2.4);
          glider.rotation.set(0, -a, 0.35);
        });
      }
    };
    function signpost(p) {
      var g = new THREE.Group();
      var pole = box(0.05, 0.5, 0.05, 0x6b4a2f); pole.position.y = 0.25; g.add(pole);
      var sign = box(0.34, 0.2, 0.05, 0xf2b63d); sign.position.y = 0.5; g.add(sign);
      put(g, p.at[0], p.at[2], 0);
    }
    projects.forEach(function (p) { (BUILD[p.id] || signpost)(p); });

    // pinos, lejos de los habitantes
    (function () {
      var spots = projects.map(function (p) { return [p.at[0], p.at[2]]; }).concat([[-0.9, 3.2], [-1.9, 2.4]]);
      var g = facet(new THREE.ConeGeometry(0.22, 0.6, 5)), n = 0, tries = 0;
      while (n < 16 && tries++ < 400) {
        var x = (rnd() - 0.5) * 8, z = (rnd() - 0.5) * 8, h = hAt(x, z);
        if (h < 0.35 || h > 1.5) continue;
        if (spots.some(function (s) { return Math.hypot(s[0] - x, s[1] - z) < 1.15; })) continue;
        var m = new THREE.Mesh(g, mat(0x2f6b3f));
        m.scale.setScalar(0.8 + rnd() * 0.7);
        put(m, x, z, 0.28 * m.scale.y);
        n++;
      }
    })();

    /* ---------- tramado: cielo en bandas y color reducido ---------- */
    var rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    var pScene = new THREE.Scene(), pCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    pScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      depthTest: false,
      uniforms: { t: { value: rt.texture }, skyA: { value: new THREE.Color("#62bcd6") }, skyB: { value: new THREE.Color("#d9f2de") } },
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader: [
        "precision mediump float;uniform sampler2D t;uniform vec3 skyA,skyB;varying vec2 vUv;",
        "float b2(vec2 a){a=floor(a);return fract(a.x/2.+a.y*a.y*.75);}",
        "float b4(vec2 a){return b2(.5*a)*.25+b2(a);}",
        "void main(){vec4 s=texture2D(t,vUv);float d=b4(gl_FragCoord.xy)-.5;",
        " float g=clamp(floor((vUv.y+d*.16)*7.)/6.,0.,1.);vec3 sky=mix(skyB,skyA,g);",
        " vec3 c=floor(s.rgb*5.+.5+d*.9)/5.;",
        " gl_FragColor=vec4(mix(sky,c,s.a),1.);}"].join("\n")
    })));

    /* ---------- marcadores ---------- */
    var marks = projects.map(function (p, i) {
      var m = document.createElement("button");
      m.type = "button"; m.className = "mk";
      m.innerHTML = "<span>" + (i + 1) + "</span>";
      m.addEventListener("click", function () { onPick(i); });
      screen.appendChild(m);
      return m;
    });

    var W = 1, H = 1;
    function resize() {
      var r = screen.getBoundingClientRect();
      W = r.width; H = r.height;
      var w = Math.max(2, Math.round(W / PIXEL)), h = Math.max(2, Math.round(H / PIXEL));
      renderer.setSize(w, h, false); rt.setSize(w, h);
      var asp = w / h, hh = Math.max(5.1, 6.7 / asp);
      cam.left = -hh * asp; cam.right = hh * asp; cam.top = hh; cam.bottom = -hh;
      cam.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(screen); else window.addEventListener("resize", resize);

    /* ---------- giro ---------- */
    var yaw = 0.5, yawTo = null, drag = null, idle = 0;
    screen.addEventListener("pointerdown", function (e) { if (e.target.closest(".mk")) return; drag = { x: e.clientX }; yawTo = null; });
    window.addEventListener("pointermove", function (e) { if (!drag) return; yaw += (e.clientX - drag.x) * 0.009; drag.x = e.clientX; idle = 0; });
    window.addEventListener("pointerup", function () { drag = null; });
    window.addEventListener("pointercancel", function () { drag = null; });

    /* ---------- bucle ---------- */
    var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var visible = true;
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(screen);
    var last = performance.now(), time = 0, pv = new THREE.Vector3();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var sdt = still ? 0 : dt;
      time += sdt; idle += dt;
      if (yawTo !== null) {
        var d = Math.atan2(Math.sin(yawTo - yaw), Math.cos(yawTo - yaw));
        yaw += d * Math.min(1, dt * 5);
        if (Math.abs(d) < 0.01) yawTo = null;
        idle = 0;
      } else if (!drag && idle > 2.5) yaw += sdt * 0.12;
      world.rotation.y = yaw;
      for (var s = 0; s < steps.length; s++) steps[s](time, sdt);
      renderer.setRenderTarget(rt); renderer.render(scene, cam);
      renderer.setRenderTarget(null); renderer.render(pScene, pCam);
      for (var i = 0; i < projects.length; i++) {
        pv.set(projects[i].at[0], projects[i].at[1], projects[i].at[2]);
        world.localToWorld(pv);
        var zf = pv.z;
        pv.project(cam);
        marks[i].style.transform = "translate(" + ((pv.x * 0.5 + 0.5) * W).toFixed(1) + "px," + ((-pv.y * 0.5 + 0.5) * H).toFixed(1) + "px)";
        marks[i].classList.toggle("far", zf < -1.5);
      }
    }
    requestAnimationFrame(frame);

    return {
      marks: marks,
      face: function (i) { yawTo = -Math.atan2(projects[i].at[0], projects[i].at[2]); }
    };
  }

  window.Island = { create: create };
})();
