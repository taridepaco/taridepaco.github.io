/* Contenido de la portada. Para añadir cosas se edita solo este archivo.

   PROJECTS: los habitantes de la isla.
     id     identificador; si js/island.js tiene un constructor con ese id, dibuja su figura.
            Si no lo tiene, aparece un cartel genérico en ese punto.
     at     [x, altura del marcador, z] dentro de la isla (radio útil ~3.3, altura del suelo 0.4-1).
     url    página del proyecto. Sin url se muestra como "En camino".
     name, kind, desc: texto, o {es, en}.

   NOTEBOOK: el cuaderno de datos, un número por investigación. El más reciente va arriba. */
window.SITE = {
  projects: [
    { id: "boider", name: "Boider", at: [0.5, 4.6, 0.5], url: "https://taridepaco.github.io/Boider/",
      kind: { es: "Simulador", en: "Simulator" },
      desc: { es: "Una bandada de boids: tres reglas locales y aparece el vuelo en grupo.",
              en: "A flock of boids: three local rules and group flight appears." } },
    { id: "life", name: "Game of Lifer", at: [0.4, 0.9, 1.9], url: "https://taridepaco.github.io/GameOfLifer/",
      kind: { es: "Simulador", en: "Simulator" },
      desc: { es: "El juego de la vida de Conway: células que nacen y mueren según sus vecinas.",
              en: "Conway's Game of Life: cells are born and die according to their neighbours." } },
    { id: "ants", name: { es: "Hormigas", en: "Ants" }, at: [-2.9, 1.0, 1.6],
      kind: { es: "Simulador", en: "Simulator" },
      desc: { es: "Hormigas que dejan feromonas y acaban trazando el camino más corto hasta la comida.",
              en: "Ants that lay pheromones and end up tracing the shortest path to food." } },
    { id: "prey", name: { es: "Cazador y presa", en: "Predator and prey" }, at: [2.0, 1.1, 2.6],
      kind: { es: "Simulador", en: "Simulator" },
      desc: { es: "Zorros, conejos y los ciclos de población de Lotka-Volterra.",
              en: "Foxes, rabbits and the Lotka-Volterra population cycles." } },
    { id: "fractal", name: "Fractal Designer", at: [3.0, 2.5, 0.6],
      kind: { es: "Generador", en: "Generator" },
      desc: { es: "Generador de fractales. Se está replantando desde cero.",
              en: "Fractal generator. Being replanted from scratch." } },
    { id: "sudoker", name: "Sudoker", at: [0.9, 1.0, -3.0], url: "https://github.com/taridepaco/Sudoker",
      kind: { es: "Juego", en: "Game" },
      desc: { es: "Genera sudokus listos para jugar y también los resuelve.",
              en: "Generates ready-to-play sudokus and solves them too." } },
    { id: "datos", name: { es: "Estación de datos", en: "Data station" }, at: [2.4, 2.6, -1.8], url: "#cuaderno",
      kind: { es: "Datos", en: "Data" },
      desc: { es: "Aquí se publica el cuaderno de datos: una investigación de data science al mes.",
              en: "The data notebook is published here: one data science investigation a month." } },
    { id: "yo", name: { es: "Sobre mí", en: "About me" }, at: [-1.6, 4.5, -1.2], about: true,
      kind: { es: "Cima", en: "Summit" },
      desc: { es: "Desarrollo el SDK de la app Android de DHIS2. Antes, un doctorado en propulsión y mucho CFD. Fuera de la pantalla: escalada, montaña, música, cine, electrónica y carpintería.",
              en: "I work on the SDK of the DHIS2 Android app. Before that, a PhD in propulsion and a lot of CFD. Away from the screen: climbing, mountains, music, films, electronics and woodworking." } }
  ],

  notebook: [
    { n: 1, date: "2026-11", title: "Music Topic Evolution", url: "https://taridepaco.github.io/MusicTopicEvolution/",
      desc: { es: "¿De qué hablan las canciones? Los temas de las letras de los grandes éxitos, década a década.",
              en: "What do songs talk about? The themes in hit lyrics, decade by decade." } }
  ],

  text: {
    es: {
      "nav.island": "Isla", "nav.notebook": "Cuaderno", "nav.contact": "Contacto",
      h1: "Una isla donde cada proyecto está vivo",
      pitch: "Simuladores, investigaciones de datos y cacharros. Arrastra para girar la isla y toca un número para ver quién vive ahí.",
      "nb.h": "Cuaderno de datos",
      "nb.p": "Una investigación de data science al mes.",
      "nb.read": "Leer la investigación",
      "ct.h": "Contacto",
      "ct.p": "¿Una idea, una duda o un simulador que debería existir? Escríbeme.",
      "f.name": "Nombre", "f.mail": "Correo", "f.msg": "Mensaje", "f.send": "Enviar",
      "f.sending": "Enviando…", "f.ok": "Mensaje enviado. Gracias, te contestaré pronto.",
      "f.err": "No se ha podido enviar. Prueba otra vez en un rato.",
      "ct.links": "También estoy en",
      foot: "Hecho a mano con three.js. Sin rastreadores.",
      "foot.code": "Código de esta página",
      open: "Abrir", live: "En línea", soon: "En camino", legend: "Habitantes de la isla",
      "theme.auto": "Tema: auto", "theme.light": "Tema: claro", "theme.dark": "Tema: oscuro"
    },
    en: {
      "nav.island": "Island", "nav.notebook": "Notebook", "nav.contact": "Contact",
      h1: "An island where every project is alive",
      pitch: "Simulators, data research and tinkering. Drag to spin the island and tap a number to see who lives there.",
      "nb.h": "Data notebook",
      "nb.p": "One data science investigation a month.",
      "nb.read": "Read the research",
      "ct.h": "Contact",
      "ct.p": "An idea, a question or a simulator that should exist? Write to me.",
      "f.name": "Name", "f.mail": "Email", "f.msg": "Message", "f.send": "Send",
      "f.sending": "Sending…", "f.ok": "Message sent. Thanks, I'll reply soon.",
      "f.err": "It could not be sent. Try again in a while.",
      "ct.links": "I'm also on",
      foot: "Handmade with three.js. No trackers.",
      "foot.code": "Source of this page",
      open: "Open", live: "Online", soon: "On its way", legend: "Island inhabitants",
      "theme.auto": "Theme: auto", "theme.light": "Theme: light", "theme.dark": "Theme: dark"
    }
  }
};
